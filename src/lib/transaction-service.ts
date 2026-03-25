import { prisma } from "./prisma";
import { generateAccessToken, calculateFee, calculateTotalAmount } from "./pin";
import { sendEmail } from "./email";
import { generateSpaydQrDataUrl } from "./spayd";
import type { TransactionStatus } from "@prisma/client";

interface CreateTransactionInput {
  createdBy: "BUYER" | "SELLER";
  sellerEmail: string;
  sellerBankAccount?: string;
  buyerEmail: string;
  amount: number;
  subject?: string;
  description?: string;
}

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  WAITING_FOR_APPROVAL: ["WAITING_FOR_PAYMENT", "EXPIRED"],
  WAITING_FOR_PAYMENT: ["PAID", "EXPIRED"],
  PAID: ["SHIPPED"],
  SHIPPED: ["SUCCESSFULLY_DELIVERED", "DISPUTED"],
  SUCCESSFULLY_DELIVERED: ["COMPLETED"],
  DISPUTED: ["COMPLETED", "REFUNDED"],
  COMPLETED: [],
  REFUNDED: [],
  EXPIRED: [],
};

export async function createTransaction(input: CreateTransactionInput) {
  const buyerToken = generateAccessToken();
  const sellerToken = generateAccessToken();

  const transaction = await prisma.transaction.create({
    data: {
      createdBy: input.createdBy,
      sellerEmail: input.sellerEmail,
      sellerBankAccount: input.createdBy === "SELLER" ? (input.sellerBankAccount || null) : null,
      buyerEmail: input.buyerEmail,
      amount: input.amount,
      subject: input.subject || null,
      description: input.description || null,
      accessTokenBuyer: buyerToken,
      accessTokenSeller: sellerToken,
      status: "WAITING_FOR_APPROVAL",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const buyerLink = `${baseUrl}/transaction/${transaction.id}?token=${buyerToken}`;
  const sellerLink = `${baseUrl}/transaction/${transaction.id}?token=${sellerToken}`;

  const fee = calculateFee(input.amount);
  const totalAmount = calculateTotalAmount(input.amount);

  if (input.createdBy === "BUYER") {
    // Buyer created → email buyer their link, email seller to approve + enter bank account
    await sendEmail({
      to: input.buyerEmail,
      subject: "Platba v klidu – Transakce vytvořena",
      body: `Vytvořili jste novou escrow transakci.

Částka obchodu: ${input.amount} CZK
Servisní poplatek: ${fee} CZK
Celková částka: ${totalAmount} CZK
${input.subject ? `Předmět: ${input.subject}` : ""}

Čekáme na schválení prodávajícím. Po schválení obdržíte pokyny k platbě.

Váš odkaz na transakci: ${buyerLink}`,
    });

    await sendEmail({
      to: input.sellerEmail,
      subject: "Platba v klidu – Schválte transakci",
      body: `Kupující vytvořil novou escrow transakci a čeká na vaše schválení.

Částka obchodu: ${input.amount} CZK
${input.subject ? `Předmět: ${input.subject}` : ""}

Pro schválení klikněte na odkaz níže a zadejte číslo svého bankovního účtu:
${sellerLink}

⚠️ NEODESÍLEJTE ZBOŽÍ dokud neobdržíte potvrzení o zaplacení.`,
    });
  } else {
    // Seller created → email seller their link, email buyer to approve
    await sendEmail({
      to: input.sellerEmail,
      subject: "Platba v klidu – Transakce vytvořena",
      body: `Vytvořili jste novou escrow transakci.

Částka obchodu: ${input.amount} CZK
${input.subject ? `Předmět: ${input.subject}` : ""}

Čekáme na schválení kupujícím. Po schválení a zaplacení budete vyzváni k odeslání zboží.

Váš odkaz na transakci: ${sellerLink}`,
    });

    await sendEmail({
      to: input.buyerEmail,
      subject: "Platba v klidu – Schválte transakci",
      body: `Prodávající vytvořil novou escrow transakci a čeká na vaše schválení.

Částka obchodu: ${input.amount} CZK
Servisní poplatek: ${fee} CZK
Celková částka k úhradě: ${totalAmount} CZK
${input.subject ? `Předmět: ${input.subject}` : ""}

Pro schválení klikněte na odkaz níže:
${buyerLink}`,
    });
  }

  return { id: transaction.id };
}

export async function approveTransaction(
  id: string,
  token: string,
  bankAccount?: string
): Promise<void> {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");
  if (transaction.status !== "WAITING_FOR_APPROVAL") {
    throw new Error("Transaction is not waiting for approval");
  }

  const isBuyer = transaction.accessTokenBuyer === token;
  const isSeller = transaction.accessTokenSeller === token;
  if (!isBuyer && !isSeller) throw new Error("Invalid token");

  // The approver must be the OTHER party (not the creator)
  if (
    (transaction.createdBy === "BUYER" && isBuyer) ||
    (transaction.createdBy === "SELLER" && isSeller)
  ) {
    throw new Error("The creator cannot approve their own transaction");
  }

  // If buyer created, seller must provide bank account
  if (transaction.createdBy === "BUYER" && isSeller) {
    if (!bankAccount) throw new Error("Bank account is required for approval");
    await prisma.transaction.update({
      where: { id },
      data: { status: "WAITING_FOR_PAYMENT", sellerBankAccount: bankAccount },
    });
  } else {
    await prisma.transaction.update({
      where: { id },
      data: { status: "WAITING_FOR_PAYMENT" },
    });
  }

  // Send payment instructions to buyer
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const buyerLink = `${baseUrl}/transaction/${transaction.id}?token=${transaction.accessTokenBuyer}`;
  const escrowIban = process.env.ESCROW_IBAN || "CZ0000000000000000000000";
  const totalAmount = calculateTotalAmount(transaction.amount);
  const fee = calculateFee(transaction.amount);

  const qrDataUrl = await generateSpaydQrDataUrl({
    iban: escrowIban,
    amount: totalAmount,
    message: `Escrow ${transaction.id.substring(0, 8)}`,
    variableSymbol: transaction.id.replace(/-/g, "").substring(0, 10),
  });

  await sendEmail({
    to: transaction.buyerEmail,
    subject: "Platba v klidu – Transakce schválena, zaplaťte prosím",
    body: `Transakce byla schválena oběma stranami!

Částka obchodu: ${transaction.amount} CZK
Servisní poplatek: ${fee} CZK
Celková částka k úhradě: ${totalAmount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

QR kód pro platbu (SPAYD): ${qrDataUrl}

Odkaz na transakci: ${buyerLink}`,
  });

  // Notify seller
  const sellerLink = `${baseUrl}/transaction/${transaction.id}?token=${transaction.accessTokenSeller}`;
  await sendEmail({
    to: transaction.sellerEmail,
    subject: "Platba v klidu – Transakce schválena",
    body: `Transakce byla schválena! Čekáme na platbu od kupujícího.

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

⚠️ NEODESÍLEJTE ZBOŽÍ dokud neobdržíte potvrzení o zaplacení.

Odkaz na transakci: ${sellerLink}`,
  });
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

  if (isAdmin) {
    // Admin can force certain transitions
    const adminAllowed =
      (newStatus === "PAID" && transaction.status === "WAITING_FOR_PAYMENT") ||
      (newStatus === "COMPLETED" &&
        (transaction.status === "SUCCESSFULLY_DELIVERED" || transaction.status === "DISPUTED")) ||
      (newStatus === "REFUNDED" && transaction.status === "DISPUTED") ||
      (newStatus === "EXPIRED" &&
        (transaction.status === "WAITING_FOR_APPROVAL" || transaction.status === "WAITING_FOR_PAYMENT"));

    if (adminAllowed) {
      await prisma.transaction.update({ where: { id }, data: { status: newStatus } });
      await sendStatusChangeEmails(id, newStatus);
      return;
    }
  }

  if (!isValidTransition(transaction.status, newStatus)) {
    throw new Error(`Invalid transition from ${transaction.status} to ${newStatus}`);
  }

  await prisma.transaction.update({ where: { id }, data: { status: newStatus } });
  await sendStatusChangeEmails(id, newStatus);
}

export async function addTrackingId(id: string, trackingId?: string): Promise<void> {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");
  if (transaction.status !== "PAID") {
    throw new Error("Can only add tracking ID when status is PAID");
  }

  await prisma.transaction.update({
    where: { id },
    data: { trackingId: trackingId || null, status: "SHIPPED" },
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
  const buyerLink = `${baseUrl}/transaction/${transaction.id}?token=${transaction.accessTokenBuyer}`;
  const sellerLink = `${baseUrl}/transaction/${transaction.id}?token=${transaction.accessTokenSeller}`;

  switch (newStatus) {
    case "PAID":
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Platba přijata",
        body: `Platba za transakci byla přijata!

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Prosím odešlete zboží a zadejte sledovací číslo zásilky.
Odkaz na transakci: ${sellerLink}`,
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
Odkaz na transakci: ${buyerLink}`,
      });
      break;

    case "SUCCESSFULLY_DELIVERED":
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Doručení potvrzeno",
        body: `Kupující potvrdil doručení zásilky! Částka ${transaction.amount} CZK bude brzy odeslána na váš účet.`,
      });
      break;

    case "DISPUTED":
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Reklamace",
        body: `Kupující podal reklamaci k transakci.

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Vyplatění je pozastaveno do vyřešení reklamace.`,
      });
      break;

    case "COMPLETED": {
      const msg = `Transakce byla úspěšně uzavřena.

Částka: ${transaction.amount} CZK
${transaction.subject ? `Předmět: ${transaction.subject}` : ""}

Děkujeme za použití služby Platba v klidu!`;
      await sendEmail({ to: transaction.buyerEmail, subject: "Platba v klidu – Transakce uzavřena", body: msg });
      await sendEmail({ to: transaction.sellerEmail, subject: "Platba v klidu – Transakce uzavřena", body: msg });
      break;
    }

    case "REFUNDED":
      await sendEmail({
        to: transaction.buyerEmail,
        subject: "Platba v klidu – Peníze vráceny",
        body: `Částka ${transaction.amount} CZK byla vrácena na váš účet. Transakce byla uzavřena.`,
      });
      await sendEmail({
        to: transaction.sellerEmail,
        subject: "Platba v klidu – Transakce uzavřena (vrácení)",
        body: `Transakce byla uzavřena. Částka byla vrácena kupujícímu.`,
      });
      break;
  }
}

export async function getTransactionForUser(
  id: string,
  token: string
): Promise<{ transaction: Record<string, unknown>; role: "buyer" | "seller" } | null> {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return null;

  const isBuyer = transaction.accessTokenBuyer === token;
  const isSeller = transaction.accessTokenSeller === token;
  if (!isBuyer && !isSeller) return null;

  // Generate QR code for buyer if WAITING_FOR_PAYMENT
  let qrCodeDataUrl: string | null = null;
  if (isBuyer && transaction.status === "WAITING_FOR_PAYMENT") {
    const escrowIban = process.env.ESCROW_IBAN || "CZ0000000000000000000000";
    const totalAmount = calculateTotalAmount(transaction.amount);
    qrCodeDataUrl = await generateSpaydQrDataUrl({
      iban: escrowIban,
      amount: totalAmount,
      message: `Escrow ${transaction.id.substring(0, 8)}`,
      variableSymbol: transaction.id.replace(/-/g, "").substring(0, 10),
    });
  }

  // Determine if this user needs to approve
  const needsApproval = transaction.status === "WAITING_FOR_APPROVAL" &&
    ((transaction.createdBy === "BUYER" && isSeller) ||
     (transaction.createdBy === "SELLER" && isBuyer));

  // Determine if this user is the creator waiting for approval
  const waitingForOtherApproval = transaction.status === "WAITING_FOR_APPROVAL" &&
    ((transaction.createdBy === "BUYER" && isBuyer) ||
     (transaction.createdBy === "SELLER" && isSeller));

  return {
    transaction: {
      id: transaction.id,
      createdBy: transaction.createdBy,
      sellerEmail: transaction.sellerEmail,
      buyerEmail: transaction.buyerEmail,
      amount: transaction.amount,
      subject: transaction.subject,
      description: transaction.description,
      status: transaction.status,
      trackingId: transaction.trackingId,
      sellerBankAccount: isSeller ? transaction.sellerBankAccount : undefined,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      qrCodeDataUrl,
      needsApproval,
      waitingForOtherApproval,
      needsBankAccount: needsApproval && transaction.createdBy === "BUYER" && isSeller,
    },
    role: isBuyer ? "buyer" : "seller",
  };
}
