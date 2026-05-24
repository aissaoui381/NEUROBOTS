'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, Users, Cpu, Zap, BarChart2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/widget', icon: Cpu, label: 'Widget' },
  { href: '/automations', icon: Zap, label: 'Automations' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface MobileNavProps {
  plan?: string;
}

export function MobileNav({ plan = 'trial' }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/'));

  return (
    <>
      {/* Top bar */}
      <header
        className="lg:hidden flex items-center justify-between px-4 h-14 shrink-0 z-30"
        style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[7px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0EA5FF, #0a78ff)', boxShadow: '0 4px 12px -4px rgba(14,165,255,0.5)' }}
          >
            <span className="text-[10px] font-mono font-bold text-[#06080F]">NB</span>
          </div>
          <span className="font-display font-bold text-base tracking-[-0.5px] text-[var(--text)]">
            {currentPage?.label ?? 'Neurobots'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <UserButton
            appearance={{ elements: { avatarBox: 'w-7 h-7 rounded-full' } }}
          />
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-[8px] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            style={{ background: 'var(--bg-3)' }}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(6,8,15,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 h-full z-50 flex flex-col w-72 lg:hidden"
              style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border-2)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0EA5FF, #0a78ff)' }}
                  >
                    <span className="text-[10px] font-mono font-bold text-[#06080F]">NB</span>
                  </div>
                  <span className="font-display font-bold text-lg tracking-[-0.5px] text-[var(--text)]">Neurobots</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-[8px] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                {NAV.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium transition-all',
                        active ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-3)]'
                      )}
                    >
                      <Icon size={18} className={cn('shrink-0', active ? 'text-[var(--accent)]' : '')} />
                      {label}
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Plan badge */}
              <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                  plan === 'trial'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    : 'bg-[var(--accent-dim)] text-[var(--accent)] border-[rgba(14,165,255,0.25)]'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: plan === 'trial' ? '#F59E0B' : 'var(--accent)' }} />
                  {plan === 'trial' ? '7-day trial' : plan.charAt(0).toUpperCase() + plan.slice(1) + ' plan'}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
