'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { ParticleBg } from '@/components/marketing/particle-bg';

export function CtaSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="py-20 text-center relative overflow-hidden" id="cta">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(14,165,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,255,0.08) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, #000, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, #000, transparent 70%)',
          animation: 'grid-shift 22s linear infinite',
        }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 80% at 50% 50%, rgba(14,165,255,0.15), transparent 70%)' }} />
      <ParticleBg count={44} opacity={0.42} />

      <div className="max-w-[1240px] mx-auto px-7 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mb-4">
            Start capturing leads tonight.
          </h2>
          <p className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[48ch] mx-auto mb-8">
            7 days free. No credit card. Setup in 10 minutes. The next $8,000 job could be captured while you're reading this.
          </p>

          <div className="flex gap-2 max-w-[480px] mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-11 bg-[var(--bg-2)] border border-[var(--border)] rounded-[8px] px-4 text-[var(--text)] text-sm placeholder:text-[var(--subtle)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,255,0.25)] transition-all duration-200"
            />
            <Link href={`/sign-up${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
              <Button size="md" iconRight={<ArrowRight size={14} />}>Get started</Button>
            </Link>
          </div>

          <p className="text-sm text-[var(--muted)] mt-4">No credit card required · Cancel anytime · Setup in 10 minutes</p>
        </motion.div>
      </div>

      <style>{`@keyframes grid-shift { to { background-position: 56px 56px, 56px 56px } }`}</style>
    </section>
  );
}
