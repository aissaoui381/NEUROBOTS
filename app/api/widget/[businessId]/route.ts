import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('ai_name, ai_greeting, accent_color, name, service_type, city, state')
    .eq('id', businessId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: CORS });
  }

  return NextResponse.json(data, { headers: CORS });
}
