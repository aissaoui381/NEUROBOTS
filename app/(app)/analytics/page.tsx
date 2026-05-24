import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { AnalyticsClient } from './analytics-client';
import type { Business, Lead } from '@/lib/supabase/types';

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createServiceClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!business) redirect('/onboarding');

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true });

  return <AnalyticsClient business={business as Business} leads={(leads as Lead[]) ?? []} />;
}
