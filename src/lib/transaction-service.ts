import { prisma } from "./prisma";
import { generatePin, hashPin } from "./pin";
import { sendEmail } from "./email";
import { generateSpaydQrDataUrl } from "./spayd";
import type { TransactionStatus } from "@prisma/client";

interface CreateTransactionInput {
  sellerEmail: string;
  sellerBankAccount: string;
  buyerEmail: string;
  amount: number;
  subject?: string;
  description?: string;
}

interface CreateTransactionResult {
  id: string;
  buyerPin: string;
  sellerPin: string;
}

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  WAITING_FOR_PAYMENT: ["PAID"],
  PAID: ["SHIPPED"],
  SHIPPED: ["SUCCESSFULLY_DELIVERED", "DISPUTED"],
  SUCCESSFULLY_DELIVERED: ["COMPLETED"],
  DISPUTED: ["COMPLETED"],
  COMPLETED: [],
};

export async function createTransaction(
  input: CreateTransactionInput
): Promise<CreateTransactionResult> {
  const buyerPin = generatePin();
  const sellerPin = generatePin();

  const transaction = await prisma.transaction.create({
    data: {
      sellerEmail: input.sellerEmail,
      sellerBankAccount: input.sellerBankAccount,
      buyerEmail: input.buyerEmail,
      amount: input.amount,
      subject: input.subject || null,
      description: input.description || null,
      pinCodeBuyer: hashPin(buyerPin),
      pinCodeSeller: hashPin(sellerPin),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const transactionUrl = `${baseUrl}/transaction/${transaction.id}`;

  // Generate SPAYD QR code for buyer
  const escrowIban = process.env.ESCROW_IBAN || "CZ0000000000000000000000";
  const qrDataUrl = await generateSpaydQrDataUrl({
    iban: escrowIban,
    amount: input.amount,
    message: `Escrow ${transaction.id.substring(0, 8)}`,
    variableSymbol: transaction.id.replace(/-/g, "").substring(0, 10),
  });

  // Email to buyer
  await sendEmail({
    to: input.buyerEmail,
    subject: "Platba v klidu – Nová transakce vytvořena",
    body: `Byla vytvořena nová escrow transakce.

Částka: ${input.amount} CZK
${input.subject ? `Předmět: ${input.subject}` : ""}

Váš PIN pro přístup k transakci: ${buyerPin}
Odkaz na transakci: ${transactionUrl}

QR kód pro platbu (SPAYD): ${qrDataUrl}

Prosím uhraďte částku na escrow účet. Po připsání platby budete informováni.`,
  });

  // Email to seller
  await sendEmail({
    to: input.sellerEmail,
    subject: "Platba v klidu – Nová transakce vytvořena",
    body: `Byla vytvořena nová escrow transakce.

Částka: ${input.amount} CZK
${input.subject ? `Předmět: ${input.subject}` : ""}

Váš PIN pro přístup k transakci: ${sellerPin}
Odkaz na transakci: ${transactionUrl}

⚠️ NEODESÍLEJTE ZBOŽÍ! Čekáme na potvrzení platby od kupujícího.`,
  });

  return {
    id: transaction.id,
    buyerPin,
    sellerPin,
  };
}

export function isValidTransition(
  from: TransactionStatus,
  to: TransactionStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function updateTransactionStatus(
  id: string,
  newStatus: TransactionStatus,
  isAdmin: boolean = false
): Promise<void> {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");

  // Admin can force PAID and COMPLETED transitions
  if (isAdmin) {
    if (
      (newStatus === "PAID" && transaction.status === "WAITING_FOR_PAYMENT") ||
      (newStatus === "COMPLETED" &&
        (transaction.status === "SUCCESSFULLY_DELIVERED" ||
          transaction.status === "DISPUTED"))
    ) {
      await prisma.transaction.update({
        where: { id },
        data: { status: newStatus },
      });
      await sendStatusChangeEmails(transaction.id, newStatus);
      return;
    }
  }

  if (!isValidTransition(transaction.status, newStatus)) {
    throw new Error(
      `Invalid transition from ${transaction.status} to ${newStatus}`
    );
  }

  await prisma.transaction.update({
    where: { id },
    data: { status: newStatus },
  });

  await sendStatusChangeEmails(id, newStatus);
}

export async function addTrackingId(
  id: string,
  trackingId: string
): Promise<void> {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");
  if (transaction.status !== "PAID") {
    throw new Error("Can only add tracking ID when status is PAID");
  }

  await prisma.transaction.update({
    where: { id },
    data: { trackingId, status: "SHIPPED" },
  });

  await sendStatusChangeEmails(id, "SHIPPED");
}

async function sendStatusChangeEmails(
  id: string,
  newStatus: TransactionStatus
): Promise<void> {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const transactionUrl = `${baseUrl}/transaction/${transaction.id}`;

  switch (newStatus) {
    case "PAID":
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Platba přijata",
        body: `Platba za transakci byla přijata!

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Prosím odešlete zboží a zadejte sledovací číslo zásilky.
Odkaz na transakci: ${transactionUrl}`,
      });
      break;

    case "SHIPPED":
      await sendEmail({
        to: transaction.buyerEmail,
        subject: "Platba v klidu – Zásilka odeslána",
        body: `Prodejce odeslal zásilku!

Sledovací číslo: ${transaction.trackingId}
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Po obdržení zásilky prosím potvrďte doručení nebo podejte reklamaci.
Odkaz na transakci: ${transactionUrl}`,
      });
      break;

    case "SUCCESSFULLY_DELIVERED":
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Doručení potvrzeno",
        body: `Kupující potvrdil doručení zásilky!

Částka ${transaction.amount} CZK bude brzy odeslána na váš účet.`,
      });
      break;

    case "DISPUTED":
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Reklamace",
        body: `Kupující podal reklamaci k transakci.

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Vyplatení je pozastaveno do vyřešení reklamace.`,
      });
      break;

    case "COMPLETED":
      const completionMsg = `Transakce byla úspěšně uzavřena.

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Děkujeme za použití služby Platba v klidu!`;

      await sendEmail({
        to: transaction.buyerEmail,
        subject: "Platba v klidu – Transakce uzavřena",
        body: completionMsg,
      });
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Transakce uzavřena",
        body: completionMsg,
      });
      break;
  }
}

export async function getTransactionForUser(
  id: string,
  email: string,
  pin: string
): Promise<{ transaction: Record<string, unknown>; role: "buyer" | "seller" } | null> {
  const { verifyPin } = await import("./pin");
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) return null;

  if (
    transaction.buyerEmail === email &&
    verifyPin(pin, transaction.pinCodeBuyer)
  ) {
    return {
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        subject: transaction.subject,
        description: transaction.description,
        status: transaction.status,
        trackingId: transaction.trackingId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
      role: "buyer",
    };
  }

  if (
    transaction.sellerEmail === email &&
    verifyPin(pin, transaction.pinCodeSeller)
  ) {
    return {
      transaction: {
        id: transaction.id,
        buyerEmail: transaction.buyerEmail,
        amount: transaction.amount,
        subject: transaction.subject,
        description: transaction.description,
        status: transaction.status,
        trackingId: transaction.trackingId,
        sellerBankAccount: transaction.sellerBankAccount,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
      role: "seller",
    };
  }

  return null;
}
