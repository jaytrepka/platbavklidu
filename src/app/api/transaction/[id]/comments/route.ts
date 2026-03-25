import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const isBuyer = transaction.accessTokenBuyer === token;
    const isSeller = transaction.accessTokenSeller === token;
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { transactionId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, text: true, author: true, authorRole: true, createdAt: true },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token, text } = body;

    if (!token || !text?.trim()) {
      return NextResponse.json({ error: "Token and text are required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const isBuyer = transaction.accessTokenBuyer === token;
    const isSeller = transaction.accessTokenSeller === token;
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const authorRole = isBuyer ? "BUYER" : "SELLER";
    const author = isBuyer ? transaction.buyerEmail : transaction.sellerEmail;
    const recipientEmail = isBuyer ? transaction.sellerEmail : transaction.buyerEmail;

    const comment = await prisma.comment.create({
      data: {
        transactionId: id,
        text: text.trim(),
        author,
        authorRole,
      },
    });

    await prisma.auditLog.create({
      data: {
        transactionId: id,
        eventType: "COMMENT",
        actor: author,
        detail: text.trim(),
      },
    });

    // Email the other party
    await sendEmail({
      to: recipientEmail,
      subject: `Platba v klidu – Nový komentář k transakci`,
      body: `Nový komentář od ${authorRole === "BUYER" ? "kupujícího" : "prodávajícího"}:

"${text.trim()}"

${transaction.subject ? `Předmět transakce: ${transaction.subject}` : ""}
Částka: ${transaction.amount} CZK

Odpovězte prostřednictvím odkazu na transakci, který jste obdrželi e-mailem.`,
    });

    return NextResponse.json(
      { id: comment.id, text: comment.text, author: comment.author, authorRole: comment.authorRole, createdAt: comment.createdAt },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
