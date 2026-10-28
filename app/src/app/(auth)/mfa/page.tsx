import { Suspense } from 'react';
import MfaSetup from '@/components/auth/MfaSetup';

export const metadata = { title: 'Two-step verification | Fire & Flames 2026' };

export default function MfaPage() {
  return <div className="ws ws-narrow">
    <div className="ws-head">
      <span className="badge-gold">STAFF SECURITY</span>
      <h1>Two-step verification</h1>
      <p>Referees, volunteers, judges and admins confirm each session with a code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password or similar).</p>
    </div>
    <div className="ws-card"><Suspense><MfaSetup /></Suspense></div>
  </div>;
}
