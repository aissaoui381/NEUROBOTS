import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, PLANS } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { sendTrialEndingEmail, sendPaymentFailedEmail } from '@/lib/resend';
import type { Plan } from '@/lib/supabase/types';

function planFromPriceId(priceId: string): Plan {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as Plan;
  }
  return 'starter';
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const plan: Plan = sub.status === 'active' && priceId ? planFromPriceId(priceId) : 'trial';
      await supabase
        .from('businesses')
        .update({ stripe_subscription_id: sub.id, plan })
        .eq('stripe_customer_id', sub.customer as string);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from('businesses')
        .update({ plan: 'trial', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer as string);
      break;
    }

    case 'customer.subscription.trial_will_end': {
      const sub = event.data.object as Stripe.Subscription;
      const daysLeft = Math.ceil(((sub.trial_end ?? 0) * 1000 - Date.now()) / 86_400_000);
      const { data: biz } = await supabase
        .from('businesses')
        .select('email, name')
        .eq('stripe_customer_id', sub.customer as string)
        .single();
      if (biz?.email) {
        await sendTrialEndingEmail(biz.email as string, biz.name as string, daysLeft).catch(() => {});
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const { data: biz } = await supabase
        .from('businesses')
        .select('email, name')
        .eq('stripe_customer_id', invoice.customer as string)
        .single();
      if (biz?.email) {
        await sendPaymentFailedEmail(biz.email as string, biz.name as string).catch(() => {});
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
