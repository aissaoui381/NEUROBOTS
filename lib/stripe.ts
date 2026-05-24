import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 149,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? '',
    features: ['1 website', '100 leads/month', 'AI chat widget', 'SMS alerts'],
    limit: 100,
    websites: 1,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 199,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    features: ['3 websites', 'Unlimited leads', 'SMS follow-up', 'Analytics', 'Priority support'],
    limit: Infinity,
    websites: 3,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 399,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? '',
    features: ['Unlimited websites', 'Team access', 'White-label widget', 'API access', 'Dedicated support'],
    limit: Infinity,
    websites: Infinity,
  },
} as const;

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
    },
  });
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  return getStripe().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}
