'use client';

import { Phone, Clock } from 'lucide-react';
import { UrgencyBadge } from '@/components/ui/badge';
import { timeAgo, formatPhone } from '@/lib/utils';
import type { Lead } from '@/lib/supabase/types';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  isDragging?: boolean;
}

export function LeadCard({ lead, onClick, isDragging }: LeadCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[var(--bg-3)] border border-[var(--border)] rounded-[12px] p-3.5 cursor-pointer group transition-all duration-200"
      style={{
        boxShadow: isDragging ? '0 20px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,255,0.3)' : undefined,
        transform: isDragging ? 'rotate(1.5deg) scale(1.02)' : undefined,
        borderColor: isDragging ? 'rgba(14,165,255,0.4)' : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <div className="font-semibold text-sm text-[var(--text)] leading-tight">{lead.name ?? 'Unknown'}</div>
          {lead.job_type && (
            <div className="text-xs text-[var(--muted)] mt-0.5">{lead.job_type}</div>
          )}
        </div>
        <UrgencyBadge urgency={lead.urgency} />
      </div>

      {lead.phone && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-2">
          <Phone size={11} className="shrink-0" />
          {formatPhone(lead.phone)}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
          <Clock size={10} />
          {timeAgo(lead.created_at)}
        </div>
        {lead.source && (
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--subtle)]">{lead.source}</span>
        )}
      </div>
    </div>
  );
}
