import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { ToastProvider } from '@/components/ui/toast';
import type { Business } from '@/lib/supabase/types';

async function getBusiness(clerkUserId: string): Promise<Business | null> {
  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();
    return data as Business | null;
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const business = await getBusiness(userId);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:flex">
          <Sidebar plan={business?.plan ?? 'trial'} />
        </div>

        {/* Right column: mobile topbar + scrollable content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MobileNav plan={business?.plan ?? 'trial'} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
