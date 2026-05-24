'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Bell, Shield, ExternalLink, Check, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { Business, Plan } from '@/lib/supabase/types';

const PLANS = {
  starter: { name: 'Starter', price: 149, features: ['1 website', '100 leads/month', 'AI chat widget', 'SMS alerts'] },
  pro: { name: 'Pro', price: 199, features: ['3 websites', 'Unlimited leads', 'SMS follow-up', 'Analytics', 'Priority support'] },
  agency: { name: 'Agency', price: 399, features: ['Unlimited websites', 'Team access', 'White-label widget', 'API access', 'Dedicated support'] },
} as const;

const TABS = [
  { id: 'profile', label: 'Profile', icon: <User size={14} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
] as const;

type Tab = typeof TABS[number]['id'];

const PLAN_COLORS: Record<Plan, string> = {
  trial: 'var(--muted)',
  starter: '#0EA5FF',
  pro: '#7C3AED',
  agency: '#FF6835',
};

const PLAN_LABELS: Record<Plan, string> = {
  trial: 'Free Trial',
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
};

interface SettingsClientProps {
  business: Business;
}

export function SettingsClient({ business }: SettingsClientProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form
  const [name, setName] = useState(business.name);
  const [phone, setPhone] = useState(business.phone ?? '');
  const [website, setWebsite] = useState(business.website ?? '');
  const [city, setCity] = useState(business.city ?? '');
  const [state, setState] = useState(business.state ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Billing
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    setTrialDaysLeft(Math.max(0, Math.ceil((new Date(business.trial_ends_at).getTime() - Date.now()) / 86_400_000)));
  }, [business.trial_ends_at]);

  // Notifications
  const [notifyNewLead, setNotifyNewLead] = useState(business.notify_new_lead ?? true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(business.notify_daily_summary ?? false);
  const [notifyFollowup, setNotifyFollowup] = useState(business.notify_followup ?? true);
  const [savingNotif, setSavingNotif] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: business.id, name, phone, website, city, state }),
      });
      if (!res.ok) throw new Error();
      toast({ type: 'success', title: 'Profile saved', description: 'Business info updated.' });
    } catch {
      toast({ type: 'error', title: 'Save failed', description: 'Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const upgrade = async (planId: string) => {
    setLoadingCheckout(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast({ type: 'error', title: 'Checkout failed', description: 'Please try again.' });
    } finally {
      setLoadingCheckout(null);
    }
  };

  const managePortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast({ type: 'error', title: 'Could not open billing portal', description: 'Please try again.' });
    } finally {
      setLoadingPortal(false);
    }
  };

  const saveNotifications = async (key: 'notify_new_lead' | 'notify_daily_summary' | 'notify_followup', value: boolean) => {
    setSavingNotif(true);
    try {
      await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: business.id, [key]: value }),
      });
      toast({ type: 'success', title: 'Saved', description: 'Notification preference updated.' });
    } catch {
      toast({ type: 'error', title: 'Failed to save', description: 'Please try again.' });
    } finally {
      setSavingNotif(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{business.name}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-5 flex-col lg:flex-row">
        {/* Sidebar tabs */}
        <div className="lg:w-[200px] shrink-0 flex flex-row lg:flex-col gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-sm font-medium transition-all text-left"
              style={{
                background: tab === t.id ? 'var(--accent-dim)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex-1 max-w-2xl">
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
              <div className="rounded-[14px] p-6 flex flex-col gap-4" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <h2 className="font-display font-bold text-base text-[var(--text)]">Business info</h2>
                <Input label="Business name" value={name} onChange={e => setName(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
                  <Input label="Website" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
                  <Input label="State" value={state} onChange={e => setState(e.target.value)} />
                </div>
                <Button size="sm" loading={savingProfile} icon={<Check size={13} />} onClick={saveProfile} className="w-fit">
                  Save changes
                </Button>
              </div>
            </motion.div>
          )}

          {tab === 'billing' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
              {/* Current plan */}
              <div className="rounded-[14px] p-6" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Current plan</h2>
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1 rounded-[6px] text-sm font-bold"
                    style={{ background: `${PLAN_COLORS[business.plan]}22`, color: PLAN_COLORS[business.plan] }}
                  >
                    {PLAN_LABELS[business.plan]}
                  </div>
                  {business.plan === 'trial' && (
                    <span className="text-sm text-[var(--muted)]">
                      {trialDaysLeft > 0 ? `${trialDaysLeft} days left` : 'Trial expired'}
                    </span>
                  )}
                </div>
                {business.stripe_customer_id && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ExternalLink size={13} />}
                    loading={loadingPortal}
                    onClick={managePortal}
                    className="mt-4"
                  >
                    Manage billing
                  </Button>
                )}
              </div>

              {/* Upgrade options */}
              {business.plan !== 'agency' && (
                <div className="rounded-[14px] p-6" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                  <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Upgrade</h2>
                  <div className="flex flex-col gap-3">
                    {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([planKey, plan]) => {
                      const isCurrentPlan = business.plan === planKey;
                      const isHigher = ['trial', 'starter', 'pro', 'agency'].indexOf(planKey) >
                        ['trial', 'starter', 'pro', 'agency'].indexOf(business.plan);
                      if (!isHigher && !isCurrentPlan) return null;

                      return (
                        <div
                          key={planKey}
                          className="flex items-center justify-between p-4 rounded-[12px]"
                          style={{
                            background: isCurrentPlan ? 'var(--accent-dim)' : 'var(--bg-3)',
                            border: `1px solid ${isCurrentPlan ? 'rgba(14,165,255,0.3)' : 'var(--border)'}`,
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[var(--text)]">{plan.name}</span>
                              {isCurrentPlan && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]" style={{ background: 'var(--accent)', color: '#06080F' }}>
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap mt-1.5">
                              {plan.features.slice(0, 3).map(f => (
                                <span key={f} className="text-xs text-[var(--muted)] flex items-center gap-1">
                                  <Check size={10} className="text-[var(--success)]" />{f}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="font-display font-bold text-[var(--text)]">${plan.price}<span className="text-xs font-normal text-[var(--muted)]">/mo</span></span>
                            {!isCurrentPlan && (
                              <Button
                                size="sm"
                                icon={<Zap size={12} />}
                                loading={loadingCheckout === planKey}
                                onClick={() => upgrade(planKey)}
                              >
                                Upgrade
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <div className="rounded-[14px] p-6 flex flex-col gap-4" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <h2 className="font-display font-bold text-base text-[var(--text)]">Notification preferences</h2>
                {([
                  { label: 'New lead SMS alert', desc: 'Receive an SMS when your AI captures a new lead', value: notifyNewLead, key: 'notify_new_lead' as const, set: setNotifyNewLead },
                  { label: 'Daily lead summary', desc: 'Get a daily digest of new leads each morning', value: notifyDailySummary, key: 'notify_daily_summary' as const, set: setNotifyDailySummary },
                  { label: 'Follow-up reminders', desc: 'SMS reminders for leads that need follow-up', value: notifyFollowup, key: 'notify_followup' as const, set: setNotifyFollowup },
                ]).map(pref => (
                  <div key={pref.label} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{pref.label}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      disabled={savingNotif}
                      onClick={() => {
                        const next = !pref.value;
                        pref.set(next);
                        saveNotifications(pref.key, next);
                      }}
                      className="relative w-11 h-6 rounded-full shrink-0 transition-colors"
                      style={{ background: pref.value ? 'var(--accent)' : 'var(--bg-3)', border: '1px solid var(--border)' }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                        style={{
                          background: pref.value ? '#06080F' : 'var(--muted)',
                          transform: pref.value ? 'translateX(22px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-[var(--subtle)]">Alerts are sent to: <span className="text-[var(--muted)]">{business.phone ?? 'No phone set — add one in Profile'}</span></p>
              </div>

              {/* Danger zone */}
              <div className="rounded-[14px] p-6 mt-5" style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,104,53,0.25)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-[var(--orange)]" />
                  <h2 className="font-display font-bold text-base text-[var(--orange)]">Danger zone</h2>
                </div>
                <p className="text-sm text-[var(--muted)] mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                <Button variant="danger" size="sm">Delete account</Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
