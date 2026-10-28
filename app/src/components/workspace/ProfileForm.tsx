'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type ApiResult } from '@/lib/client/api';
import { ApiErrorNotice, Notice } from '@/components/ui/Notice';

export interface Profile {
  display_name: string; phone: string | null; college_name_other: string | null; course: string | null;
  year_of_study: string | null; affiliation: string; publicity_consent: boolean; row_version: number;
}

export default function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    display_name: profile?.display_name ?? '', phone: profile?.phone ?? '', college: profile?.college_name_other ?? '',
    course: profile?.course ?? '', year_of_study: profile?.year_of_study ?? '', affiliation: profile?.affiliation ?? 'student',
    publicity_consent: profile?.publicity_consent ?? false, privacy_accepted: !!profile,
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await api('/api/profile', { body: { ...form, expected_version: profile?.row_version ?? null } });
    setResult(res);
    setBusy(false);
    if (res.ok) router.refresh();
  };

  return <form className="stack" onSubmit={submit}>
    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Signed in as <strong>{email}</strong>.</p>
    <div className="row">
      <label className="field">Full name<input required value={form.display_name} onChange={set('display_name')} autoComplete="name" /></label>
      <label className="field">Mobile number<input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="10-digit number" /></label>
    </div>
    <div className="row">
      <label className="field">College<input value={form.college} onChange={set('college')} placeholder="Your college name" /></label>
      <label className="field">Course<input value={form.course} onChange={set('course')} placeholder="e.g. MBA, BBA, B.Tech" /></label>
      <label className="field">Year<input value={form.year_of_study} onChange={set('year_of_study')} placeholder="e.g. 2nd year" /></label>
    </div>
    <label className="field">I am a
      <select value={form.affiliation} onChange={set('affiliation')}><option value="student">Student</option><option value="teacher">Teacher</option><option value="other">Other</option></select>
    </label>
    <label className="check"><input type="checkbox" checked={form.publicity_consent} onChange={set('publicity_consent')} /> My name may appear in published results and event photos.</label>
    {!profile && <label className="check"><input type="checkbox" required checked={form.privacy_accepted} onChange={set('privacy_accepted')} /> I agree that Srusti Academy may use these details to run Fire & Flames 2026 registrations and event operations.</label>}
    <ApiErrorNotice result={result} />
    {result?.ok && <Notice tone="ok">Profile saved.</Notice>}
    <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : profile ? 'Save changes' : 'Save profile'}</button>
  </form>;
}
