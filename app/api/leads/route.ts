import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, phone, email, job_type, address, urgency, message, business_id } = body;

  if (!business_id) return NextResponse.json({ error: 'Missing business_id' }, { status: 400 });

  const supabase = await createServiceClient();

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', business_id)
    .eq('clerk_user_id', userId)
    .single();

  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('leads')
    .insert({
      business_id,
      name: name || null,
      phone: phone || null,
      email: email || null,
      job_type: job_type || null,
      address: address || null,
      message: message || null,
      urgency: urgency || 'medium',
      status: 'new',
      source: 'manual',
      sms_sent: false,
    })
    .select()
    .single();

  if (error) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
