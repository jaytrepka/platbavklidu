import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/transaction-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sellerEmail, sellerBankAccount, buyerEmail, amount, subject, description, createdBy } = body;

    if (!sellerEmail || !buyerEmail || !amount || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields: sellerEmail, buyerEmail, amount, createdBy" },
        { status: 400 }
      );
    }

    if (!["BUYER", "SELLER"].includes(createdBy)) {
      return NextResponse.json({ error: "createdBy must be BUYER or SELLER" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // sellerBankAccount is required only when seller creates
    if (createdBy === "SELLER" && !sellerBankAccount) {
      return NextResponse.json({ error: "sellerBankAccount is required when seller creates" }, { status: 400 });
    }

    const result = await createTransaction({
      createdBy,
      sellerEmail,
      sellerBankAccount,
      buyerEmail,
      amount,
      subject,
      description,
    });

    return NextResponse.json(
      { id: result.id, message: "Transaction created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
