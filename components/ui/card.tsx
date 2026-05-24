'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, glow, elevated, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[16px] border border-[var(--border)] p-5',
          elevated ? 'bg-[var(--bg-3)]' : 'bg-[var(--bg-2)]',
          hover && 'card-hover blue-top-hover cursor-pointer',
          glow && 'glow-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props}>{children}</div>
);

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-display font-700 text-[var(--text)] text-lg tracking-tight', className)} {...props}>{children}</h3>
);

export const CardDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-[var(--muted)] text-sm mt-1', className)} {...props}>{children}</p>
);

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props}>{children}</div>
);

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between', className)} {...props}>{children}</div>
);
