'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageSquare, Bell, Clock, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { Automation, Business, AutomationTrigger, AutomationAction } from '@/lib/supabase/types';

const TRIGGER_META: Record<AutomationTrigger, { label: string; desc: string; icon: React.ReactNode }> = {
  new_lead: {
    label: 'New lead captured',
    desc: 'Fires immediately when the AI captures a new lead',
    icon: <Zap size={15} className="text-[var(--accent)]" />,
  },
  no_response_1h: {
    label: 'No response · 1 hour',
    desc: 'Lead has not been contacted 1 hour after capture',
    icon: <Clock size={15} className="text-[var(--orange)]" />,
  },
  no_response_1d: {
    label: 'No response · 24 hours',
    desc: 'Lead still uncontacted after 24 hours',
    icon: <Clock size={15} className="text-[var(--orange)]" />,
  },
  job_closed: {
    label: 'Job closed',
    desc: 'Lead is marked as Won or Lost',
    icon: <Check size={15} className="text-[var(--success)]" />,
  },
};

const ACTION_META: Record<AutomationAction, { label: string; icon: React.ReactNode }> = {
  send_sms: { label: 'Send SMS to lead', icon: <MessageSquare size={13} /> },
  send_email: { label: 'Send email to lead', icon: <MessageSquare size={13} /> },
  notify_owner: { label: 'Notify you via SMS', icon: <Bell size={13} /> },
};

const VARIABLES = ['{{name}}', '{{business}}', '{{ai_name}}'];

interface AutomationsClientProps {
  business: Business;
  initialAutomations: Automation[];
}

export function AutomationsClient({ business, initialAutomations }: AutomationsClientProps) {
  const { toast } = useToast();
  const [automations, setAutomations] = useState(initialAutomations);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (id: string, current: boolean) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
    const res = await fetch(`/api/automations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    });
    if (!res.ok) {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: current } : a));
      toast({ type: 'error', title: 'Failed to update', description: 'Please try again.' });
    }
  };

  const startEdit = (a: Automation) => {
    setEditing(a.id);
    setEditTemplate(a.message_template ?? '');
  };

  const saveTemplate = async (id: string) => {
    setSaving(id);
    const res = await fetch(`/api/automations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_template: editTemplate }),
    });
    setSaving(null);
    if (res.ok) {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, message_template: editTemplate } : a));
      setEditing(null);
      toast({ type: 'success', title: 'Saved', description: 'Message template updated.' });
    } else {
      toast({ type: 'error', title: 'Save failed', description: 'Please try again.' });
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">Automations</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Auto-follow-up sequences that run while you sleep</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(14,165,255,0.25)' }}
        >
          <Zap size={12} />
          {automations.filter(a => a.is_active).length} active
        </div>
      </motion.div>

      {/* Variables reference */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3 px-4 py-3 rounded-[10px] flex-wrap"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
      >
        <span className="text-xs text-[var(--muted)] font-medium">Template variables:</span>
        {VARIABLES.map(v => (
          <code
            key={v}
            className="px-2 py-0.5 rounded-[5px] text-xs font-mono"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {v}
          </code>
        ))}
        <span className="text-xs text-[var(--subtle)]">— replaced with live values when sent</span>
      </motion.div>

      {/* Automation cards */}
      <div className="flex flex-col gap-4">
        {automations.map((automation, i) => {
          const trigger = TRIGGER_META[automation.trigger];
          const action = ACTION_META[automation.action];
          const isEditing = editing === automation.id;

          return (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.1 }}
              className="rounded-[14px] overflow-hidden"
              style={{
                border: `1px solid ${automation.is_active ? 'rgba(14,165,255,0.2)' : 'var(--border)'}`,
                background: 'var(--bg-2)',
              }}
            >
              {/* Card header */}
              <div className="flex items-start gap-4 p-5">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: automation.is_active ? 'var(--accent-dim)' : 'var(--bg-3)', border: '1px solid var(--border)' }}
                >
                  {trigger.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--text)]">{automation.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-[5px] text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        background: action.icon ? 'var(--bg-3)' : 'var(--bg-3)',
                        color: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {action.label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">{trigger.desc}</p>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle(automation.id, automation.is_active)}
                  className="relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 mt-1"
                  style={{ background: automation.is_active ? 'var(--accent)' : 'var(--bg-3)', border: '1px solid var(--border)' }}
                  aria-label={automation.is_active ? 'Disable' : 'Enable'}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200"
                    style={{
                      background: automation.is_active ? '#06080F' : 'var(--muted)',
                      transform: automation.is_active ? 'translateX(22px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>

              {/* Message template */}
              {automation.message_template !== null && (
                <div className="px-5 pb-5">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <textarea
                          value={editTemplate}
                          onChange={e => setEditTemplate(e.target.value)}
                          rows={3}
                          className="w-full resize-none text-sm rounded-[8px] p-3 placeholder:text-[var(--subtle)] text-[var(--text)] outline-none transition-colors font-mono"
                          style={{ background: 'var(--bg-3)', border: '1px solid var(--accent)', lineHeight: 1.55 }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" loading={saving === automation.id} onClick={() => saveTemplate(automation.id)}>
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" icon={<X size={12} />} onClick={() => setEditing(null)}>
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                        <p
                          className="flex-1 text-sm font-mono leading-relaxed px-3 py-2.5 rounded-[8px]"
                          style={{ background: 'var(--bg-3)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                        >
                          {automation.message_template || <span className="text-[var(--subtle)] italic">No message template set</span>}
                        </p>
                        <button
                          onClick={() => startEdit(automation)}
                          className="p-2 rounded-[8px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-3)] transition-colors shrink-0"
                        >
                          <Edit2 size={13} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })}

        {automations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-[14px]" style={{ border: '1px dashed var(--border)' }}>
            <Zap size={24} className="text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">No automations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
