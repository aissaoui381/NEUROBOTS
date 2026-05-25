import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const supabase = await createServiceClient();

  // Verify ownership: automation must belong to a business owned by this user.
  const { data: automation } = await supabase
    .from('automations')
    .select('id, businesses!inner(clerk_user_id)')
    .eq('id', id)
    .single();

  type OwnedAutomation = { id: string; businesses: { clerk_user_id: string } };
  const owner = (automation as unknown as OwnedAutomation | null)?.businesses?.clerk_user_id;
  if (!automation || owner !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('automations')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
