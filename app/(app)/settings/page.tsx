import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';
import type { Business } from '@/lib/supabase/types';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createServiceClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!business) redirect('/onboarding');

  return <SettingsClient business={business as Business} />;
}
