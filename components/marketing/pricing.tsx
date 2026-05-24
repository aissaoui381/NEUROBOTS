'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionBg } from '@/components/marketing/section-bg';
import { ParticleBg } from '@/components/marketing/particle-bg';

const plans = [
  {
    name: 'Starter',
    price: 149,
    tagline: 'Solo operators. One service area. Everything you need to never miss a lead.',
    features: ['Up to 200 conversations / mo', 'SMS + email follow-ups', 'Lead dashboard', '1 user seat', 'Embed on 1 website'],
    cta: 'Start free trial',
    featured: false,
  },
  {
    name: 'Pro',
    price: 199,
    tagline: 'Growing teams. Multiple service areas. Unlimited leads, unlimited potential.',
    features: ['Unlimited conversations', '3 websites', 'SMS + email follow-up sequences', 'Full analytics dashboard', 'Priority support', 'Team access (3 seats)'],
    cta: 'Start free trial',
    featured: true,
    tag: 'Most popular',
  },
  {
    name: 'Agency',
    price: 399,
    tagline: 'Run multiple contractor accounts or build a lead generation empire.',
    features: ['Unlimited websites', 'Unlimited team seats', 'White-label widget', 'API access', 'Dedicated account manager', 'Custom onboarding'],
    cta: 'Talk to sales',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="py-[72px] relative" id="pricing">
      <SectionBg variant="purple" />
      <ParticleBg count={48} color="124,92,237" opacity={0.45} />
      <div className="max-w-[1240px] mx-auto px-7 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-[760px] mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.06em] text-[var(--accent)] border" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(14,165,255,0.25)' }}>
            Pricing
          </span>
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mt-[18px] mb-3.5">
            One missed lead pays for the year.
          </h2>
          <p className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[54ch] mx-auto">
            Flat-rate. No per-lead fees. No setup. No "AI credits." Cancel anytime — 87% of contractors don't.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px] mt-12 items-stretch">
          {plans.map((plan, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative flex flex-col rounded-[16px] p-8 border"
              style={{
                background: plan.featured ? 'var(--bg-3)' : 'var(--bg-2)',
                borderColor: plan.featured ? 'rgba(14,165,255,0.4)' : 'var(--border)',
                boxShadow: plan.featured ? '0 0 0 1px rgba(14,165,255,0.2), 0 30px 80px -30px rgba(14,165,255,0.4)' : undefined,
                transform: plan.featured ? 'translateY(-8px)' : undefined,
              }}
            >
              {plan.featured && (
                <>
                  <div className="absolute left-0 right-0 top-[-1px] h-[2px] rounded-t-[16px]" style={{ background: 'var(--accent)' }} />
                  <div className="absolute -top-3 left-6 px-2.5 py-1 text-xs uppercase tracking-[0.08em] font-semibold rounded-full text-[#06080F]" style={{ background: 'var(--accent)' }}>
                    {plan.tag}
                  </div>
                </>
              )}

              <div className="text-xs text-[var(--muted)] uppercase tracking-[0.08em] font-medium">{plan.name}</div>
              <div className="flex items-baseline gap-1.5 my-3.5">
                <span className="font-display font-extrabold text-[54px] leading-none tracking-[-2px] text-[var(--text)]">${plan.price}</span>
                <span className="text-sm text-[var(--muted)]">/mo</span>
              </div>
              <p className="text-sm text-[rgba(238,240,255,0.7)] mb-6">{plan.tagline}</p>

              <ul className="flex-1 flex flex-col gap-3 mb-7">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm leading-[1.45]">
                    <Check size={14} className="shrink-0 mt-[3px] text-[var(--accent)]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/sign-up" className="block">
                <Button
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full justify-center"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.article>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          All plans include a <strong className="text-[var(--text)]">7-day free trial</strong>. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
