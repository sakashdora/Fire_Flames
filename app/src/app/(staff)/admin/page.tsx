'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, type ApiResult } from '@/lib/client/api';
import { StaffShell, ResultNotice } from '@/components/staff/StaffShell';
import { formData, useAction, useStaffContext } from '@/components/staff/useStaffContext';
import { Notice } from '@/components/ui/Notice';

interface AdminEvent {
  slug: string; name: string; track: string; state: string; registration_enabled: boolean; capacity: number | null; capacity_unit: string; reserved: number;
  registrations: Record<string, number>;
  version: { version: number; approval_state: string; team_min: number | null; team_max: number | null; public_description: string; rules_text: string; prices: { mode: string; amount_paise: number | null; enabled: boolean }[] };
}
interface Overview { is_super_admin: boolean; events: AdminEvent[]; staff: { id: string; name: string; email: string; role: string; event: string | null; ends_at: string }[] }

const TABS: [string, string][] = [['events', 'Events'], ['staff', 'Staff'], ['operations', 'LAN & judging setup'], ['scoring', 'Esports scoring'], ['payments', 'Payments']];
const rupees = (p: number | null) => (p === null ? 'not set' : `₹${(p / 100).toLocaleString('en-IN')}`);

export default function AdminConsole() {
  const [tab, setTab] = useState('events');
  const [ov, setOv] = useState<Overview | null>(null);
  const [status, setStatus] = useState<ApiResult | null>(null);
  const [slug, setSlug] = useState('');
  const load = useCallback(async () => {
    const res = await api<Overview>('/api/admin/overview');
    setStatus(res);
    if (res.ok && res.data) { setOv(res.data); setSlug(s => s || res.data!.events[0]?.slug || ''); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const { busy, result, setResult, run } = useAction(load);
  const ev = ov?.events.find(e => e.slug === slug);
  const opsEvent = slug || 'bgmi';
  const staffCtx = useStaffContext(tab === 'operations' || tab === 'scoring' ? (tab === 'scoring' ? 'bgmi' : opsEvent) : '');
  const switchTab = (t: string) => { setTab(t); setResult(null); };

  const eventPicker = ov && <label className="field" style={{ maxWidth: 420 }}>Event
    <select value={slug} onChange={e => { setSlug(e.target.value); setResult(null); }}>{ov.events.map(e => <option key={e.slug} value={e.slug}>{e.name} · {e.state}</option>)}</select>
  </label>;

  return <StaffShell badge="ADMINISTRATION" title="Admin console" status={status} tabs={TABS} tab={tab} onTab={switchTab}
    intro="Changes take effect immediately and are recorded in the audit log under your account.">
    {ov && <div className="stack">
      {tab === 'events' && <>
        {eventPicker}
        {ev && <div className="ws-grid">
          <div className="ws-card">
            <h2>{ev.name}</h2>
            <ul className="ws-list">
              <li><span>Status</span><span className={ev.state === 'published' ? 'badge-verified' : 'badge-gold'}>{ev.state}{ev.registration_enabled ? ' · registration open' : ''}</span></li>
              <li><span>Capacity</span><span>{ev.capacity ?? 'not approved'} {ev.capacity_unit}s · {ev.reserved} held</span></li>
              <li><span>Team size</span><span>{ev.version.team_min ?? '—'}–{ev.version.team_max ?? '—'}</span></li>
              {ev.version.prices.map(p => <li key={p.mode}><span>{p.mode} fee</span><span>{rupees(p.amount_paise)}{p.enabled ? ' · live' : ''}</span></li>)}
              <li><span>Registrations</span><span>{Object.entries(ev.registrations).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'none'}</span></li>
            </ul>
            {ev.state === 'published' && <div className="row" style={{ marginTop: 14 }}>
              <button className={ev.registration_enabled ? 'btn-secondary' : 'btn-primary'} disabled={busy === 'reg'}
                onClick={() => run('reg', `/api/admin/events/${ev.slug}`, { action: 'registration', enabled: !ev.registration_enabled })}>
                {ev.registration_enabled ? 'Close registration' : 'Open registration'}</button>
            </div>}
          </div>

          {ev.version.approval_state === 'draft' && <div className="stack">
            {ov.is_super_admin && <form className="ws-card stack" onSubmit={e => {
              e.preventDefault(); const f = formData(e);
              const prices = Object.fromEntries(ev.version.prices.filter(p => p.mode !== 'individual').map(p => [p.mode, f[`price_${p.mode}`] ? String(Math.round(Number(f[`price_${p.mode}`]) * 100)) : null]));
              run('cfg', `/api/admin/events/${ev.slug}`, { action: 'configure', capacity: f.capacity, team_min: f.team_min, team_max: f.team_max, prices, reason: f.reason });
            }}>
              <h2>Organizer decisions</h2>
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Enter only values the organizers have confirmed in writing. Leave a field empty if it is still undecided.</p>
              <div className="row">
                <label className="field">Capacity<input name="capacity" type="number" min={1} defaultValue={ev.capacity ?? ''} /></label>
                <label className="field">Min team<input name="team_min" type="number" min={1} defaultValue={ev.version.team_min ?? ''} /></label>
                <label className="field">Max team<input name="team_max" type="number" min={1} defaultValue={ev.version.team_max ?? ''} /></label>
              </div>
              <div className="row">{ev.version.prices.filter(p => p.mode !== 'individual').map(p =>
                <label key={p.mode} className="field">{p.mode} fee (₹)<input name={`price_${p.mode}`} type="number" min={1} step="1" defaultValue={p.amount_paise === null ? '' : p.amount_paise / 100} /></label>)}</div>
              <label className="field">Source of decision<small>e.g. “ED Cell circular dated …”</small><input name="reason" required /></label>
              <button className="btn-secondary" disabled={busy === 'cfg'}>Save decisions</button>
            </form>}
            <form className="ws-card stack" onSubmit={e => { e.preventDefault(); const f = formData(e); run('pub', `/api/admin/events/${ev.slug}`, { action: 'publish', ...f }); }}>
              <h2>Publish with official rules</h2>
              <label className="field">Public description<textarea name="public_description" required defaultValue={ev.version.public_description} style={{ minHeight: 80 }} /></label>
              <label className="field">Official rules and declaration<small>Paste the approved text. Teams accept exactly this text; it cannot be edited after publishing.</small><textarea name="rules_text" required minLength={40} /></label>
              <button className="btn-primary" disabled={busy === 'pub'} onClick={e => { if (!confirm('Publish this event? Fees, capacity and rules become fixed.')) e.preventDefault(); }}>Publish event</button>
            </form>
          </div>}
        </div>}
      </>}

      {tab === 'staff' && <div className="ws-grid">
        <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('grant', '/api/admin/staff', formData(e)); }}>
          <h2>Grant a role</h2>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>The person must have signed in and saved a profile first.</p>
          <label className="field">Email<input name="email" type="email" required /></label>
          <div className="row">
            <label className="field">Role<select name="role">
              {['referee', 'volunteer', 'judge', 'teacher'].map(r => <option key={r}>{r}</option>)}
              {ov.is_super_admin && ['event_admin', 'finance_reviewer', 'export_operator', 'super_admin'].map(r => <option key={r}>{r}</option>)}
            </select></label>
            <label className="field">Event<select name="event_slug"><option value="">All (super admin only)</option>{ov.events.map(e => <option key={e.slug} value={e.slug}>{e.name}</option>)}</select></label>
            <label className="field">Days<input name="days" type="number" min={1} max={365} defaultValue={30} /></label>
          </div>
          <label className="field">Reason<input name="reason" required /></label>
          <button className="btn-primary" disabled={busy === 'grant'}>Grant role</button>
        </form>
        <div className="ws-card">
          <h2>Active staff</h2>
          <div className="ws-scroll"><table className="ws-table"><thead><tr><th>Name</th><th>Role</th><th>Event</th><th></th></tr></thead><tbody>
            {ov.staff.map(s => <tr key={s.id}><td>{s.name}<br /><span className="meta">{s.email}</span></td><td>{s.role}</td><td>{s.event ?? 'All'}</td>
              <td><button className="btn-secondary btn-small" disabled={busy === s.id} onClick={() => { const reason = prompt('Reason for removing this role?'); if (reason) run(s.id, `/api/admin/staff/${s.id}`, { reason }, 'DELETE'); }}>Revoke</button></td></tr>)}
          </tbody></table></div>
        </div>
      </div>}

      {tab === 'operations' && <>
        {eventPicker}
        {staffCtx.status && !staffCtx.status.ok ? <ResultNotice result={staffCtx.status} success={() => null} /> : staffCtx.ctx && <div className="ws-grid">
          <form className="ws-card stack" onSubmit={e => { e.preventDefault(); const f = formData(e); run('session', '/api/admin/operations', { kind: 'session', event_slug: opsEvent, label: f.label, starts_at: new Date(f.starts_at).toISOString(), ends_at: new Date(f.ends_at).toISOString() }).then(staffCtx.reload); }}>
            <h2>Session</h2>
            <label className="field">Label<input name="label" required placeholder="Day 1 morning" /></label>
            <div className="row"><label className="field">Starts<input name="starts_at" type="datetime-local" required /></label><label className="field">Ends<input name="ends_at" type="datetime-local" required /></label></div>
            <button className="btn-secondary" disabled={!!busy}>Create session</button>
          </form>
          <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('station', '/api/admin/operations', { kind: 'station', event_slug: opsEvent, ...formData(e) }).then(staffCtx.reload); }}>
            <h2>Station</h2>
            <label className="field">Name<input name="name" required placeholder="Gate 1 or PC-01" /></label>
            <label className="field">Type<select name="station_kind"><option value="entry">Entry gate</option><option value="checkpoint">Checkpoint / LAN station</option><option value="helpdesk">Help desk</option></select></label>
            <button className="btn-secondary" disabled={!!busy}>Create station</button>
          </form>
          <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('duty', '/api/admin/operations', { kind: 'duty', ...formData(e) }); }}>
            <h2>Assign duty</h2>
            <label className="field">Volunteer or referee email<input name="email" type="email" required /></label>
            <div className="row">
              <label className="field">Session<select name="session_id" required>{staffCtx.ctx.sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
              <label className="field">Station<select name="station_id" required>{staffCtx.ctx.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            </div>
            <button className="btn-secondary" disabled={!!busy}>Assign duty</button>
          </form>
          {ev?.track === 'esports' && <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('match', '/api/admin/operations', { kind: 'match', event_slug: opsEvent, ...formData(e) }).then(staffCtx.reload); }}>
            <h2>Match</h2>
            <div className="row"><label className="field">Round<input name="round_label" required placeholder="Qualifier" /></label><label className="field">Match no.<input name="match_number" type="number" min={1} required /></label></div>
            <label className="field">Session<select name="session_id"><option value="">—</option>{staffCtx.ctx.sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
            <button className="btn-secondary" disabled={!!busy}>Create match</button>
          </form>}
          {ev?.track === 'e-fest' && <form className="ws-card stack" onSubmit={e => {
            e.preventDefault(); const f = formData(e);
            const criteria = f.criteria.split('\n').map(l => l.split('|')).filter(p => p[0]?.trim()).map(([label, max]) => ({ label: label.trim(), max_marks: Number(max) }));
            run('rubric', '/api/admin/operations', { kind: 'rubric', event_slug: opsEvent, name: f.name, criteria });
          }}>
            <h2>Judging rubric</h2>
            <label className="field">Name<input name="name" required /></label>
            <label className="field">Criteria<small>One per line: Label | max marks</small><textarea name="criteria" required placeholder={'Innovation | 10\nPresentation | 10'} /></label>
            <button className="btn-secondary" disabled={!!busy}>Create rubric</button>
          </form>}
        </div>}
        <ResultNotice result={result} success={() => <>Saved.</>} />
      </>}

      {tab === 'scoring' && (staffCtx.ctx ? <div className="stack">{staffCtx.ctx.scoring_versions.map(v => <form key={v.id} className="ws-card stack" onSubmit={e => {
        e.preventDefault(); const f = formData(e); run('score', '/api/scoring/approve', { scoring_version_id: v.id, kill_multiplier: f.kill_multiplier, tie_break_policy: f.tie_break_policy }).then(staffCtx.reload);
      }}>
        <h2>{v.name} · version {v.version} · {v.approval_state}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Placement points: {v.placement_points.map(p => `${p.place}:${p.points}`).join(' · ')}</p>
        {v.approval_state === 'draft' ? <>
          <Notice>Approval needs the organizers’ confirmed kill points and tie-break rule. The system will not guess either.</Notice>
          <div className="row"><label className="field">Points per kill<input name="kill_multiplier" type="number" min={0} step="0.5" defaultValue={v.kill_multiplier ?? ''} required /></label></div>
          <label className="field">Tie-break policy<textarea name="tie_break_policy" required defaultValue={v.tie_break_policy ?? ''} style={{ minHeight: 80 }} /></label>
          <button className="btn-primary" disabled={busy === 'score'}>Save and approve</button>
        </> : <p>Kill points {v.kill_multiplier} · Tie-break: {v.tie_break_policy}</p>}
      </form>)}<ResultNotice result={result} success={() => <>Scoring version approved.</>} /></div> : staffCtx.status && <ResultNotice result={staffCtx.status} success={() => null} />)}

      {tab === 'payments' && <div className="ws-card stack">
        <h2>Payment profile</h2>
        <Notice>Payments stay closed until the official college payment QR is uploaded to the private evidence bucket and two different super admins verify the beneficiary against college finance records. That storage bucket and upload workflow are not set up yet, so no payment details are shown to participants.</Notice>
      </div>}

      {tab !== 'operations' && tab !== 'scoring' && <ResultNotice result={result} success={() => <>Saved.</>} />}
    </div>}
  </StaffShell>;
}
