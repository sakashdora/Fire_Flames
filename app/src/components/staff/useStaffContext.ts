'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, type ApiResult } from '@/lib/client/api';

export interface RosterMember { member_id: string; profile_id: string; ign: string; player_uid: string; slot_type: string; is_igl: boolean }
export interface StaffContext {
  event: { id: string; slug: string; name: string; state: string };
  sessions: { id: string; label: string; starts_at: string; ends_at: string }[];
  stations: { id: string; name: string; kind: string }[];
  matches: { id: string; round_label: string; match_number: number; state: string }[];
  scoring_versions: { id: string; version: number; name: string; kill_multiplier: number | null; tie_break_policy: string | null; approval_state: string; placement_points: { place: number; points: number }[] }[];
  entries: { id: string; name: string; state: string; roster: RosterMember[] }[];
  results: { id: string; match_id: string; revision: number; state: string; recorded_by_me: boolean; results: { entry_id: string; placement: number; kills: number; total_points: number }[] }[];
}

export function useStaffContext(eventSlug: string) {
  const [ctx, setCtx] = useState<StaffContext | null>(null);
  const [status, setStatus] = useState<ApiResult | null>(null);
  const reload = useCallback(async () => {
    if (!eventSlug) { setStatus(null); setCtx(null); return; }
    const res = await api<StaffContext>(`/api/staff/context?event=${encodeURIComponent(eventSlug)}`);
    setStatus(res);
    setCtx(res.ok ? res.data ?? null : null);
  }, [eventSlug]);
  useEffect(() => { reload(); }, [reload]);
  return { ctx, status, reload };
}

/** Shared submit helper: one action at a time, result shown verbatim from the server. */
export function useAction(onSuccess?: () => void) {
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const run = async (label: string, path: string, body?: unknown, method?: string) => {
    setBusy(label); setResult(null);
    const res = await api(path, { body, method });
    setResult(res); setBusy(null);
    if (res.ok) onSuccess?.();
    return res;
  };
  return { busy, result, setResult, run };
}

export const formData = (e: React.FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
