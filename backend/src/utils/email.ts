import { brevo } from "../config/brevo.config";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  name?: string;
}) {
  const { to, subject, html, name } = params;

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME!,
      email: process.env.BREVO_SENDER_EMAIL!,
    },
    to: [{ email: to, name }],
    subject,
    htmlContent: html,
  });
}
