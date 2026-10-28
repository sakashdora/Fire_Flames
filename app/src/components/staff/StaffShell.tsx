'use client';

import { ApiErrorNotice } from '@/components/ui/Notice';
import type { ApiResult } from '@/lib/client/api';

/** Header, tab bar and access errors shared by every staff console. */
export function StaffShell({ badge, title, intro, status, tabs, tab, onTab, children }: {
  badge: string; title: string; intro: string; status: ApiResult | null;
  tabs?: [string, string][]; tab?: string; onTab?: (t: string) => void; children: React.ReactNode;
}) {
  return <div className="ws">
    <div className="ws-head"><span className="badge-gold">{badge}</span><h1>{title}</h1><p>{intro}</p></div>
    {status && !status.ok ? <ApiErrorNotice result={status} /> : !status ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : <>
      {tabs && <div className="ws-tabs" role="tablist">{tabs.map(([id, label]) =>
        <button key={id} role="tab" aria-selected={tab === id} onClick={() => onTab?.(id)}>{label}</button>)}</div>}
      {children}
    </>}
  </div>;
}

export function ResultNotice({ result, success }: { result: ApiResult | null; success: (data: any) => React.ReactNode }) {
  if (!result) return null;
  return result.ok ? <div className="notice notice-ok" role="status">{success(result.data)}</div> : <ApiErrorNotice result={result} />;
}
