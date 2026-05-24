'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 bg-[var(--bg-2)] border border-[var(--border)] rounded-[8px] px-4 text-[var(--text)] text-sm placeholder:text-[var(--subtle)]',
              'transition-all duration-200',
              'focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,255,0.25)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--orange)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_rgba(255,104,53,0.25)]',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[var(--orange)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--subtle)]',
            'transition-all duration-200 resize-none min-h-[100px]',
            'focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(14,165,255,0.25)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--orange)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_rgba(255,104,53,0.25)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--orange)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
