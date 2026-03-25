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

    await updateTransactionStatus(id, "DISPUTED");
    return NextResponse.json({ message: "Complaint filed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to file complaint";
    console.error("Error filing complaint:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
