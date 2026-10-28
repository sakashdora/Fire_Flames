'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type ApiResult } from '@/lib/client/api';
import { ApiErrorNotice } from '@/components/ui/Notice';

export default function AcceptInvitation({ token }: { token: string }) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  return <form className="stack" onSubmit={async e => {
    e.preventDefault();
    setBusy(true);
    const res = await api('/api/invitations/accept', { body: { token } });
    setResult(res); setBusy(false);
    if (res.ok) router.push(`/registrations/${res.data.registration_id}`);
  }}>
    <label className="check"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /> I agree to join this team and to follow the event rules.</label>
    <ApiErrorNotice result={result} />
    <button className="btn-primary" disabled={busy || !consent}>{busy ? 'Joining…' : 'Join the team'}</button>
  </form>;
}
