import dotenv from 'dotenv';
import { BrevoClient } from '@getbrevo/brevo';

dotenv.config();

export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
  timeoutInSeconds: 30,
  maxRetries: 3,
});
