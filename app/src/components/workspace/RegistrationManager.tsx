'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy } from 'lucide-react';
import { api, newIdempotencyKey, type ApiResult } from '@/lib/client/api';
import { ApiErrorNotice, Notice } from '@/components/ui/Notice';

interface Member { profile_id: string; display_name: string; is_owner: boolean }
interface Detail {
  id: string; reference: string; state: string; mode: string; is_owner: boolean; rules_accepted_at: string | null;
  event: { slug: string; name: string; track: string; capacity: number | null };
  team: { name: string; min: number | null; max: number | null };
  rules: { version: string; text: string; hash: string };
  price: { mode: string; amount_paise: number | null; enabled: boolean } | null;
  is_esports_roster: boolean;
  members: Member[];
  invitations: { id: string; email: string; expires_at: string; status: string }[];
  roster: { state: string; revision: number; members: { profile_id: string; slot_type: string; ign: string; player_uid: string; is_igl: boolean }[] } | null;
  declaration: { accepted_at: string; hash: string; version: string } | null;
  reservation: { state: string; expires_at: string } | null;
}

type Slot = { profile_id: string; ign: string; player_uid: string };

export default function RegistrationManager({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [load, setLoad] = useState<ApiResult | null>(null);
  const [action, setAction] = useState<ApiResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [starters, setStarters] = useState<Slot[]>([]);
  const [igl, setIgl] = useState(0);
  const [sub, setSub] = useState<Slot>({ profile_id: '', ign: '', player_uid: '' });
  const [rosterKey, setRosterKey] = useState(newIdempotencyKey);
  const [reserveKey] = useState(newIdempotencyKey);

  const refresh = useCallback(async () => {
    const res = await api<Detail>(`/api/registrations/${id}`);
    setLoad(res);
    if (res.ok && res.data) {
      setDetail(res.data);
      const current = res.data.roster?.members ?? [];
      const s = current.filter(m => m.slot_type === 'starter');
      setStarters(Array.from({ length: 4 }, (_, i) => s[i] ? { profile_id: s[i].profile_id, ign: s[i].ign, player_uid: s[i].player_uid } : { profile_id: '', ign: '', player_uid: '' }));
      setIgl(Math.max(s.findIndex(m => m.is_igl), 0));
      const x = current.find(m => m.slot_type === 'substitute');
      setSub(x ? { profile_id: x.profile_id, ign: x.ign, player_uid: x.player_uid } : { profile_id: '', ign: '', player_uid: '' });
    }
  }, [id]);
  useEffect(() => { refresh(); }, [refresh]);

  const run = async (label: string, path: string, body: unknown, method?: string) => {
    setBusy(label); setAction(null);
    const res = await api(path, { body, method });
    setAction(res); setBusy(null);
    if (res.ok) await refresh();
    return res;
  };

  if (!detail) return load && !load.ok ? <ApiErrorNotice result={load} /> : <p style={{ color: 'var(--text-muted)' }}>Loading registration…</p>;

  const d = detail;
  const editable = ['draft', 'awaiting_members'].includes(d.state);
  const enoughMembers = !d.team.min || d.members.length >= d.team.min;
  const rosterDone = !d.is_esports_roster || ['submitted', 'locked'].includes(d.roster?.state ?? '');
  const held = d.reservation && ['held', 'review_hold', 'confirmed'].includes(d.reservation.state);
  const pickable = (current: string, others: string[]) => d.members.filter(m => m.profile_id === current || !others.includes(m.profile_id));
  const chosen = [...starters.map(s => s.profile_id), sub.profile_id].filter(Boolean);

  const submitRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await run('roster', '/api/roster/submit', {
      registration_id: d.id, idempotency_key: rosterKey,
      starters: starters.map((s, i) => ({ ...s, is_igl: i === igl })),
      substitute: sub.profile_id ? sub : null,
    });
    if (res.ok) setRosterKey(newIdempotencyKey());
  };

  return <>
    <div className="ws-head">
      <span className="badge-gold">{d.event.name.toUpperCase()}</span>
      <h1>{d.team.name}</h1>
      <p>Reference <span className="mono">{d.reference}</span> · {d.is_owner ? 'You are the captain.' : 'You are a team member.'}</p>
    </div>

    <ol className="steps ws-card" style={{ marginBottom: 18 }}>
      <li data-done={enoughMembers}>Team members{d.team.min ? ` (at least ${d.team.min})` : ''}</li>
      {d.is_esports_roster && <li data-done={rosterDone}>Squad roster: 4 starters, 1 IGL, optional substitute</li>}
      <li data-done={!!d.declaration}>Accept the official rules ({d.rules.version})</li>
      <li data-done={!!held}>Hold your place</li>
      <li data-done={d.state === 'confirmed'}>Payment and confirmation</li>
    </ol>

    {action && <div style={{ marginBottom: 18 }}><ApiErrorNotice result={action} /></div>}

    <div className="ws-grid">
      <div className="ws-card">
        <h2>Team members</h2>
        <ul className="ws-list">{d.members.map(m => <li key={m.profile_id}><span>{m.display_name}</span>{m.is_owner && <span className="badge-gold">Captain</span>}</li>)}</ul>
        {d.is_owner && d.mode === 'team' && editable && <>
          <h3>Invite a teammate</h3>
          <form className="row" onSubmit={async e => {
            e.preventDefault();
            const res = await run('invite', `/api/registrations/${d.id}/invitations`, { email });
            if (res.ok) { setInviteUrl(res.data.invite_url); setEmail(''); }
          }}>
            <label className="field">Teammate's email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
            <button className="btn-primary btn-small" disabled={busy === 'invite'} style={{ flex: '0 0 auto' }}>{busy === 'invite' ? 'Creating…' : 'Create invite link'}</button>
          </form>
          {inviteUrl && <div style={{ marginTop: 12 }}><Notice tone="ok">
            Invitation created. Automatic email is not set up yet, so send this one-time link to your teammate yourself. It only works for the email you entered and expires in 7 days.
            <div className="mono" style={{ margin: '8px 0' }}>{inviteUrl}</div>
            <button type="button" className="btn-secondary btn-small" onClick={() => navigator.clipboard?.writeText(inviteUrl)}><Copy size={14} /> Copy link</button>
          </Notice></div>}
          {d.invitations.length > 0 && <>
            <h3>Invitations</h3>
            <ul className="ws-list">{d.invitations.map(i => <li key={i.id}>
              <span>{i.email}<br /><span className="meta">{i.status}{i.status === 'pending' ? ` · expires ${new Date(i.expires_at).toLocaleDateString('en-IN')}` : ''}</span></span>
              {i.status === 'pending' && <button className="btn-secondary btn-small" disabled={busy === i.id} onClick={() => run(i.id, `/api/invitations/${i.id}`, undefined, 'DELETE')}>Revoke</button>}
            </li>)}</ul>
          </>}
        </>}
      </div>

      {d.is_esports_roster && <div className="ws-card">
        <h2>Squad roster</h2>
        {d.roster && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>Roster revision {d.roster.revision} is <strong>{d.roster.state}</strong>.</p>}
        {d.members.length < 4 ? <Notice>Add at least four accepted members before submitting the roster.</Notice>
          : !d.is_owner || !editable ? (d.roster ? <table className="ws-table"><tbody>{d.roster.members.map(m => <tr key={m.profile_id}><td>{m.slot_type === 'substitute' ? 'Sub' : m.is_igl ? 'IGL' : 'Starter'}</td><td>{m.ign}</td><td className="mono">{m.player_uid}</td></tr>)}</tbody></table> : <Notice>The captain has not submitted the roster yet.</Notice>)
          : <form className="stack" onSubmit={submitRoster}>
            {starters.map((s, i) => <fieldset key={i} className="row" style={{ border: 0 }}>
              <label className="field">Starter {i + 1}
                <select required value={s.profile_id} onChange={e => setStarters(list => list.map((x, j) => j === i ? { ...x, profile_id: e.target.value } : x))}>
                  <option value="">Choose member</option>
                  {pickable(s.profile_id, chosen).map(m => <option key={m.profile_id} value={m.profile_id}>{m.display_name}</option>)}
                </select>
              </label>
              <label className="field">IGN<input required value={s.ign} onChange={e => setStarters(list => list.map((x, j) => j === i ? { ...x, ign: e.target.value } : x))} /></label>
              <label className="field">Player UID<input required inputMode="numeric" value={s.player_uid} onChange={e => setStarters(list => list.map((x, j) => j === i ? { ...x, player_uid: e.target.value } : x))} /></label>
              <label className="check" style={{ flex: '0 0 auto' }}><input type="radio" name="igl" checked={igl === i} onChange={() => setIgl(i)} /> IGL</label>
            </fieldset>)}
            <fieldset className="row" style={{ border: 0 }}>
              <label className="field">Substitute (optional)
                <select value={sub.profile_id} onChange={e => setSub(x => ({ ...x, profile_id: e.target.value }))}>
                  <option value="">No substitute</option>
                  {pickable(sub.profile_id, chosen).map(m => <option key={m.profile_id} value={m.profile_id}>{m.display_name}</option>)}
                </select>
              </label>
              <label className="field">IGN<input value={sub.ign} required={!!sub.profile_id} onChange={e => setSub(x => ({ ...x, ign: e.target.value }))} /></label>
              <label className="field">Player UID<input value={sub.player_uid} required={!!sub.profile_id} inputMode="numeric" onChange={e => setSub(x => ({ ...x, player_uid: e.target.value }))} /></label>
            </fieldset>
            <button className="btn-primary" disabled={busy === 'roster'}>{busy === 'roster' ? 'Submitting…' : d.roster ? 'Submit updated roster' : 'Submit roster'}</button>
          </form>}
      </div>}

      <div className="ws-card">
        <h2>Official rules · {d.rules.version}</h2>
        <div style={{ maxHeight: 260, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--text-muted)', background: '#121211', padding: 14, borderRadius: 4, marginBottom: 12 }}>{d.rules.text}</div>
        {d.declaration ? <Notice tone="ok">Accepted on {new Date(d.declaration.accepted_at).toLocaleString('en-IN')}. Fingerprint <span className="mono">{d.declaration.hash.slice(0, 16)}…</span></Notice>
          : d.is_owner ? <button className="btn-primary" disabled={busy === 'decl'} onClick={() => run('decl', '/api/declaration/accept', { registration_id: d.id })}>
              {busy === 'decl' ? 'Recording…' : 'I accept these rules for my team'}</button>
            : <Notice>The captain accepts the rules for the team.</Notice>}
      </div>

      <div className="ws-card">
        <h2>Place and payment</h2>
        {held ? <Notice tone="ok">Your place is held{d.reservation?.state === 'held' ? ` until ${new Date(d.reservation.expires_at).toLocaleString('en-IN')}` : ''}. Payment opens when the college publishes its official payment details; you will see it here. Nothing has been charged.</Notice>
          : d.reservation?.state === 'expired' ? <Notice tone="error">Your earlier hold expired. You can request a place again below.</Notice> : null}
        {!held && d.is_owner && <div className="stack" style={{ marginTop: 10 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Fee: {d.price?.amount_paise != null ? `₹${(d.price.amount_paise / 100).toLocaleString('en-IN')}` : 'not announced yet'} · Places: {d.event.capacity ?? 'limit not announced yet'}
          </p>
          <button className="btn-primary" disabled={busy === 'reserve' || !enoughMembers || !rosterDone || !d.declaration}
            onClick={() => run('reserve', '/api/reserve', { registration_id: d.id, idempotency_key: reserveKey })}>
            {busy === 'reserve' ? 'Holding…' : 'Hold our place'}</button>
          {(!enoughMembers || !rosterDone || !d.declaration) && <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Complete the steps above first.</span>}
        </div>}
      </div>
    </div>
    <p style={{ marginTop: 20 }}><Link href="/dashboard" style={{ color: 'var(--gold-400)' }}>← Back to my workspace</Link></p>
  </>;
}
