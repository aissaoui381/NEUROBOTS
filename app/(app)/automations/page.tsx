import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { AutomationsClient } from './automations-client';
import type { Business, Automation } from '@/lib/supabase/types';

export default async function AutomationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createServiceClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!business) redirect('/onboarding');

  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true });

  return (
    <AutomationsClient
      business={business as Business}
      initialAutomations={(automations as Automation[]) ?? []}
    />
  );
}
