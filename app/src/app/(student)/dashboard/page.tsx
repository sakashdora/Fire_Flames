'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, QrCode, Shield, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState({
    name: 'Avishek Mohanty',
    email: 'avishek@example.com',
    college: 'Srusti Academy of Management & Technology',
    course: 'MBA / IT',
    affiliation: 'student'
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>STUDENT WORKSPACE</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
            Welcome, {profile.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {profile.college} • {profile.course}
          </p>
        </div>

        <Link href="/register" className="btn-primary" style={{ fontSize: '0.88rem' }}>
          Register Another Event <ArrowRight size={16} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Active Registrations & Squad Status */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--gold-400)" />
            Active Team Registrations
          </h3>

          {/* BGMI Card */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge-gold" style={{ fontSize: '0.7rem', background: 'rgba(234, 88, 12, 0.2)', color: 'var(--ember-400)' }}>
                  KALINGA BGMI CLASH SEASON 1
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                  Team: Kalinga Vipers
                </div>
              </div>
              <span className="badge-pending" style={{ fontSize: '0.72rem' }}>Pre-Registered</span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Roster: 4 Starters + 1 Substitute • IGL Designated • Leader: 8260555312
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-verified" style={{ fontSize: '0.72rem' }}>
                ✓ Declaration Accepted
              </span>
              <span className="badge-gold" style={{ fontSize: '0.72rem' }}>
                UIDs Locked (4 Starters)
              </span>
            </div>
          </div>

          {/* E-Fest Card */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge-gold" style={{ fontSize: '0.7rem' }}>
                  IPL AUCTION (E-FEST)
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                  Team: Master Bidders
                </div>
              </div>
              <span className="badge-verified" style={{ fontSize: '0.72rem' }}>Confirmed Entry</span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Fee: ₹99 Paid once for accepted team • 3 Members Accepted
            </div>

            <span className="badge-verified" style={{ fontSize: '0.72rem' }}>
              ✓ Pass Issued
            </span>
          </div>
        </div>

        {/* Identity & Verification Security Status */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--gold-400)" />
            Restricted Identity Verification (E05)
          </h3>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            In accordance with data minimization policies, government ID numbers (Aadhaar/PAN/Voter ID) are never stored in plaintext or exposed to volunteers. Verification is performed in-person or via expiring signed URLs.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Avishek Mohanty (IGL)</span>
              <span className="badge-verified" style={{ fontSize: '0.7rem' }}>Verified In-Person</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Type: Aadhaar • Reviewer: Staff Desk 1 • Expiry: 15 Nov 2026
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Teammate 2 (Player 2)</span>
              <span className="badge-pending" style={{ fontSize: '0.7rem' }}>Pending Venue Check</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Type: College ID / PAN • Present original ID at venue verification gate before cutoff.
            </div>
          </div>

          {/* QR Pass Preview */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--gold-400)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <QrCode size={16} /> Authenticated Pass Envelope (ADR 004)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Pass tokens are stored as SHA-256 hashes for lookup and encrypted via server-side AES-256-GCM. Scanned tokens carry duty-bound verification and duplicate-scan protection.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
