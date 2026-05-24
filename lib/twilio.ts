import twilio from 'twilio';
import type { Lead, Business } from './supabase/types';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendLeadAlertSMS(
  business: Business,
  lead: Lead & { ai_summary?: string }
) {
  const to = business.phone;
  if (!to) return;

  const body = `🔥 New Neurobots lead!
Name: ${lead.name ?? 'Unknown'}
Phone: ${lead.phone ?? 'Not provided'}
Job: ${lead.job_type ?? 'Not specified'}
Address: ${lead.address ?? 'Not provided'}
Urgency: ${lead.urgency.toUpperCase()}
${lead.ai_summary ? `\nAI Summary: ${lead.ai_summary}` : ''}

Reply STOP to pause alerts.`;

  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
}

export async function sendFollowUpSMS(
  to: string,
  lead: Lead,
  business: Business
) {
  const body = `Hi ${lead.name ?? 'there'}, this is ${business.ai_name} from ${business.name}.
Just following up on your request for ${lead.job_type ?? 'service'}.
Are you still looking for help? Reply YES and we'll get you a quote today.`;

  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
}
