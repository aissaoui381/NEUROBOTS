'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { Business, Lead, LeadUrgency } from '@/lib/supabase/types';

interface AddLeadModalProps {
  business: Business;
  open: boolean;
  onClose: () => void;
  onAdded: (lead: Lead) => void;
}

const URGENCY_OPTIONS: { value: LeadUrgency; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'rgba(148,163,184,0.8)' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#FF6835' },
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
];

export function AddLeadModal({ business, open, onClose, onAdded }: AddLeadModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobType, setJobType] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<LeadUrgency>('medium');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName(''); setPhone(''); setEmail('');
    setJobType(''); setAddress(''); setMessage('');
    setUrgency('medium');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !phone.trim()) {
      toast({ type: 'error', title: 'Name or phone required', description: 'Enter at least a name or phone number.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          name: name.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          job_type: jobType.trim() || null,
          address: address.trim() || null,
          message: message.trim() || null,
          urgency,
        }),
      });
      if (!res.ok) throw new Error();
      const lead = await res.json();
      toast({ type: 'success', title: 'Lead added!', description: `${name || phone} has been added to your pipeline.` });
      onAdded(lead);
      handleClose();
    } catch {
      toast({ type: 'error', title: 'Failed to add lead', description: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(6,8,15,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="w-full max-w-[480px] rounded-[18px] flex flex-col overflow-hidden"
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border-2)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                pointerEvents: 'all',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                    <UserPlus size={15} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-[var(--text)]">Add lead manually</h2>
                    <p className="text-[11px] text-[var(--muted)]">Will appear in your pipeline as "Manual"</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-3)] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
                  <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 012-3456" type="tel" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@email.com" type="email" />
                  <Input label="Job type" value={jobType} onChange={e => setJobType(e.target.value)} placeholder="Roof repair" />
                </div>

                <Input label="Address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Nashville, TN" />

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] block mb-2">Note (optional)</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={2}
                    placeholder="Any context about this lead…"
                    className="w-full resize-none text-sm rounded-[8px] px-3 py-2 outline-none transition-colors"
                    style={{
                      background: 'var(--bg-3)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      lineHeight: 1.55,
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] block mb-2">Urgency</label>
                  <div className="flex gap-2">
                    {URGENCY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setUrgency(opt.value)}
                        className="flex-1 py-1.5 rounded-[7px] text-xs font-semibold transition-all"
                        style={{
                          background: urgency === opt.value ? `${opt.color}22` : 'var(--bg-3)',
                          color: urgency === opt.value ? opt.color : 'var(--muted)',
                          border: `1px solid ${urgency === opt.value ? opt.color + '55' : 'var(--border)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="secondary" size="sm" onClick={handleClose} className="flex-1 justify-center">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={saving} icon={<UserPlus size={13} />} className="flex-1 justify-center">
                    Add lead
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
