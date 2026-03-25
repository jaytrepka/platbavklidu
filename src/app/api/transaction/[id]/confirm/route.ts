import { NextRequest, NextResponse } from "next/server";
import { getTransactionForUser, updateTransactionStatus } from "@/lib/transaction-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const auth = await getTransactionForUser(id, token);
    if (!auth || auth.role !== "buyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await updateTransactionStatus(id, "SUCCESSFULLY_DELIVERED");
    return NextResponse.json({ message: "Delivery confirmed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm delivery";
    console.error("Error confirming delivery:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
