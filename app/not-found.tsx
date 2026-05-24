import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--bg)' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(50% 50% at 50% 40%, rgba(14,165,255,0.07), transparent 70%)' }}
      />
      <div className="relative z-10">
        <div className="font-mono text-8xl font-bold mb-4" style={{ color: 'var(--accent)', opacity: 0.15 }}>404</div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-[var(--text)] mb-3">Page not found</h1>
        <p className="text-[var(--muted)] mb-8 max-w-sm">
          This page doesn't exist or was moved. Head back to the dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all"
          style={{ background: 'var(--accent)', color: '#06080F' }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
