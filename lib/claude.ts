import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-20250514';

export function buildWidgetSystemPrompt(business: {
  ai_name: string;
  name: string;
  service_type: string | null;
  city: string | null;
  state: string | null;
}) {
  return `You are ${business.ai_name}, the AI assistant for ${business.name}, a ${business.service_type ?? 'home services'} company${business.city ? ` in ${business.city}, ${business.state}` : ''}.

Your job is to capture leads by having a friendly, natural conversation.
Collect in order: full name, phone number, job type/description, address, and timeline.
Be concise — max 2 sentences per reply.
Be warm and professional. Use the homeowner's name once you have it.
When you have all 5 pieces of information, respond with exactly: LEAD_COMPLETE

Never make up prices. Never promise specific timelines.
If asked something outside your expertise, say you'll have the team follow up.`;
}

export async function generateLeadSummary(lead: {
  name: string | null;
  job_type: string | null;
  address: string | null;
  urgency: string;
  message: string | null;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Summarize this lead in 1-2 sentences for a contractor: Name: ${lead.name}, Job: ${lead.job_type}, Address: ${lead.address}, Urgency: ${lead.urgency}, Notes: ${lead.message}. Be direct and action-oriented.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
