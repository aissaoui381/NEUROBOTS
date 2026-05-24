import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'urgent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-3)] text-[var(--muted)] border-[var(--border)]',
  success: 'bg-[rgba(34,197,94,0.12)] text-[var(--success)] border-[rgba(34,197,94,0.25)]',
  warning: 'bg-[rgba(251,191,36,0.12)] text-amber-400 border-[rgba(251,191,36,0.25)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-red-400 border-[rgba(239,68,68,0.25)]',
  urgent: 'bg-[rgba(255,104,53,0.12)] text-[var(--orange)] border-[rgba(255,104,53,0.25)]',
  info: 'bg-[var(--accent-dim)] text-[var(--accent)] border-[rgba(14,165,255,0.25)]',
  outline: 'bg-transparent text-[var(--muted)] border-[var(--border-2)]',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--muted)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  urgent: 'bg-[var(--orange)]',
  info: 'bg-[var(--accent)]',
  outline: 'bg-[var(--subtle)]',
};

export function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, BadgeVariant> = {
    urgent: 'urgent',
    high: 'danger',
    medium: 'warning',
    low: 'default',
  };
  return (
    <Badge variant={map[urgency] || 'default'} dot>
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    new: 'info',
    contacted: 'warning',
    quoted: 'outline',
    won: 'success',
    lost: 'danger',
  };
  return (
    <Badge variant={map[status] || 'default'} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
