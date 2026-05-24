'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';

function StatItem({ label, value, suffix = '', prefix = '' }: { label: string; value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useCountUp(inView ? value : 0, 1600);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display font-extrabold text-3xl tracking-[-1px] leading-none text-[var(--text)]">
        <span style={{ color: 'var(--accent)' }}>
          {prefix}{count.toLocaleString()}{suffix}
        </span>
      </div>
      <div className="mt-1.5 text-xs text-[var(--muted)] uppercase tracking-[0.06em]">{label}</div>
    </div>
  );
}

export function TrustBar() {
  return (
    <section
      className="py-9 relative"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(14,165,255,0.04), transparent)',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-7 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
        <StatItem value={14200} suffix="+" label="Leads captured" />
        <StatItem value={340} suffix="+" label="Contractors" />
        <StatItem value={34} suffix="s" label="Avg. response time" />
        <div className="text-center">
          <div className="font-display font-extrabold text-3xl tracking-[-1px] leading-none" style={{ color: 'var(--accent)' }}>4.9★</div>
          <div className="mt-1.5 text-xs text-[var(--muted)] uppercase tracking-[0.06em]">Customer rating</div>
        </div>
        <div className="text-center">
          <div className="font-display font-extrabold text-3xl tracking-[-1px] leading-none" style={{ color: 'var(--accent)' }}>$0</div>
          <div className="mt-1.5 text-xs text-[var(--muted)] uppercase tracking-[0.06em]">Ad spend needed</div>
        </div>
      </div>
    </section>
  );
}
