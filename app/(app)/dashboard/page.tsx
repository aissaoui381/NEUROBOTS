import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { DashboardClient } from './dashboard-client';
import type { Business, Lead } from '@/lib/supabase/types';

async function getData(clerkUserId: string) {
  try {
    const supabase = await createServiceClient();
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!business) return { business: null, leads: [] };

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(100);

    return { business: business as Business, leads: (leads ?? []) as Lead[] };
  } catch {
    return { business: null, leads: [] };
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { business, leads } = await getData(userId);

  if (!business) redirect('/onboarding');

  return <DashboardClient business={business} initialLeads={leads} />;
}
