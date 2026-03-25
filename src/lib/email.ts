interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(params: EmailParams): Promise<void> {
  console.log("═══════════════════════════════════════");
  console.log("📧 EMAIL SENT");
  console.log(`   To: ${params.to}`);
  console.log(`   Subject: ${params.subject}`);
  console.log(`   Body:`);
  console.log(params.body);
  console.log("═══════════════════════════════════════");
}
