import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Reports what this deployment can actually reach; it never asserts unverified readiness.
export async function GET() {
  const supabase = await createSupabaseServerClient();
  let database: 'not_configured' | 'reachable' | 'unreachable' | 'not_migrated' = 'not_configured';
  if (supabase) {
    const { error } = await supabase.rpc('ff_public_catalogue', {});
    database = !error ? 'reachable' : error.code === 'PGRST202' ? 'not_migrated' : 'unreachable';
  }
  return NextResponse.json({
    status: database === 'reachable' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'fire-and-flames',
    database,
    pass_encryption_key: /^[0-9a-f]{64}$/i.test(process.env.PASS_ENCRYPTION_KEY ?? '') ? 'configured' : 'missing',
  }, { status: database === 'reachable' ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
