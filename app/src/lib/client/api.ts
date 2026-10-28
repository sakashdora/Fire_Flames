'use client';

export interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: { code: string; message: string };
}

/** Calls our own /api routes; never claims success unless the server confirmed it. */
export async function api<T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
      headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    });
    const json = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, status: res.status, data: json.data } : { ok: false, status: res.status, error: json.error ?? { code: 'error', message: 'Request failed.' } };
  } catch {
    return { ok: false, status: 0, error: { code: 'network', message: 'Network error: nothing was saved. Check your connection and try again.' } };
  }
}

export const newIdempotencyKey = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
