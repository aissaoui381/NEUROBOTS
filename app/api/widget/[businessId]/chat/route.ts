import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { anthropic, MODEL, buildWidgetSystemPrompt, generateLeadSummary } from '@/lib/claude';
import { sendLeadAlertSMS } from '@/lib/twilio';
import { toE164 } from '@/lib/utils';
import type { Business, Lead, LeadUrgency } from '@/lib/supabase/types';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function detectUrgency(text: string): LeadUrgency {
  const lower = text.toLowerCase();
  if (/emergency|urgent|flood|leak|no heat|no ac|no power|burst|fire/.test(lower)) return 'urgent';
  if (/this week|few days|soon|asap|right away/.test(lower)) return 'high';
  if (/no rush|whenever|next month|not in a hurry/.test(lower)) return 'low';
  return 'medium';
}

async function extractLeadData(conversation: ChatMessage[]): Promise<{
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  job_type: string | null;
  urgency: LeadUrgency;
}> {
  const transcript = conversation
    .map(m => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
    .join('\n');

  const allText = conversation.map(m => m.content).join(' ');
  const urgency = detectUrgency(allText);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Extract lead information from this conversation transcript. Return ONLY valid JSON with these exact keys: name, phone, email, address, job_type. Use null for any missing fields. Do not include markdown or explanation.

Transcript:
${transcript}`,
      },
    ],
  });

  const block = response.content[0];
  const raw = block.type === 'text' ? block.text.trim() : '{}';

  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
    return {
      name: parsed.name ?? null,
      phone: parsed.phone ?? null,
      email: parsed.email ?? null,
      address: parsed.address ?? null,
      job_type: parsed.job_type ?? null,
      urgency,
    };
  } catch {
    return { name: null, phone: null, email: null, address: null, job_type: null, urgency };
  }
}

async function createLeadAndNotify(
  businessId: string,
  business: Business,
  leadData: Awaited<ReturnType<typeof extractLeadData>>,
  conversation: ChatMessage[]
) {
  const supabase = await createServiceClient();

  // Generate AI summary
  let ai_summary: string | null = null;
  try {
    ai_summary = await generateLeadSummary({
      name: leadData.name,
      job_type: leadData.job_type,
      address: leadData.address,
      urgency: leadData.urgency,
      message: leadData.job_type,
    });
  } catch {}

  // Insert lead
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      business_id: businessId,
      name: leadData.name,
      phone: toE164(leadData.phone),
      email: leadData.email,
      address: leadData.address,
      job_type: leadData.job_type,
      urgency: leadData.urgency,
      status: 'new',
      source: 'widget',
      ai_summary,
      sms_sent: false,
    })
    .select()
    .single();

  if (error || !lead) return;

  // Save conversation
  const convRows = conversation.map(m => ({
    lead_id: lead.id,
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));
  await supabase.from('conversations').insert(convRows);

  // Update SMS sent flag + send SMS
  const leadTyped = lead as Lead;
  try {
    await sendLeadAlertSMS(business, { ...leadTyped, ai_summary: ai_summary ?? '' });
    await supabase.from('leads').update({ sms_sent: true }).eq('id', lead.id);
  } catch {}
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS });
  }

  const messages: ChatMessage[] = (body.messages ?? []).slice(-20); // cap history

  if (!messages.length) {
    return NextResponse.json({ error: 'No messages' }, { status: 400, headers: CORS });
  }

  // Fetch business
  const supabase = await createServiceClient();
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404, headers: CORS });
  }

  const biz = business as Business;

  // Call Claude
  let rawResponse: string;
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: buildWidgetSystemPrompt(biz),
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });
    const block = response.content[0];
    rawResponse = block.type === 'text' ? block.text : '';
  } catch (err) {
    console.error('Claude error:', err);
    return NextResponse.json({ error: 'AI unavailable' }, { status: 503, headers: CORS });
  }

  const leadCaptured = rawResponse.includes('LEAD_COMPLETE');

  // Clean the message shown to user
  let displayMessage = rawResponse.replace('LEAD_COMPLETE', '').trim();
  if (!displayMessage) {
    displayMessage = "Great, I've got all the info I need! Our team will be reaching out to you shortly.";
  }

  // Extract and create lead async (fire and forget with await so we don't lose it)
  if (leadCaptured) {
    try {
      const leadData = await extractLeadData(messages);
      await createLeadAndNotify(businessId, biz, leadData, messages);
    } catch (err) {
      console.error('Lead creation error:', err);
    }
  }

  return NextResponse.json(
    { message: displayMessage, leadCaptured },
    { headers: CORS }
  );
}
