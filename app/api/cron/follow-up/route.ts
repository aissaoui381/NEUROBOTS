import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendFollowUpSMS } from '@/lib/twilio';
import type { Automation, Business, Lead } from '@/lib/supabase/types';

// Called by Vercel Cron (or external scheduler) every 15 minutes.
// Protected by a shared secret in the Authorization header.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date();

  // Fetch all active automations for follow-up triggers
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .in('trigger', ['no_response_1h', 'no_response_1d'])
    .eq('is_active', true)
    .eq('action', 'send_sms');

  if (!automations?.length) return NextResponse.json({ processed: 0 });

  // Group by business
  const byBusiness = new Map<string, Automation[]>();
  for (const a of automations as Automation[]) {
    const list = byBusiness.get(a.business_id) ?? [];
    list.push(a);
    byBusiness.set(a.business_id, list);
  }

  let processed = 0;

  for (const [businessId, bizAutomations] of byBusiness) {
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (!business) continue;

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'new')
      .not('phone', 'is', null);

    if (!leads?.length) continue;

    for (const lead of leads as Lead[]) {
      const ageMs = now.getTime() - new Date(lead.created_at).getTime();
      const ageH = ageMs / 3_600_000;

      for (const automation of bizAutomations) {
        const threshold = automation.trigger === 'no_response_1h' ? 1 : 24;
        const maxFollowUps = automation.trigger === 'no_response_1h' ? 1 : 2;

        if (ageH >= threshold && lead.follow_up_count < maxFollowUps) {
          // Check we haven't sent this recently
          const lastSent = lead.last_follow_up_at ? new Date(lead.last_follow_up_at).getTime() : 0;
          const hoursSinceLast = (now.getTime() - lastSent) / 3_600_000;
          if (hoursSinceLast < threshold) continue;

          try {
            await sendFollowUpSMS(lead.phone!, lead, business as Business);
            await supabase
              .from('leads')
              .update({
                follow_up_count: lead.follow_up_count + 1,
                last_follow_up_at: now.toISOString(),
                status: 'contacted',
              })
              .eq('id', lead.id);
            processed++;
          } catch {}
        }
      }
    }
  }

  return NextResponse.json({ processed });
}
