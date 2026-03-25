import { NextRequest, NextResponse } from "next/server";
import { approveTransaction } from "@/lib/transaction-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token, bankAccount } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await approveTransaction(id, token, bankAccount);

    return NextResponse.json({ message: "Transaction approved" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve";
    console.error("Error approving transaction:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
