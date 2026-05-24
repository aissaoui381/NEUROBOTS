import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendFollowUpSMS } from '@/lib/twilio';
import type { Business, Lead } from '@/lib/supabase/types';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { business_id } = await request.json();
  if (!business_id) return NextResponse.json({ error: 'Missing business_id' }, { status: 400 });

  const supabase = await createServiceClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', business_id)
    .eq('clerk_user_id', userId)
    .single();

  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business_id)
    .eq('status', 'new')
    .not('phone', 'is', null);

  if (!leads?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;
  const now = new Date().toISOString();

  for (const lead of leads as Lead[]) {
    try {
      await sendFollowUpSMS(lead.phone!, lead, business as Business);
      await supabase
        .from('leads')
        .update({ status: 'contacted', follow_up_count: lead.follow_up_count + 1, last_follow_up_at: now })
        .eq('id', lead.id);
      sent++;
    } catch {}
  }

  return NextResponse.json({ sent });
}
