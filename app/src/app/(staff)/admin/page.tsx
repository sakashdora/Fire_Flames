'use client';

import { useState } from 'react';
import { Shield, Users, CreditCard, Award, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

export default function AdminWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'scoring' | 'beneficiary' | 'capacity'>('scoring');

  // Scoring approval gate
  const [killMultiplier, setKillMultiplier] = useState('');
  const [tieBreakPolicy, setTieBreakPolicy] = useState('');
  const [scoringMsg, setScoringMsg] = useState<string | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // Two-person beneficiary
  const [proposer, setProposer] = useState('super-admin-1');
  const [approver, setApprover] = useState('super-admin-2');
  const [beneficiaryName, setBeneficiaryName] = useState('Srusti Academy Autonomous');
  const [upiId, setUpiId] = useState('srustiacademy@sbi');
  const [beneficiaryMsg, setBeneficiaryMsg] = useState<string | null>(null);
  const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);

  const handleApproveScoring = (e: React.FormEvent) => {
    e.preventDefault();
    setScoringError(null);
    setScoringMsg(null);

    // E07 Invariant: incomplete scoring rules cannot be approved!
    if (!killMultiplier.trim() || !tieBreakPolicy.trim()) {
      setScoringError('Cannot approve scoring version: kill multiplier and tie-break policy are strictly required. (E07 compliance).');
      return;
    }

    setScoringMsg(`Scoring rules approved by Super Admin. Kill multiplier set to ${killMultiplier} and tie-break policy registered.`);
  };

  const handleApproveBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    setBeneficiaryError(null);
    setBeneficiaryMsg(null);

    // ADR 005 Invariant: Proposer != Approver
    if (proposer === approver) {
      setBeneficiaryError('ADR 005 Violation: Approver cannot be the same person as the Proposer. Two distinct super admins are required.');
      return;
    }

    setBeneficiaryMsg(`New payment profile version activated for ${beneficiaryName} (${upiId}). Proposed by ${proposer}, approved by ${approver}.`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>ADMINISTRATION • ELEVATED ROLE • MFA</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
          Event Admin & Governance Console
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Enforce two-person payment approvals, scoring readiness gates, and tournament capacity locks.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('scoring')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'scoring' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'scoring' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'scoring' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Scoring Rules Approval Gate (E07)
        </button>

        <button
          onClick={() => setActiveTab('beneficiary')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'beneficiary' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'beneficiary' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'beneficiary' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Two-Person Beneficiary Activation (ADR 005)
        </button>

        <button
          onClick={() => setActiveTab('capacity')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'capacity' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'capacity' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'capacity' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Capacity & Reservation Locks (E04)
        </button>
      </div>

      {activeTab === 'scoring' && (
        <form onSubmit={handleApproveScoring} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            BGMI Tournament Scoring Approval Gate
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            In accordance with E07, BGIS 2026 placement rows (1–16) are transcribed. However, approval is strictly blocked if kill points or tie-break policies are left unspecified.
          </p>

          {scoringError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.88rem' }}>
              ⚠️ {scoringError}
            </div>
          )}

          {scoringMsg && (
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.88rem' }}>
              ✓ {scoringMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Kill Point Multiplier (Required for Approval)</label>
              <input
                type="number"
                step="0.5"
                value={killMultiplier}
                onChange={e => setKillMultiplier(e.target.value)}
                placeholder="Leave blank to test rejection, or enter e.g. 1"
                style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Tie-Break Specification (Required for Approval)</label>
              <input
                type="text"
                value={tieBreakPolicy}
                onChange={e => setTieBreakPolicy(e.target.value)}
                placeholder="e.g. Higher WWCDs, then total kill points"
                style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Attempt Scoring Rules Approval
          </button>
        </form>
      )}

      {activeTab === 'beneficiary' && (
        <form onSubmit={handleApproveBeneficiary} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Two-Person Beneficiary Profile Activation
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            ADR 005 mandates that official payment profiles require a proposal by one named super admin and independent approval by another. Proposer cannot approve their own proposal.
          </p>

          {beneficiaryError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.88rem' }}>
              ⚠️ {beneficiaryError}
            </div>
          )}

          {beneficiaryMsg && (
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.88rem' }}>
              ✓ {beneficiaryMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Proposer Super Admin ID</label>
              <input type="text" value={proposer} onChange={e => setProposer(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Distinct Approver Super Admin ID</label>
              <input type="text" value={approver} onChange={e => setApprover(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Beneficiary Entity Name</label>
              <input type="text" value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Receiving UPI VPA</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Activate Approved Payment Destination
          </button>
        </form>
      )}

      {activeTab === 'capacity' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Live Capacity & Reservation Monitor
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Real-time tracking of confirmed entries, active held reservations, and concurrency locks.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ember-400)', fontWeight: 700 }}>KALINGA BGMI CLASH</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0' }}>
                1 / 24 Teams
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Atomic reservation locks serialized in PostgreSQL. 25th entry submission is rejected by <code>rpc_reserve_entry</code>.
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 700 }}>IPL AUCTION (E-FEST)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0' }}>
                4 / 32 Teams
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                32 entry capacity unit. Solo allocation policy gated pending college authorization.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
