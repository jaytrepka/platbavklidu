import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.substring(7);
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const expectedToken = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return token === expectedToken;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: { transactionId: id, text, author: "admin", authorRole: "ADMIN" },
    });

    await prisma.auditLog.create({
      data: {
        transactionId: id,
        eventType: "COMMENT",
        actor: "admin",
        detail: text,
      },
    });

    // Email both buyer and seller
    const emailBody = `Nový komentář od administrátora k vaší transakci:

"${text}"

${transaction.subject ? `Předmět transakce: ${transaction.subject}` : ""}
Částka: ${transaction.amount} CZK`;

    await sendEmail({
      to: transaction.buyerEmail,
      subject: "Platba v klidu – Komentář od administrátora",
      body: emailBody,
    });

    await sendEmail({
      to: transaction.sellerEmail,
      subject: "Platba v klidu – Komentář od administrátora",
      body: emailBody,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
