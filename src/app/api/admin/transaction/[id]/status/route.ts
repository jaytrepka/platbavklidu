import { NextRequest, NextResponse } from "next/server";
import { updateTransactionStatus } from "@/lib/transaction-service";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    await updateTransactionStatus(id, status, true);

    return NextResponse.json({ message: `Status changed to ${status}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change status";
    console.error("Error changing status:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
