import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export function createBrowserSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function createServerSupabaseClient(cookies: {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
}) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookies.set(name, value, options);
        } catch {
          // Server component context
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookies.remove(name, options);
        } catch {
          // Server component context
        }
      }
    }
  });
}
