import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getStripe, PLANS, createCheckoutSession } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { planId } = await request.json();
  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const supabase = await createServiceClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('id, stripe_customer_id, email, name')
    .eq('clerk_user_id', userId)
    .single();

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  let customerId = business.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: (business.email as string) ?? undefined,
      name: business.name as string,
      metadata: { business_id: business.id as string, clerk_user_id: userId },
    });
    customerId = customer.id;
    await supabase.from('businesses').update({ stripe_customer_id: customerId }).eq('id', business.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const session = await createCheckoutSession(
    customerId,
    plan.priceId,
    `${appUrl}/settings?upgraded=true`,
    `${appUrl}/settings`,
  );

  return NextResponse.json({ url: session.url });
}
