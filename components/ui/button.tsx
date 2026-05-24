'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[#06080F] font-semibold hover:bg-[#38B6FF] active:scale-[0.98] shadow-[0_0_20px_rgba(14,165,255,0.3)] hover:shadow-[0_0_32px_rgba(14,165,255,0.5)]',
  secondary: 'bg-[var(--bg-3)] text-[var(--text)] border border-[var(--border-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-[0.98]',
  ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-3)] active:scale-[0.98]',
  danger: 'bg-[var(--orange)] text-white font-semibold hover:bg-[#FF7F50] active:scale-[0.98] shadow-[0_0_20px_rgba(255,104,53,0.3)]',
  outline: 'bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent-dim)] active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-4 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-[8px] font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
