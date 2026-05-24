import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { WidgetClient } from './widget-client';
import type { Business } from '@/lib/supabase/types';

export default async function WidgetPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createServiceClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!business) redirect('/onboarding');

  return <WidgetClient business={business as Business} />;
}
