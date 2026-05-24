'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Plus, SortAsc, SortDesc,
  Users, ChevronDown, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, UrgencyBadge } from '@/components/ui/badge';
import { LeadDetailModal } from '@/components/dashboard/lead-detail-modal';
import { AddLeadModal } from '@/components/dashboard/add-lead-modal';
import { useLeads } from '@/hooks/use-leads';
import { formatPhone, timeAgo, exportLeadsCSV } from '@/lib/utils';
import type { Business, Lead, LeadStatus, LeadUrgency } from '@/lib/supabase/types';

type SortField = 'created_at' | 'urgency' | 'name' | 'status';
type SortDir = 'asc' | 'desc';

const URGENCY_ORDER: Record<LeadUrgency, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER: Record<LeadStatus, number> = { new: 0, contacted: 1, quoted: 2, won: 3, lost: 4 };

const SOURCE_LABELS = { widget: 'Widget', referral: 'Referral', manual: 'Manual' };

interface LeadsClientProps {
  business: Business;
  initialLeads: Lead[];
}

export function LeadsClient({ business, initialLeads }: LeadsClientProps) {
  const { leads, updateLeadStatus, refetch } = useLeads(business.id);
  const allLeads = leads.length > 0 ? leads : initialLeads;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [filterUrgency, setFilterUrgency] = useState<LeadUrgency | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = allLeads;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.job_type?.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') result = result.filter(l => l.status === filterStatus);
    if (filterUrgency !== 'all') result = result.filter(l => l.urgency === filterUrgency);

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'urgency') {
        cmp = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
      } else if (sortField === 'name') {
        cmp = (a.name ?? '').localeCompare(b.name ?? '');
      } else if (sortField === 'status') {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allLeads, search, filterStatus, filterUrgency, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleStatusChange = useCallback(async (leadId: string, status: LeadStatus) => {
    await updateLeadStatus(leadId, status);
    setSelectedLead(prev => prev?.id === leadId ? { ...prev, status } : prev);
  }, [updateLeadStatus]);

  const hasActiveFilters = filterStatus !== 'all' || filterUrgency !== 'all';

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />;
  };

  return (
    <>
      <div className="p-6 flex flex-col gap-6 min-h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">Leads</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">{allLeads.length} total · {allLeads.filter(l => l.status === 'new').length} new</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => exportLeadsCSV(allLeads)}>Export CSV</Button>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setAddLeadOpen(true)}>Add lead</Button>
          </div>
        </motion.div>

        {/* Search + filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          <div className="flex gap-2 flex-wrap">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 h-9 rounded-[8px] flex-1 min-w-[200px]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <Search size={14} className="text-[var(--muted)] shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search leads…"
                className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--subtle)] outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[var(--muted)] hover:text-[var(--text)]">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-sm font-medium transition-colors"
              style={{
                background: hasActiveFilters ? 'var(--accent-dim)' : 'var(--bg-2)',
                color: hasActiveFilters ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${hasActiveFilters ? 'rgba(14,165,255,0.3)' : 'var(--border)'}`,
              }}
            >
              <Filter size={13} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: 'var(--accent)', color: '#06080F' }}>
                  {(filterStatus !== 'all' ? 1 : 0) + (filterUrgency !== 'all' ? 1 : 0)}
                </span>
              )}
              <ChevronDown size={12} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 flex-wrap p-4 rounded-[10px]" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                  {/* Status filter */}
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] block mb-2">Status</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['all', 'new', 'contacted', 'quoted', 'won', 'lost'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setFilterStatus(s)}
                          className="px-2.5 py-1 rounded-[6px] text-xs font-medium capitalize transition-all"
                          style={{
                            background: filterStatus === s ? 'var(--accent-dim)' : 'var(--bg-3)',
                            color: filterStatus === s ? 'var(--accent)' : 'var(--muted)',
                            border: `1px solid ${filterStatus === s ? 'rgba(14,165,255,0.3)' : 'var(--border)'}`,
                          }}
                        >
                          {s === 'all' ? 'All' : s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urgency filter */}
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] block mb-2">Urgency</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['all', 'urgent', 'high', 'medium', 'low'] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => setFilterUrgency(u)}
                          className="px-2.5 py-1 rounded-[6px] text-xs font-medium capitalize transition-all"
                          style={{
                            background: filterUrgency === u ? 'var(--accent-dim)' : 'var(--bg-3)',
                            color: filterUrgency === u ? 'var(--accent)' : 'var(--muted)',
                            border: `1px solid ${filterUrgency === u ? 'rgba(14,165,255,0.3)' : 'var(--border)'}`,
                          }}
                        >
                          {u === 'all' ? 'All' : u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={() => { setFilterStatus('all'); setFilterUrgency('all'); }}
                      className="text-xs text-[var(--muted)] hover:text-[var(--text)] self-end pb-1 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 rounded-[14px] overflow-hidden"
          style={{ border: '1px solid var(--border-2)' }}
        >
          {/* Table header */}
          <div
            className="grid text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] px-4 py-3"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
              background: 'var(--bg-2)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {([
              { label: 'Lead', field: 'name' as SortField },
              { label: 'Status', field: 'status' as SortField },
              { label: 'Urgency', field: 'urgency' as SortField },
              { label: 'Source', field: null },
              { label: 'Created', field: 'created_at' as SortField },
              { label: 'Actions', field: null },
            ] as const).map(col => (
              <button
                key={col.label}
                onClick={() => col.field && toggleSort(col.field)}
                className={`flex items-center gap-1 text-left ${col.field ? 'hover:text-[var(--text)] cursor-pointer' : 'cursor-default'} transition-colors`}
              >
                {col.label}
                {col.field && <SortIcon field={col.field} />}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div style={{ background: 'var(--bg)' }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-2)' }}>
                  <Users size={20} className="text-[var(--muted)]" />
                </div>
                <p className="text-sm text-[var(--muted)]">{search || hasActiveFilters ? 'No leads match your filters' : 'No leads yet'}</p>
                {(search || hasActiveFilters) && (
                  <button
                    onClick={() => { setSearch(''); setFilterStatus('all'); setFilterUrgency('all'); }}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((lead, i) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i < 20 ? i * 0.02 : 0 }}
                    onClick={() => setSelectedLead(lead)}
                    className="grid items-center px-4 py-3.5 cursor-pointer transition-colors hover:bg-[var(--bg-2)] group"
                    style={{
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {/* Lead name + phone */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {lead.name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                        {lead.phone ? formatPhone(lead.phone) : lead.email ?? lead.job_type ?? '—'}
                      </p>
                    </div>

                    {/* Status */}
                    <div><StatusBadge status={lead.status} /></div>

                    {/* Urgency */}
                    <div><UrgencyBadge urgency={lead.urgency} /></div>

                    {/* Source */}
                    <div>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-xs font-medium"
                        style={{ background: 'var(--bg-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                      >
                        {SOURCE_LABELS[lead.source]}
                      </span>
                    </div>

                    {/* Created */}
                    <div className="text-xs text-[var(--muted)]">{timeAgo(lead.created_at)}</div>

                    {/* Actions */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleStatusChange(lead.id, 'contacted')}
                        className="px-2 py-1 rounded-[6px] text-[10px] font-medium transition-colors"
                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(14,165,255,0.25)' }}
                      >
                        Contact
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <p className="text-xs text-[var(--subtle)] text-center">
            Showing {filtered.length} of {allLeads.length} leads
          </p>
        )}
      </div>

      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
      />

      <AddLeadModal
        business={business}
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onAdded={() => refetch()}
      />
    </>
  );
}
