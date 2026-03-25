import { NextRequest, NextResponse } from "next/server";
import { getTransactionForUser, updateTransactionStatus } from "@/lib/transaction-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and PIN are required" },
        { status: 400 }
      );
    }

    const auth = await getTransactionForUser(id, email, pin);
    if (!auth || auth.role !== "buyer") {
      return NextResponse.json(
        { error: "Unauthorized. Only the buyer can file a complaint." },
        { status: 403 }
      );
    }

    await updateTransactionStatus(id, "DISPUTED");

    return NextResponse.json({ message: "Complaint filed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to file complaint";
    console.error("Error filing complaint:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
