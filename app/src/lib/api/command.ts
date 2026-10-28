import 'server-only';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapDatabaseError } from '@/lib/api/errors';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

/**
 * Runs one public.ff_* command as the signed-in user. The actor is always the session user:
 * request bodies never supply actor, reviewer or approver identities.
 */
export async function runCommand(fn: string, args: Record<string, unknown> = {}, init: { anonymous?: boolean } = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, 'not_configured', 'Supabase is not configured for this deployment.');
  if (!init.anonymous) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return jsonError(401, 'unauthenticated', 'Sign in required.');
  }
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const mapped = mapDatabaseError(error);
    if (mapped.status >= 500) console.error(`[command] ${fn} failed`, { code: error.code });
    return jsonError(mapped.status, mapped.code, mapped.message);
  }
  return NextResponse.json({ data }, { headers: NO_STORE });
}

export const str = (v: unknown) => (typeof v === 'string' ? v : null);
export const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : NaN);
export const bool = (v: unknown) => v === true;
