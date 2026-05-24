'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Phone, Mail, MapPin, Calendar, MessageSquare,
  CheckCircle, XCircle, Send, FileText, Clock, Star,
  ChevronDown, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { formatPhone, timeAgo, formatDate } from '@/lib/utils';
import type { Lead, LeadStatus, Conversation } from '@/lib/supabase/types';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
}

export function LeadDetailModal({ lead, onClose, onStatusChange }: LeadDetailModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notes, setNotes] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lead) return;
    setLoadingConvos(true);
    const supabase = createClient();
    supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setConversations((data as Conversation[]) ?? []);
        setLoadingConvos(false);
      });
  }, [lead?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleStatusChange = (status: LeadStatus) => {
    if (!lead) return;
    onStatusChange(lead.id, status);
    setStatusOpen(false);
  };

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(6,8,15,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col"
            style={{
              width: 'min(580px, 100vw)',
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border-2)',
              boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(14,165,255,0.25)' }}
                >
                  {lead.name ? lead.name[0].toUpperCase() : <User size={16} />}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-lg text-[var(--text)] truncate">{lead.name ?? 'Unknown Lead'}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <UrgencyBadge urgency={lead.urgency} />
                    <span className="text-xs text-[var(--muted)]">{lead.job_type ?? 'General inquiry'}</span>
                    <span className="text-xs text-[var(--subtle)]">·</span>
                    <span className="text-xs text-[var(--muted)]">{timeAgo(lead.created_at)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[8px] hover:bg-[var(--bg-2)] transition-colors text-[var(--muted)] hover:text-[var(--text)] shrink-0 ml-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Contact info */}
              <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="grid grid-cols-2 gap-3">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm text-[var(--text)] transition-colors hover:bg-[var(--bg-3)]"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      <Phone size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="truncate">{formatPhone(lead.phone)}</span>
                    </a>
                  )}
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm text-[var(--text)] transition-colors hover:bg-[var(--bg-3)]"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      <Mail size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </a>
                  )}
                  {lead.address && (
                    <div
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm text-[var(--text)] col-span-2"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      <MapPin size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="truncate">{lead.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status + actions */}
              <div className="p-6 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Status dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setStatusOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <StatusBadge status={lead.status} />
                    <ChevronDown size={14} className="text-[var(--muted)]" />
                  </button>
                  <AnimatePresence>
                    {statusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-1 z-10 rounded-[10px] overflow-hidden py-1 min-w-[140px]"
                        style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(opt.value)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-2)]"
                            style={{ color: lead.status === opt.value ? 'var(--accent)' : 'var(--text)' }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button variant="secondary" size="sm" icon={<Phone size={13} />}>Call</Button>
                <Button variant="secondary" size="sm" icon={<Send size={13} />}>Send SMS</Button>
                <Button variant="secondary" size="sm" icon={<Star size={13} />}>Request review</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<CheckCircle size={13} className="text-[var(--success)]" />}
                  onClick={() => handleStatusChange('won')}
                >
                  Mark won
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<XCircle size={13} className="text-[var(--orange)]" />}
                  onClick={() => handleStatusChange('lost')}
                >
                  Mark lost
                </Button>
              </div>

              {/* AI Summary */}
              {lead.ai_summary && (
                <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-[var(--accent)]" />
                    <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">AI Summary</span>
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed p-3 rounded-[10px]" style={{ background: 'var(--accent-dim)', border: '1px solid rgba(14,165,255,0.15)' }}>
                    {lead.ai_summary}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-[var(--accent)]" />
                  <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">Timeline</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                    <div>
                      <p className="text-sm text-[var(--text)]">Lead created via {lead.source}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{formatDate(lead.created_at)}</p>
                    </div>
                  </div>
                  {lead.sms_sent && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--success)' }} />
                      <div>
                        <p className="text-sm text-[var(--text)]">SMS alert sent to owner</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{formatDate(lead.created_at)}</p>
                      </div>
                    </div>
                  )}
                  {lead.last_follow_up_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                      <div>
                        <p className="text-sm text-[var(--text)]">Follow-up #{lead.follow_up_count} sent</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{formatDate(lead.last_follow_up_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation transcript */}
              <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={14} className="text-[var(--accent)]" />
                  <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">Conversation</span>
                </div>
                {loadingConvos ? (
                  <div className="flex flex-col gap-2">
                    {[80, 60, 90].map((w, i) => (
                      <div
                        key={i}
                        className="h-9 rounded-[10px] animate-pulse"
                        style={{ width: `${w}%`, background: 'var(--bg-2)', alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' }}
                      />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-[var(--muted)] text-center py-4">No conversation yet</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {conversations.map(msg => (
                      <div
                        key={msg.id}
                        className="max-w-[85%] px-3 py-2.5 rounded-[12px] text-sm leading-relaxed"
                        style={{
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.07)',
                          color: msg.role === 'user' ? '#06080F' : 'var(--text)',
                          fontWeight: msg.role === 'user' ? 500 : 400,
                          borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                          borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                        }}
                      >
                        {msg.content}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-[var(--accent)]" />
                  <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">Notes</span>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add private notes about this lead…"
                  rows={4}
                  className="w-full resize-none text-sm rounded-[10px] p-3 placeholder:text-[var(--subtle)] text-[var(--text)] outline-none transition-colors"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    lineHeight: 1.6,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <Button size="sm" className="mt-2" onClick={() => {}}>Save notes</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
