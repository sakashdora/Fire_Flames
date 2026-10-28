'use client';

import { useState } from 'react';
import { StaffShell, ResultNotice } from '@/components/staff/StaffShell';
import { formData, useAction, useStaffContext } from '@/components/staff/useStaffContext';

const TABS: [string, string][] = [['hardware', 'Hardware sign-off'], ['incident', 'Pause & incidents'], ['substitute', 'Substitution'], ['identity', 'Identity check'], ['results', 'Match results']];

export default function RefereeConsole() {
  const [event, setEvent] = useState('bgmi');
  const [tab, setTab] = useState('hardware');
  const { ctx, status, reload } = useStaffContext(event);
  const { busy, result, setResult, run } = useAction(reload);
  const [entryId, setEntryId] = useState('');
  const [rows, setRows] = useState<Record<string, { placement: string; kills: string }>>({});
  const switchTab = (t: string) => { setTab(t); setResult(null); };
  const roster = ctx?.entries.find(e => e.id === entryId)?.roster ?? [];
  const approved = ctx?.scoring_versions.find(v => v.approval_state === 'approved');

  return <StaffShell badge="ESPORTS · REFEREE" title="Referee console" status={status} tabs={TABS} tab={tab} onTab={switchTab}
    intro="Every action is recorded under your own account with an append-only audit trail. Decisions are human calls; nothing is disqualified automatically.">
    {ctx && <div className="stack">
      <div className="row" style={{ maxWidth: 420 }}>
        <label className="field">Event<select value={event} onChange={e => setEvent(e.target.value)}><option value="bgmi">Kalinga BGMI Clash</option><option value="free-fire">Free Fire</option></select></label>
      </div>

      {tab === 'hardware' && <form className="ws-card stack" onSubmit={e => { e.preventDefault(); const f = formData(e); run('hw', '/api/referee/hardware-signoff', f); }}>
        <h2>Station hardware sign-off</h2>
        {ctx.stations.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No stations exist for this event yet. An admin creates them in the admin console.</p> : <>
          <div className="row">
            <label className="field">Station<select name="station_id" required>{ctx.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label className="field">Session<select name="session_id"><option value="">—</option>{ctx.sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
          </div>
          <div className="row">
            <label className="field">Asset code<input name="asset_code" required placeholder="Label on the device" /></label>
            <label className="field">Configuration version<input name="config_version" required placeholder="Approved setup version" /></label>
            <label className="field">Result<select name="result"><option value="passed">Passed</option><option value="flagged">Flagged</option><option value="failed">Failed</option></select></label>
          </div>
          <label className="field">Notes<small>Required when flagged or failed</small><input name="reason" /></label>
          <ResultNotice result={result} success={d => <>Sign-off recorded ({d.result}) at {new Date(d.checked_at).toLocaleTimeString('en-IN')}.</>} />
          <button className="btn-primary" disabled={busy === 'hw'}>{busy === 'hw' ? 'Recording…' : 'Record sign-off'}</button>
        </>}
      </form>}

      {tab === 'incident' && <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('inc', '/api/referee/pause-incident', formData(e)); }}>
        <h2>Pause or technical incident</h2>
        {ctx.matches.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No matches are scheduled yet.</p> : <>
          <div className="row">
            <label className="field">Match<select name="match_id" required>{ctx.matches.map(m => <option key={m.id} value={m.id}>{m.round_label} · Match {m.match_number}</option>)}</select></label>
            <label className="field">Team<select name="entry_id"><option value="">Whole lobby</option>{ctx.entries.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          </div>
          <div className="row">
            <label className="field">Request<select name="request_type">{['pause', 'disconnect', 'restart', 'integrity', 'penalty', 'disqualification'].map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="field">Decision<select name="decision">{['granted', 'denied', 'resumed', 'restarted', 'penalty', 'disqualification'].map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="field">Duration (seconds)<input name="duration_seconds" type="number" min={0} /></label>
            <label className="field">Penalty points<input name="penalty_points" type="number" min={0} step="0.5" /></label>
          </div>
          <label className="field">Reason<input name="reason" required /></label>
          <ResultNotice result={result} success={d => <>Decision “{d.decision}” recorded.</>} />
          <button className="btn-primary" disabled={busy === 'inc'}>{busy === 'inc' ? 'Recording…' : 'Record decision'}</button>
        </>}
      </form>}

      {tab === 'substitute' && <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('sub', '/api/referee/activate-substitute', { ...formData(e), entry_id: entryId }); }}>
        <h2>In-match substitution</h2>
        <div className="row">
          <label className="field">Match<select name="match_id" required>{ctx.matches.map(m => <option key={m.id} value={m.id}>{m.round_label} · Match {m.match_number}</option>)}</select></label>
          <label className="field">Team<select required value={entryId} onChange={e => setEntryId(e.target.value)}><option value="">Choose team</option>{ctx.entries.filter(t => t.roster.length).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        </div>
        {entryId && <div className="row">
          <label className="field">Starter leaving<select name="starter_member_id" required>{roster.filter(m => m.slot_type === 'starter').map(m => <option key={m.member_id} value={m.member_id}>{m.ign}</option>)}</select></label>
          <label className="field">Substitute entering<select name="substitute_member_id" required>{roster.filter(m => m.slot_type === 'substitute').map(m => <option key={m.member_id} value={m.member_id}>{m.ign}</option>)}</select></label>
        </div>}
        <label className="field">Reason<input name="reason" required /></label>
        <ResultNotice result={result} success={() => <>Substitution recorded.</>} />
        <button className="btn-primary" disabled={busy === 'sub' || !entryId}>Record substitution</button>
      </form>}

      {tab === 'identity' && <form className="ws-card stack" onSubmit={e => { e.preventDefault(); run('id', '/api/identity/verify', { ...formData(e), event_slug: event, method: 'in_person' }); }}>
        <h2>In-person identity check</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Look at the original document. Do not photograph it or type its number anywhere.</p>
        <div className="row">
          <label className="field">Team<select required value={entryId} onChange={e => setEntryId(e.target.value)}><option value="">Choose team</option>{ctx.entries.filter(t => t.roster.length).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label className="field">Player<select name="profile_id" required>{roster.map(m => <option key={m.profile_id} value={m.profile_id}>{m.ign}</option>)}</select></label>
        </div>
        <div className="row">
          <label className="field">Document type<select name="proof_type"><option value="aadhaar">Aadhaar</option><option value="pan">PAN</option><option value="voter_id">Voter ID</option><option value="college_id">College ID</option></select></label>
          <label className="field">Outcome<select name="status"><option value="verified">Verified</option><option value="rejected">Rejected</option></select></label>
        </div>
        <label className="field">Reason (if rejected)<input name="rejection_reason" /></label>
        <ResultNotice result={result} success={d => <>Identity check recorded as {d.status}.</>} />
        <button className="btn-primary" disabled={busy === 'id'}>Record check</button>
      </form>}

      {tab === 'results' && <div className="stack">
        {!approved ? <div className="notice notice-info">Results can be recorded once an admin approves the scoring rules (kill points and tie-break policy).</div>
          : <form className="ws-card stack" onSubmit={e => {
              e.preventDefault();
              const f = formData(e);
              run('res', '/api/scoring/record-result', { match_id: f.match_id, results: Object.entries(rows).filter(([, r]) => r.placement).map(([entry_id, r]) => ({ entry_id, placement: Number(r.placement), kills: Number(r.kills || 0) })) });
            }}>
            <h2>Record match result</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Points are calculated by the server from approved scoring version {approved.version} ({approved.kill_multiplier} per kill).</p>
            <label className="field">Match<select name="match_id" required>{ctx.matches.map(m => <option key={m.id} value={m.id}>{m.round_label} · Match {m.match_number}</option>)}</select></label>
            <div className="ws-scroll"><table className="ws-table"><thead><tr><th>Team</th><th>Placement</th><th>Kills</th></tr></thead><tbody>
              {ctx.entries.map(t => <tr key={t.id}><td>{t.name}</td>
                <td><input type="number" min={1} style={{ width: 80 }} value={rows[t.id]?.placement ?? ''} onChange={e => setRows(r => ({ ...r, [t.id]: { kills: r[t.id]?.kills ?? '', placement: e.target.value } }))} /></td>
                <td><input type="number" min={0} style={{ width: 80 }} value={rows[t.id]?.kills ?? ''} onChange={e => setRows(r => ({ ...r, [t.id]: { placement: r[t.id]?.placement ?? '', kills: e.target.value } }))} /></td></tr>)}
            </tbody></table></div>
            <ResultNotice result={result} success={d => <>Draft revision {d.revision} recorded. A different official must review it.</>} />
            <button className="btn-primary" disabled={busy === 'res'}>Record result</button>
          </form>}
        <div className="ws-card">
          <h2>Results awaiting review</h2>
          {ctx.results.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No results recorded yet.</p> : <ul className="ws-list">{ctx.results.map(r => {
            const m = ctx.matches.find(x => x.id === r.match_id);
            return <li key={r.id}><span>{m ? `${m.round_label} · Match ${m.match_number}` : 'Match'} · revision {r.revision}<br /><span className="meta">{r.results.map(x => `${ctx.entries.find(e => e.id === x.entry_id)?.name ?? 'Team'}: #${x.placement}, ${x.total_points} pts`).join(' · ')}</span></span>
              {r.state === 'draft' && !r.recorded_by_me ? <button className="btn-secondary btn-small" disabled={busy === r.id} onClick={() => run(r.id, '/api/scoring/review-result', { revision_id: r.id })}>Confirm review</button>
                : <span className={r.state === 'reviewed' ? 'badge-verified' : 'badge-gold'}>{r.state === 'draft' ? 'Awaiting another official' : r.state}</span>}
            </li>;
          })}</ul>}
        </div>
      </div>}
    </div>}
  </StaffShell>;
}
