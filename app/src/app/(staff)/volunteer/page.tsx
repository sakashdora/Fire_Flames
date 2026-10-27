'use client';

import { useState } from 'react';
import { QrCode, UserCheck, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function VolunteerScanningPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [dutySession, setDutySession] = useState('Session Day 1 (13 Nov 09:00 - 12:00)');
  const [station, setStation] = useState('Station Gate 1');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<string[]>([]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setScanResult(null);

    const token = tokenInput.trim();
    if (!token) return;

    if (recentScans.includes(token)) {
      setErrorMsg('DUPLICATE ATTENDANCE DETECTED (E11): Pass was already checked in for this duty session.');
      return;
    }

    // Simulate online duty-bound verification
    setRecentScans([token, ...recentScans]);
    setScanResult({
      status: 'checked_in',
      participant: 'Avishek Mohanty',
      team: 'Kalinga Warriors',
      event: 'Kalinga BGMI Clash Season 1',
      session: dutySession,
      station,
      timestamp: new Date().toLocaleTimeString(),
      note: 'Volunteer scan verified within active duty shift. Government ID numbers are not revealed in volunteer view (Data minimization policy).'
    });
    setTokenInput('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>VOLUNTEER DESK • ONLINE SCANNER</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
          Duty-Bound Attendance & QR Scanner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time check-in with duty shift verification and duplicate-scan protection.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Active Duty Session</label>
            <input type="text" readOnly value={dutySession} style={{ width: '100%', padding: '0.65rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Station Desk</label>
            <input type="text" readOnly value={station} style={{ width: '100%', padding: '0.65rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }} />
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> {errorMsg}
          </div>
        )}

        {scanResult && (
          <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} /> Attendance Verified: {scanResult.participant}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#ffffff', marginBottom: '0.25rem' }}>
              Team: <strong>{scanResult.team}</strong> • Event: <strong>{scanResult.event}</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {scanResult.note}
            </div>
          </div>
        )}

        <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            required
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="Scan QR token or paste hash (e.g. PASS-TOKEN-01)..."
            style={{ flex: 1, padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-gold)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>
            Check In Pass
          </button>
        </form>

      </div>

    </div>
  );
}
