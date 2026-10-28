'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setLoading(false);
    setMessage('Sign-in is not connected yet. No email has been sent. Please return when registration opens.');
  };

  return (
    <div style={{ maxWidth: '460px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid var(--gold-500)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <LogIn size={24} color="var(--gold-400)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>Student Sign-in</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Access team rosters, accept invitations, view entry passes, and track status.
          </p>
        </div>

        {message && (
          <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#86efac' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              College or Personal Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@srusti.ac.in or external"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Sending Link...' : 'Continue to Dashboard'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          <div>Are you a faculty member?</div>
          <Link href="/teacher-login" style={{ color: 'var(--gold-400)', fontWeight: 600, textDecoration: 'none' }}>
            Go to Teacher Entrance
          </Link>
        </div>

      </div>
    </div>
  );
}
