'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Zap, BarChart2,
  Settings, ChevronLeft, ChevronRight, Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/widget', icon: Cpu, label: 'Widget' },
  { href: '/automations', icon: Zap, label: 'Automations' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  plan?: string;
}

export function Sidebar({ plan = 'trial' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-7 h-7 rounded-[7px] shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5FF, #0a78ff)', boxShadow: '0 4px 12px -4px rgba(14,165,255,0.5)' }}>
          <span className="text-[10px] font-mono font-bold text-[#06080F]">NB</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="font-display font-bold text-lg tracking-[-0.5px] text-[var(--text)] whitespace-nowrap"
            >
              Neurobots
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-3)]'
              )}
            >
              <Icon size={18} className={cn('shrink-0', active ? 'text-[var(--accent)]' : 'group-hover:text-[var(--text)]')} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Plan */}
      <div className="px-3 pb-4 pt-3 flex flex-col gap-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div className="px-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              plan === 'trial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' : 'bg-[var(--accent-dim)] text-[var(--accent)] border-[rgba(14,165,255,0.25)]'
            )}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: plan === 'trial' ? '#F59E0B' : 'var(--accent)' }} />
              {plan === 'trial' ? '7-day trial' : plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          </div>
        )}
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3 px-2')}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-full',
                userButtonPopoverCard: 'bg-[#0D1020] border border-[rgba(255,255,255,0.07)]',
              },
            }}
          />
          {!collapsed && <span className="text-xs text-[var(--muted)] whitespace-nowrap overflow-hidden text-ellipsis">Account</span>}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-[var(--bg-3)] z-10"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', color: 'var(--muted)' }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
