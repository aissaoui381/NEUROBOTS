'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  loading?: boolean;
}

const colorMap = {
  blue: { bg: 'var(--accent-dim)', icon: 'var(--accent)', border: 'rgba(14,165,255,0.2)' },
  green: { bg: 'rgba(34,197,94,0.1)', icon: 'var(--success)', border: 'rgba(34,197,94,0.2)' },
  orange: { bg: 'rgba(255,104,53,0.1)', icon: 'var(--orange)', border: 'rgba(255,104,53,0.2)' },
  purple: { bg: 'rgba(124,58,237,0.1)', icon: '#7C3AED', border: 'rgba(124,58,237,0.2)' },
};

export function StatCard({ label, value, suffix = '', prefix = '', trend, trendLabel, icon, color = 'blue', loading }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const animated = useCountUp(inView && !loading ? value : 0, 1200);
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[16px] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-9 w-9 rounded-[10px]" />
        </div>
        <div className="skeleton h-9 w-32 mt-1" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[16px] p-5 flex flex-col gap-4 card-hover blue-top-hover group"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">{label}</div>
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.icon }}
        >
          {icon}
        </div>
      </div>

      <div className="font-display font-extrabold text-4xl tracking-[-1.5px] leading-none text-[var(--text)]">
        {prefix}{animated.toLocaleString()}{suffix}
      </div>

      {trend !== undefined && (
        <div className={cn('flex items-center gap-1.5 text-xs font-medium', trend >= 0 ? 'text-[var(--success)]' : 'text-[var(--orange)]')}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend)}% {trendLabel ?? (trend >= 0 ? 'vs last month' : 'vs last month')}
        </div>
      )}
    </div>
  );
}
