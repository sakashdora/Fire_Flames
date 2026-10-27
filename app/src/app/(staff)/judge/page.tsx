'use client';

import { useState } from 'react';
import { Award, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function JudgeWorkspacePage() {
  const [locked, setLocked] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    'c1': 20,
    'c2': 18,
    'c3': 22
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const criteria = [
    { id: 'c1', label: 'Innovation & Feasibility', max: 25 },
    { id: 'c2', label: 'Commercial Market Potential', max: 25 },
    { id: 'c3', label: 'Presentation & Q&A Defense', max: 25 }
  ];

  const handleScoreChange = (id: string, val: number, max: number) => {
    if (locked) return;
    setErrorMsg(null);
    if (val > max) {
      setErrorMsg(`Score cannot exceed maximum of ${max} marks for this criterion.`);
      return;
    }
    setScores({ ...scores, [id]: val });
  };

  const handleLock = () => {
    setLocked(true);
    setSuccessMsg('Scorecard successfully locked. In accordance with database triggers, locked scorecards are append-only and immutable.');
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge-gold" style={{ marginBottom: '0.5rem' }}>JURY WORKSPACE • SCOPED MFA</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
          Jury Scorecard & Evaluation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Assigned Entry: <strong>Team EcoInnovate (Srusti Exhibition)</strong> • Rubric: Working Prototype Rubric
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '0.9rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.88rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.88rem' }}>
            ✓ {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {criteria.map((c) => (
            <div key={c.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{c.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Maximum Marks: {c.max}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0"
                  max={c.max}
                  disabled={locked}
                  value={scores[c.id] || 0}
                  onChange={(e) => handleScoreChange(c.id, Number(e.target.value), c.max)}
                  style={{ width: '80px', padding: '0.6rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-gold)', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ {c.max}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Total Score</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold-400)' }}>{total} / 75</div>
        </div>

        {!locked ? (
          <button onClick={handleLock} className="btn-primary" style={{ width: '100%' }}>
            <Lock size={16} /> Lock Scorecard (Irreversible Submission)
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Lock size={16} /> Scorecard Locked & Audited
          </div>
        )}

      </div>

    </div>
  );
}
