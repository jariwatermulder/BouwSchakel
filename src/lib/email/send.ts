import "server-only";

/**
 * E-mailverzending achter een minimale interface. In de MVP loggen we de
 * e-mail server-side; een echte transactionele provider (bijv. Resend/Postmark)
 * wordt later ingeplugd zonder de aanroepende code te wijzigen.
 * Zie docs/ARCHITECTURE.md §6 en docs/IMPLEMENTATION_PLAN.md (providers).
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[email:dev] aan=${message.to} onderwerp="${message.subject}"`,
    );
    return;
  }
  // In productie zonder geconfigureerde provider: niet stilzwijgend slagen.
  throw new Error("Geen e-mailprovider geconfigureerd.");
}
