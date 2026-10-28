import { Suspense } from 'react';
import Link from 'next/link';
import SignInForm from '@/components/auth/SignInForm';

export const metadata = { title: 'Teacher sign-in | Fire & Flames 2026' };

export default function TeacherLoginPage() {
  return <div className="ws ws-narrow">
    <div className="ws-head">
      <span className="badge-gold">FACULTY</span>
      <h1>Teacher sign-in</h1>
      <p>Faculty advisors and coordinators sign in with their college email.</p>
    </div>
    <div className="ws-card stack">
      <Suspense><SignInForm audience="teacher" /></Suspense>
      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
        Signing in as a teacher never grants staff, judging or admin access on its own. Those come from an assignment by an organizer, and staff actions require two-step verification.
      </p>
    </div>
    <p style={{ marginTop: 18, fontSize: 14, color: 'var(--text-dim)' }}>
      Student? <Link href="/student-login" style={{ color: 'var(--gold-400)' }}>Use the student entrance</Link>.
    </p>
  </div>;
}
