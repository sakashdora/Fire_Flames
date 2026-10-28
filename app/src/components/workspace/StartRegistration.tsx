'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { api, newIdempotencyKey, type ApiResult } from '@/lib/client/api';
import { ApiErrorNotice, Notice } from '@/components/ui/Notice';

export interface LiveEvent {
  slug: string; name: string; track: string; registration_open: boolean; capacity: number | null; reserved: number;
  team_min: number | null; team_max: number | null; modes: { mode: string; amount_paise: number | null; enabled: boolean }[];
  dates: string | null; organizer: string | null;
}

const rupees = (paise: number | null) => (paise === null ? 'Fee to be announced' : `₹${(paise / 100).toLocaleString('en-IN')}`);
const MODE_LABEL: Record<string, string> = { team: 'Team entry', stall: 'Stall', entry: 'Project entry' };

export default function StartRegistration({ events, initialSlug }: { events: LiveEvent[]; initialSlug?: string }) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug ?? '');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [key] = useState(newIdempotencyKey);
  const event = events.find(e => e.slug === slug);
  const modes = useMemo(() => (event?.modes ?? []).filter(m => m.mode !== 'individual'), [event]);
  const [mode, setMode] = useState('team');
  const activeMode = modes.find(m => m.mode === mode) ?? modes[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !activeMode) return;
    setBusy(true);
    const res = await api('/api/registrations', { body: { event_slug: event.slug, team_name: name, mode: activeMode.mode, idempotency_key: `${key}:${event.slug}:${activeMode.mode}:${name}` } });
    setResult(res);
    setBusy(false);
    if (res.ok) router.push(`/registrations/${res.data.registration_id}`);
  };

  return <div className="ws-grid">
    <form className="ws-card stack" onSubmit={submit}>
      <label className="field">Event
        <select value={slug} onChange={e => { setSlug(e.target.value); setResult(null); }}>
          {events.map(e => <option key={e.slug} value={e.slug}>{e.name}{e.registration_open ? '' : ' (not open yet)'}</option>)}
        </select>
      </label>
      {event && !event.registration_open && <Notice>Registration for {event.name} is not open yet. Organizers open it after publishing the official rules.</Notice>}
      {event?.registration_open && <>
        {modes.length > 1 && <label className="field">Entry type
          <select value={activeMode?.mode} onChange={e => setMode(e.target.value)}>{modes.map(m => <option key={m.mode} value={m.mode}>{MODE_LABEL[m.mode] ?? m.mode}</option>)}</select>
        </label>}
        <label className="field">{activeMode?.mode === 'stall' ? 'Stall / venture name' : 'Team name'}
          <input required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="Choose a name for your entry" />
        </label>
        <ApiErrorNotice result={result} />
        <button className="btn-primary" disabled={busy || !name.trim()}>{busy ? 'Starting…' : 'Start registration'} <ArrowRight size={16} /></button>
      </>}
    </form>

    {event && <div className="ws-card">
      <h2>{event.name}</h2>
      <ul className="ws-list">
        {event.organizer && <li><span>Organizer</span><span>{event.organizer}</span></li>}
        {event.dates && <li><span>Dates</span><span>{event.dates}</span></li>}
        <li><span>Team size</span><span>{event.team_min || event.team_max ? `${event.team_min ?? 1}–${event.team_max ?? '—'} members` : 'To be announced'}</span></li>
        <li><span>Places</span><span>{event.capacity === null ? 'Limit to be announced' : `${Math.max(event.capacity - event.reserved, 0)} of ${event.capacity} available`}</span></li>
        {(event.modes.length ? event.modes : [{ mode: 'team', amount_paise: null, enabled: false }]).filter(m => m.mode !== 'individual')
          .map(m => <li key={m.mode}><span>{MODE_LABEL[m.mode] ?? m.mode} fee</span><span>{rupees(m.amount_paise)}</span></li>)}
      </ul>
    </div>}
  </div>;
}
