'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--bg)' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(50% 50% at 50% 40%, rgba(255,104,53,0.06), transparent 70%)' }}
      />
      <div className="relative z-10">
        <div className="text-5xl mb-5">⚡</div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-[var(--text)] mb-3">Something went wrong</h1>
        <p className="text-[var(--muted)] mb-8 max-w-sm text-sm">
          An unexpected error occurred. Your leads and data are safe.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all"
            style={{ background: 'var(--accent)', color: '#06080F' }}
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-[10px] text-sm font-medium text-[var(--muted)] transition-all hover:text-[var(--text)]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
