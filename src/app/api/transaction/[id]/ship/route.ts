import { NextRequest, NextResponse } from "next/server";
import { getTransactionForUser, addTrackingId } from "@/lib/transaction-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token, trackingId } = body;

    if (!token || !trackingId) {
      return NextResponse.json({ error: "Token and trackingId are required" }, { status: 400 });
    }

    const auth = await getTransactionForUser(id, token);
    if (!auth || auth.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await addTrackingId(id, trackingId);
    return NextResponse.json({ message: "Tracking ID added, status changed to SHIPPED" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add tracking ID";
    console.error("Error adding tracking ID:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
