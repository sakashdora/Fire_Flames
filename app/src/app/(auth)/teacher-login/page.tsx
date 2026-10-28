'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCheck, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid var(--gold-400)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserCheck size={24} color="var(--gold-400)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>Faculty / Teacher Sign-in</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Authorized academic entrance for Srusti Academy faculty and event coordinators.
          </p>
        </div>

        {/* Security Invariant Callout */}
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px dashed rgba(239, 68, 68, 0.35)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            <ShieldAlert size={15} /> Strict Access Security Invariant
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Teacher sign-in alone <strong>never grants administrative or judging authority</strong>. Operational access requires a server-verified duty assignment, role authorization, and mandatory MFA.
          </p>
        </div>

        {submitted ? (
          <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
            <h4 style={{ color: '#4ade80', fontWeight: 700, marginBottom: '0.5rem' }}>Teacher sign-in is not connected yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No authentication email has been sent. Please contact the event coordinator for access once sign-in is available.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@srusti.ac.in"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Department / Program
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Department of Management Studies"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Request Teacher Verification <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          <div>Student participant?</div>
          <Link href="/student-login" style={{ color: 'var(--gold-400)', fontWeight: 600, textDecoration: 'none' }}>
            Go to Student Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
