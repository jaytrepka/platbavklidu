import crypto from "crypto";

export function generatePin(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

export function generateAccessToken(): string {
  return crypto.randomUUID() + "-" + crypto.randomBytes(16).toString("hex");
}

export function calculateFee(amount: number): number {
  return Math.max(Math.round(amount * 0.01 * 100) / 100, 10);
}

export function calculateTotalAmount(amount: number): number {
  return Math.round((amount + calculateFee(amount)) * 100) / 100;
}
