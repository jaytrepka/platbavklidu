import QRCode from "qrcode";

interface SpaydParams {
  iban: string;
  amount: number;
  message?: string;
  variableSymbol?: string;
}

export function generateSpayd(params: SpaydParams): string {
  const parts = [
    "SPD*1.0",
    `ACC:${params.iban}`,
    `AM:${params.amount.toFixed(2)}`,
    "CC:CZK",
  ];

  if (params.message) {
    parts.push(`MSG:${params.message.substring(0, 60)}`);
  }

  if (params.variableSymbol) {
    parts.push(`X-VS:${params.variableSymbol}`);
  }

  return parts.join("*");
}

export async function generateSpaydQrDataUrl(params: SpaydParams): Promise<string> {
  const spayd = generateSpayd(params);
  return QRCode.toDataURL(spayd, { width: 300, margin: 2 });
}
