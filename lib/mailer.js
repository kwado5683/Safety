/*
Description: Email utility using Resend service.
- Sends emails via Resend API.
- Gracefully handles missing API key.
- Returns response or skip indicator.

Pseudocode:
- Check if RESEND_API_KEY exists
- If missing → return { skipped: true }
- Else → send email via Resend API
- Return response or error
*/
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  return resend.emails.send({ from: "safety@yourdomain.com", to, subject, html });
}
