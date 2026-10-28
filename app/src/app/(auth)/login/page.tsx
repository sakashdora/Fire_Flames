import Link from 'next/link';
import { LogIn, GraduationCap, Shield, UserCheck, Gavel, Radio, ArrowRight } from 'lucide-react';

export default function UnifiedLoginPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Portal Sign-In
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select your portal to access registration, team rosters, or event operations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Student Card */}
        <Link href="/student-login" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ padding: '2rem', height: '100%', borderTop: '4px solid var(--gold-500)', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogIn size={24} color="var(--gold-400)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Student / Participant</h2>
                <span className="badge badge-gold">Competitor Access</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Access team rosters, accept player invitations, view entry passes, and track tournament standing.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '0.88rem' }}>
              Enter Student Workspace <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Teacher Card */}
        <Link href="/teacher-login" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ padding: '2rem', height: '100%', borderTop: '4px solid #60a5fa', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={24} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Faculty / Teacher</h2>
                <span className="badge" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#93c5fd' }}>Advisory Entrance</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Faculty advisors and institution coordinators view college delegation rosters and attendance records.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.88rem' }}>
              Enter Teacher Portal <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </div>

      {/* Staff Consoles Grid */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="var(--fire-orange)" /> Event Operations & Staff Consoles
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Operational desks require designated duty credentials and role verification.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <Link href="/referee" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Radio size={20} color="var(--fire-orange)" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Referee Console</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hardware, pauses & subs</div>
            </div>
          </Link>

          <Link href="/volunteer" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <UserCheck size={20} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Volunteer Desk</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>QR pass verification</div>
            </div>
          </Link>

          <Link href="/judge" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Gavel size={20} color="#c084fc" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Judge Workspace</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Rubric scoring locks</div>
            </div>
          </Link>

          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Shield size={20} color="#f43f5e" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Admin Console</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Scoring gates & controls</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
