'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lead } from '@/lib/supabase/types';
import { useToast } from '@/components/ui/toast';

export function useLeads(businessId: string | undefined) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    if (!businessId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!businessId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`leads:${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads(prev => [newLead, ...prev]);
          toast({
            type: 'lead',
            title: `🔥 New lead from ${newLead.name ?? 'Unknown'}`,
            description: newLead.job_type ?? 'New inquiry',
            duration: 8000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          const updated = payload.new as Lead;
          setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, toast]);

  const updateLeadStatus = useCallback(async (leadId: string, status: Lead['status']) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    }
    return !error;
  }, []);

  return { leads, loading, refetch: fetchLeads, updateLeadStatus };
}
