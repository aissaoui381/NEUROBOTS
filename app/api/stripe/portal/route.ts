import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .single();

  const customerId = (business?.stripe_customer_id as string) ?? null;
  if (!customerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const session = await createCustomerPortalSession(customerId, `${appUrl}/settings`);

  return NextResponse.json({ url: session.url });
}
