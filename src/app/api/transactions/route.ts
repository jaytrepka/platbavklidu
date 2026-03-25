import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/transaction-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sellerEmail, sellerBankAccount, buyerEmail, amount, subject, description } = body;

    if (!sellerEmail || !sellerBankAccount || !buyerEmail || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: sellerEmail, sellerBankAccount, buyerEmail, amount" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const result = await createTransaction({
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
