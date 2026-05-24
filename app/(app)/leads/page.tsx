import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { LeadsClient } from './leads-client';
import type { Business, Lead } from '@/lib/supabase/types';

async function getData(userId: string) {
  const supabase = await createServiceClient();

  const [businessResult, leadsResult] = await Promise.all([
    supabase.from('businesses').select('*').eq('clerk_user_id', userId).single(),
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  return {
    business: businessResult.data as Business | null,
    leads: (leadsResult.data as Lead[]) ?? [],
  };
}

export default async function LeadsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { business, leads } = await getData(userId);
  if (!business) redirect('/onboarding');

  // Filter leads to this business
  const businessLeads = leads.filter(l => l.business_id === business.id);

  return <LeadsClient business={business} initialLeads={businessLeads} />;
}
