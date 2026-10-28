'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Notice } from '@/components/ui/Notice';

type Stage = 'loading' | 'verified' | 'challenge' | 'enroll' | 'unavailable';

export default function MfaSetup() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [stage, setStage] = useState<Stage>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) { setStage('unavailable'); return; }
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === 'aal2') { setStage('verified'); return; }
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find((f: { id: string; status: string }) => f.status === 'verified');
      if (verified) { setFactorId(verified.id); setStage('challenge'); return; }
      setStage('enroll');
    })();
  }, [supabase]);

  if (!supabase || stage === 'unavailable') return <Notice>Two-step verification is unavailable because Supabase is not connected.</Notice>;
  if (stage === 'loading') return <p style={{ color: 'var(--text-muted)' }}>Checking your session…</p>;
  if (stage === 'verified') return <Notice tone="ok">This session is verified. You can use your staff console now.</Notice>;

  const startEnroll = async () => {
    setBusy(true); setError(null);
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const f of existing?.all ?? []) if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Fire & Flames staff' });
    setBusy(false);
    if (err || !data) { setError('Could not start setup. Try again.'); return; }
    setFactorId(data.id); setQr(data.totp.qr_code); setSecret(data.totp.secret);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    setBusy(false);
    if (err) { setError('That code did not match. Use the current 6-digit code from your app.'); return; }
    setStage('verified');
    router.refresh();
    if (next?.startsWith('/') && !next.startsWith('//')) router.push(next);
  };

  return <div className="stack">
    {stage === 'enroll' && !qr && <>
      <p style={{ color: 'var(--text-muted)' }}>Set up your authenticator app once. After that, you will enter a 6-digit code when you start a staff session.</p>
      <button className="btn-primary" onClick={startEnroll} disabled={busy}>{busy ? 'Preparing…' : 'Set up authenticator app'}</button>
    </>}
    {qr && <>
      <p style={{ color: 'var(--text-muted)' }}>Scan this code with your authenticator app, then enter the 6-digit code it shows.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="Authenticator setup QR code" width={200} height={200} style={{ background: '#fff', padding: 8, borderRadius: 4 }} />
      {secret && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Can&apos;t scan? Enter this key manually: <span className="mono">{secret}</span></p>}
    </>}
    {(qr || stage === 'challenge') && <form className="stack" onSubmit={verify}>
      <label className="field">6-digit code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)} /></label>
      <button className="btn-primary" disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</button>
    </form>}
    {error && <Notice tone="error">{error}</Notice>}
  </div>;
}
