'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, type ApiResult } from '@/lib/client/api';
import { StaffShell, ResultNotice } from '@/components/staff/StaffShell';
import { useAction } from '@/components/staff/useStaffContext';
import { Notice } from '@/components/ui/Notice';

interface Assignment {
  assignment_id: string; event_name: string; entry: string; rubric: string; max_marks: number; conflict_declared: boolean;
  criteria: { id: string; label: string; max_marks: number; conditional: boolean }[];
  scorecard: { id: string; state: string; revision: number; locked_at: string | null; marks: Record<string, number> } | null;
}

export default function JudgeWorkspace() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [status, setStatus] = useState<ApiResult | null>(null);
  const [current, setCurrent] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    const res = await api<Assignment[]>('/api/judge/assignments');
    setStatus(res);
    if (res.ok && res.data) setItems(res.data);
  }, []);
  const { busy, result, setResult, run } = useAction(load);
  useEffect(() => { load(); }, [load]);

  const a = items.find(x => x.assignment_id === current);
  useEffect(() => {
    setResult(null);
    setMarks(Object.fromEntries(Object.entries(a?.scorecard?.marks ?? {}).map(([k, v]) => [k, String(v)])));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, a?.scorecard?.id]);
  const locked = a?.scorecard?.state === 'locked';
  const total = Object.values(marks).reduce((s, v) => s + (Number(v) || 0), 0);

  return <StaffShell badge="JURY" title="Judge workspace" status={status}
    intro="Score only the entries assigned to you. Marks save as a draft; locking is final and can only be reopened by an organizer.">
    {items.length === 0 ? <Notice>You have no judging assignments yet.</Notice> : <div className="ws-grid">
      <div className="ws-card">
        <h2>Assigned entries</h2>
        <ul className="ws-list">{items.map(x => <li key={x.assignment_id}>
          <span><strong>{x.entry}</strong><br /><span className="meta">{x.event_name} · {x.rubric}</span></span>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={x.scorecard?.state === 'locked' ? 'badge-verified' : 'badge-gold'}>{x.scorecard?.state ?? 'not started'}</span>
            <button className="btn-secondary btn-small" onClick={() => setCurrent(x.assignment_id)}>Open</button>
          </span>
        </li>)}</ul>
      </div>
      {a && <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('save', '/api/judge/scorecard', { assignment_id: a.assignment_id, marks, lock: false }); }}>
        <h2>{a.entry} · {a.rubric}</h2>
        {a.conflict_declared && <Notice tone="error">A conflict of interest is recorded for this entry. You cannot score it.</Notice>}
        {a.criteria.map(c => <label key={c.id} className="field">{c.label} (max {c.max_marks}){c.conditional && <small>Conditional criterion</small>}
          <input type="number" min={0} max={c.max_marks} step="0.5" disabled={locked} value={marks[c.id] ?? ''} onChange={e => setMarks(m => ({ ...m, [c.id]: e.target.value }))} />
        </label>)}
        <p style={{ fontWeight: 700 }}>Total: {total} / {a.max_marks}</p>
        <ResultNotice result={result} success={d => d.state === 'locked' ? <>Scorecard locked.</> : <>Draft saved.</>} />
        {locked ? <Notice tone="ok">Locked {a.scorecard?.locked_at ? new Date(a.scorecard.locked_at).toLocaleString('en-IN') : ''}.</Notice> : <div className="row">
          <button className="btn-secondary" disabled={!!busy}>Save draft</button>
          <button type="button" className="btn-primary" disabled={!!busy} onClick={() => { if (confirm('Lock this scorecard? This cannot be undone by you.')) run('lock', '/api/judge/scorecard', { assignment_id: a.assignment_id, marks, lock: true }); }}>Lock scorecard</button>
        </div>}
      </form>}
    </div>}
  </StaffShell>;
}
