import { NextRequest, NextResponse } from "next/server";
import { getTransactionForUser } from "@/lib/transaction-service";

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

    const result = await getTransactionForUser(id, token);
    if (!result) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error authenticating:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
