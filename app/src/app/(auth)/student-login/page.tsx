import { Suspense } from 'react';
import Link from 'next/link';
import SignInForm from '@/components/auth/SignInForm';

export const metadata = { title: 'Student sign-in | Fire & Flames 2026' };

export default function StudentLoginPage() {
  return <div className="ws ws-narrow">
    <div className="ws-head">
      <span className="badge-gold">PARTICIPANTS</span>
      <h1>Student sign-in</h1>
      <p>Register your team, accept invitations and follow your entry. We email you a one-time link; there is no password to remember.</p>
    </div>
    <div className="ws-card">
      <Suspense><SignInForm audience="student" /></Suspense>
    </div>
    <p style={{ marginTop: 18, fontSize: 14, color: 'var(--text-dim)' }}>
      Faculty member? <Link href="/teacher-login" style={{ color: 'var(--gold-400)' }}>Use the teacher entrance</Link>.
    </p>
  </div>;
}
