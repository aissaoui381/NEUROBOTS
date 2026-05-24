'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageCircle, Send, CheckCircle, Star } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Lead } from '@/lib/supabase/types';

interface ActivityEvent {
  id: string;
  type: 'lead' | 'ai_reply' | 'sms_sent' | 'lead_won' | 'review';
  text: string;
  detail?: string;
  time: string;
  fresh?: boolean;
}

const ICONS = {
  lead: { icon: Zap, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  ai_reply: { icon: MessageCircle, color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' },
  sms_sent: { icon: Send, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  lead_won: { icon: CheckCircle, color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' },
  review: { icon: Star, color: '#FFC857', bg: 'rgba(255,200,87,0.1)' },
};

interface ActivityFeedProps {
  newLeads?: Lead[];
}

function makeSeedEvents(): ActivityEvent[] {
  return [
    { id: '1', type: 'lead_won', text: 'Lead marked as won', detail: 'Mike T. — $4,200 roof repair', time: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
    { id: '2', type: 'ai_reply', text: 'AI replied to Sarah K.', detail: '"Storm damage? I can get someone out tomorrow."', time: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    { id: '3', type: 'sms_sent', text: 'Follow-up SMS sent', detail: 'James R. — no response 1hr', time: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
    { id: '4', type: 'lead', text: 'New lead captured', detail: 'Carlos V. — HVAC replacement, urgent', time: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: '5', type: 'review', text: 'Review request sent', detail: 'Linda M. — 5★ Google review received', time: new Date(Date.now() - 1000 * 60 * 70).toISOString() },
  ];
}

export function ActivityFeed({ newLeads = [] }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setEvents(makeSeedEvents());
  }, []);

  useEffect(() => {
    if (newLeads.length === 0) return;
    const latest = newLeads[0];
    const newEvent: ActivityEvent = {
      id: latest.id,
      type: 'lead',
      text: 'New lead captured',
      detail: `${latest.name ?? 'Unknown'} — ${latest.job_type ?? 'inquiry'}, ${latest.urgency}`,
      time: latest.created_at,
      fresh: true,
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 8)]);
  }, [newLeads]);

  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[16px] flex flex-col h-full min-h-0">
      <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="font-semibold text-sm text-[var(--text)]">Activity feed</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Real-time events</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--success)] px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          Live
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 min-h-0"
        style={{ maskImage: 'linear-gradient(180deg, transparent 0%, #000 5%, #000 95%, transparent 100%)' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {events.map(event => {
            const { icon: Icon, color, bg } = ICONS[event.type];
            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-start gap-3 p-3.5 rounded-[12px] border transition-all"
                style={{
                  background: event.fresh ? 'linear-gradient(180deg, rgba(34,197,94,0.07), rgba(255,255,255,0.02))' : 'rgba(255,255,255,0.02)',
                  borderColor: event.fresh ? 'rgba(34,197,94,0.25)' : 'var(--border)',
                }}
              >
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: bg, color }}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-sm font-medium text-[var(--text)] truncate">{event.text}</div>
                    {event.fresh && (
                      <span className="text-[9px] font-bold text-[var(--success)] uppercase tracking-[0.08em] shrink-0 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                        New
                      </span>
                    )}
                  </div>
                  {event.detail && <div className="text-xs text-[var(--muted)] leading-[1.4]">{event.detail}</div>}
                  <div className="text-[10px] text-[var(--subtle)] mt-1.5 font-mono">{timeAgo(event.time)}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
