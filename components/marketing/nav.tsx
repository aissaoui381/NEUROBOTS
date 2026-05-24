'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          padding: '16px 0',
          background: scrolled
            ? 'rgba(6,8,15,0.92)'
            : 'linear-gradient(to bottom, rgba(6,8,15,0.85), rgba(6,8,15,0))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-7 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl tracking-[-1px] text-[var(--text)] shrink-0">
            <span className="relative w-7 h-7 rounded-[7px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #0EA5FF 0%, #0a78ff 100%)', boxShadow: '0 6px 16px -6px rgba(14,165,255,0.5)' }}>
              <span className="absolute inset-[6px]" style={{ background: 'radial-gradient(circle at 30% 30%, #06080F 1.5px, transparent 2px) 0 0/8px 8px, radial-gradient(circle at 70% 70%, #06080F 1.5px, transparent 2px) 0 0/8px 8px' }} />
            </span>
            Neurobots
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {[['#how', 'How it works'], ['#features', 'Features'], ['#reviews', 'Reviews'], ['#pricing', 'Pricing']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3.5 py-2 text-sm text-[var(--muted)] rounded-[8px] transition-all duration-200 hover:text-[var(--text)] hover:bg-[var(--accent-dim)]"
              >
                {label}
              </a>
            ))}
            <Link href="/sign-in" className="px-3.5 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Log in
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start free trial</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-[var(--bg-2)] border-b border-[var(--border)] p-6 flex flex-col gap-3 md:hidden"
          >
            {[['#how', 'How it works'], ['#features', 'Features'], ['#reviews', 'Reviews'], ['#pricing', 'Pricing']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-[var(--muted)] text-base py-2 hover:text-[var(--text)] transition-colors"
              >
                {label}
              </a>
            ))}
            <hr className="border-[var(--border)] my-2" />
            <Link href="/sign-in" className="text-[var(--muted)] text-base py-2 hover:text-[var(--text)] transition-colors">Log in</Link>
            <Link href="/sign-up">
              <Button size="md" className="w-full justify-center">Start free trial</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
