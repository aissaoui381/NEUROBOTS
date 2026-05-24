'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, Trophy, Plus, Download, Send } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { StatCard } from '@/components/dashboard/stat-card';
import { LeadPipeline } from '@/components/dashboard/lead-pipeline';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { AddLeadModal } from '@/components/dashboard/add-lead-modal';
import { useLeads } from '@/hooks/use-leads';
import { Button } from '@/components/ui/button';
import { exportLeadsCSV } from '@/lib/utils';
import type { Business, Lead, LeadStatus } from '@/lib/supabase/types';

interface DashboardClientProps {
  business: Business;
  initialLeads: Lead[];
}

function getThisMonth<T extends { created_at: string }>(items: T[]) {
  const start = new Date();
  start.setDate(1); start.setHours(0, 0, 0, 0);
  return items.filter(i => new Date(i.created_at) >= start);
}

function getToday<T extends { created_at: string }>(items: T[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return items.filter(i => new Date(i.created_at) >= start);
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardClient({ business, initialLeads }: DashboardClientProps) {
  const { leads, updateLeadStatus, refetch } = useLeads(business.id);
  const { toast } = useToast();
  const allLeads = leads.length > 0 ? leads : initialLeads;

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    setGreeting(getTimeGreeting());
    setDateLabel(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const stats = useMemo(() => {
    const monthLeads = getThisMonth(allLeads);
    const todayLeads = getToday(allLeads);
    const wonThisMonth = monthLeads.filter(l => l.status === 'won');
    const contactedOrBetter = monthLeads.filter(l => ['contacted', 'quoted', 'won', 'lost'].includes(l.status));
    const responseRate = monthLeads.length > 0 ? Math.round((contactedOrBetter.length / monthLeads.length) * 100) : 0;
    return { monthTotal: monthLeads.length, todayTotal: todayLeads.length, responseRate, wonTotal: wonThisMonth.length };
  }, [allLeads]);

  const newLeadsRealtime = useMemo(() => allLeads.filter(l => l.status === 'new').slice(0, 5), [allLeads]);

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    await updateLeadStatus(leadId, status);
  };

  const handleBulkFollowUp = useCallback(async () => {
    const newLeads = allLeads.filter(l => l.status === 'new' && l.phone);
    if (newLeads.length === 0) {
      toast({ type: 'error', title: 'No leads to follow up', description: 'All new leads have already been contacted or have no phone number.' });
      return;
    }
    if (!confirm(`Send follow-up SMS to ${newLeads.length} uncontacted lead${newLeads.length === 1 ? '' : 's'}?`)) return;
    setSendingFollowUp(true);
    try {
      const res = await fetch('/api/leads/bulk-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: business.id }),
      });
      const data = await res.json();
      toast({ type: 'success', title: `Sent ${data.sent} follow-ups`, description: 'SMS messages are on their way.' });
      refetch();
    } catch {
      toast({ type: 'error', title: 'Failed to send', description: 'Please try again.' });
    } finally {
      setSendingFollowUp(false);
    }
  }, [allLeads, business.id, refetch, toast]);

  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">
            {greeting} 👋
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{business.name}{dateLabel ? ` · ${dateLabel}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddLeadOpen(true)}>Add lead</Button>
          <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={() => exportLeadsCSV(allLeads)}>Export</Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Leads this month', value: stats.monthTotal, icon: <Users size={16} />, color: 'blue' as const, trend: 12 },
          { label: 'New today', value: stats.todayTotal, icon: <TrendingUp size={16} />, color: 'green' as const, trend: 8 },
          { label: 'Response rate', value: stats.responseRate, suffix: '%', icon: <MessageSquare size={16} />, color: 'purple' as const, trend: 3 },
          { label: 'Won this month', value: stats.wonTotal, icon: <Trophy size={16} />, color: 'orange' as const, trend: -2 },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Pipeline + Activity */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Pipeline — 60% */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-[1.5] flex flex-col gap-4 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight text-[var(--text)]">Lead Pipeline</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Drag cards to update status</p>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <LeadPipeline
              leads={allLeads}
              onStatusChange={handleStatusChange}
              onLeadClick={setSelectedLead}
            />
          </div>
        </motion.div>

        {/* Activity — 40% */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-[320px] shrink-0 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight text-[var(--text)]">Activity</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Real-time events</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ActivityFeed newLeads={newLeadsRealtime} />
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 flex-wrap p-4 rounded-[12px]"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
      >
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] flex items-center mr-2">Quick actions</span>
        <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => setAddLeadOpen(true)}>Add lead manually</Button>
        <Button variant="secondary" size="sm" icon={<Send size={13} />} loading={sendingFollowUp} onClick={handleBulkFollowUp}>Send bulk follow-up</Button>
        <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={() => exportLeadsCSV(allLeads)}>Export CSV</Button>
      </motion.div>

      <AddLeadModal
        business={business}
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onAdded={() => refetch()}
      />
    </div>
  );
}
