import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { toE164 } from '@/lib/utils';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, website, phone, city, state, service_type, email } = body;

  if (!name || !service_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const normalizedPhone = toE164(phone);
  if (phone && !normalizedPhone) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 14);

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      clerk_user_id: userId,
      name,
      website: website || null,
      phone: normalizedPhone,
      city: city || null,
      state: state || null,
      service_type,
      email: email || null,
      ai_name: 'AI Assistant',
      ai_greeting: 'Hi! I can get you a free quote in 60 seconds.',
      accent_color: '#0EA5FF',
      plan: 'trial',
      trial_ends_at: trialEnds.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('POST /api/business error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: seedError } = await supabase.rpc('seed_default_automations', {
    p_business_id: data.id,
  });
  if (seedError) console.error('seed_default_automations error:', seedError);

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  if (typeof updates.phone === 'string' && updates.phone.length > 0) {
    const normalized = toE164(updates.phone);
    if (!normalized) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    updates.phone = normalized;
  }

  const supabase = await createServiceClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', id)
    .eq('clerk_user_id', userId)
    .single();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('PATCH /api/business error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
