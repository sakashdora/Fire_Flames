'use client';
import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from '@/lib/env';

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Browser client for Auth only (sign-in links, MFA). Business commands go through /api routes. */
export function getSupabaseBrowserClient() {
  if (!supabaseConfigured) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
