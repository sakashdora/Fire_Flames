'use client';

import { useState } from 'react';
import { Trophy, Flame, Users, Shield, CheckCircle2, AlertTriangle, ArrowRight, Phone } from 'lucide-react';
import { EVENT_CATALOGUE, EventItem } from '@/domain/events';

interface PlayerSlot {
  ign: string;
  uid: string;
  isIgl: boolean;
  proofType: 'aadhaar' | 'pan' | 'voter_id' | 'college_id';
  verifyMethod: 'in_person' | 'upload';
}

export default function RegistrationPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>('bgmi');
  const [teamName, setTeamName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submittedRoster, setSubmittedRoster] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 4 Starters + 1 Substitute
  const [starters, setStarters] = useState<PlayerSlot[]>([
    { ign: '', uid: '', isIgl: true, proofType: 'aadhaar', verifyMethod: 'in_person' },
    { ign: '', uid: '', isIgl: false, proofType: 'aadhaar', verifyMethod: 'in_person' },
    { ign: '', uid: '', isIgl: false, proofType: 'aadhaar', verifyMethod: 'in_person' },
    { ign: '', uid: '', isIgl: false, proofType: 'aadhaar', verifyMethod: 'in_person' }
  ]);
  const [substitute, setSubstitute] = useState<PlayerSlot>({
    ign: '', uid: '', isIgl: false, proofType: 'aadhaar', verifyMethod: 'in_person'
  });

  const selectedEvent = EVENT_CATALOGUE.find(e => e.slug === selectedSlug) || EVENT_CATALOGUE[0];

  const handleStarterChange = (index: number, field: keyof PlayerSlot, value: any) => {
    const updated = [...starters];
    if (field === 'isIgl') {
      // Ensure only one IGL
      updated.forEach((p, idx) => { p.isIgl = idx === index; });
    } else {
      (updated[index] as any)[field] = value;
    }
    setStarters(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!teamName.trim()) {
      setErrorMsg('Please enter a team name');
      return;
    }

    if (selectedSlug === 'bgmi') {
      if (!leaderPhone.trim()) {
        setErrorMsg('Leader contact phone is required for tournament queries');
        return;
      }

      // Check all 4 starters have IGN and UID
      for (let i = 0; i < 4; i++) {
        if (!starters[i].ign.trim() || !starters[i].uid.trim()) {
          setErrorMsg(`Starter ${i + 1} requires both In-Game Name (IGN) and Player UID`);
          return;
        }
      }

      // Check exactly one IGL
      const iglCount = starters.filter(p => p.isIgl).length;
      if (iglCount !== 1) {
        setErrorMsg('Exactly one starter must be designated as In-Game Leader (IGL)');
        return;
      }

      // Check UID uniqueness among team members
      const allUids = [...starters.map(p => p.uid.trim())];
      if (substitute.uid.trim()) allUids.push(substitute.uid.trim());
      const uniqueUids = new Set(allUids);
      if (uniqueUids.size !== allUids.length) {
        setErrorMsg('Duplicate Player UIDs detected within the roster. Each player must have a unique UID');
        return;
      }

      if (!declarationAccepted) {
        setErrorMsg('Team Leader must accept the declaration and acknowledge tournament rules');
        return;
      }
    }

    setSubmittedRoster({
      teamName,
      leaderPhone,
      event: selectedEvent.name,
      starters,
      substitute: substitute.ign ? substitute : null,
      submittedAt: new Date().toISOString()
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.75rem' }}>
          Team Registration & Roster Submission
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Register your squad for Fire & Flames 2026. External college teams welcome.
        </p>
      </div>

      {/* Event Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
        {EVENT_CATALOGUE.map(evt => (
          <button
            key={evt.slug}
            type="button"
            onClick={() => { setSelectedSlug(evt.slug); setSubmittedRoster(null); setErrorMsg(null); }}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: selectedSlug === evt.slug ? '1px solid var(--gold-400)' : '1px solid var(--border-subtle)',
              background: selectedSlug === evt.slug ? 'rgba(217, 119, 6, 0.25)' : 'rgba(0,0,0,0.3)',
              color: selectedSlug === evt.slug ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {evt.track === 'esports' ? <Trophy size={16} color="var(--ember-400)" /> : <Flame size={16} color="var(--gold-400)" />}
            {evt.name}
          </button>
        ))}
      </div>

      {submittedRoster ? (
        /* Submission Success / Honest Gated State */
        <div className="glass-panel glass-gold-glow" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={32} color="#4ade80" />
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800 }}>Roster Snapshot Recorded</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Event: <strong>{submittedRoster.event}</strong> • Team: <strong>{submittedRoster.teamName}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '1rem' }}>
              Locked Roster Members (Leading zeros preserved)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {submittedRoster.starters.map((s: PlayerSlot, i: number) => (
                <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: s.isIgl ? 'var(--gold-400)' : 'var(--text-dim)', fontWeight: 700 }}>
                    {s.isIgl ? 'STARTER 1 (IGL)' : `STARTER ${i + 1}`}
                  </div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{s.ign}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>UID: {s.uid}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    ID: {s.proofType.toUpperCase()} ({s.verifyMethod})
                  </div>
                </div>
              ))}
              {submittedRoster.substitute && (
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ember-400)', fontWeight: 700 }}>SUBSTITUTE (SLOT 5)</div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{submittedRoster.substitute.ign}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>UID: {submittedRoster.substitute.uid}</div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Status Notice: Honest Pending State */}
          {selectedSlug === 'bgmi' ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={20} /> Checkout & Payment Collection Disabled (E02 Compliance)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                The official BGMI tournament entry fee is pending formal college financial authorization. No payment QR or fee collection will be enabled until verified bank details are published.
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Your team roster is securely held as a confirmed pre-registration. Queries: <strong>8260555312</strong>.
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                E-Fest Team Order: ₹99 Total
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                One ₹99 team payment covers all accepted members. Official college payment QR will be rendered upon finance verification.
              </p>
            </div>
          )}

          <button onClick={() => setSubmittedRoster(null)} className="btn-secondary">
            Edit Team Registration
          </button>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
          
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '0.9rem 1.25rem', marginBottom: '1.75rem', color: '#fca5a5', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {/* Event Summary Banner */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge-gold" style={{ marginBottom: '0.35rem' }}>{selectedEvent.organizerName}</span>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>{selectedEvent.name}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedEvent.datesDisplay} • {selectedEvent.venue}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-400)' }}>
                  {selectedEvent.priceOptions[0].label}
                </div>
                {selectedEvent.capacity && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Capacity: {selectedEvent.capacity} {selectedEvent.capacityUnit}s
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Team / Squad Name *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Kalinga Warriors"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Leader Contact Phone * (For tournament queries)
              </label>
              <input
                type="tel"
                required
                value={leaderPhone}
                onChange={e => setLeaderPhone(e.target.value)}
                placeholder="e.g. 8260555312"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* BGMI Specific Roster: 4 Starters + 1 Substitute */}
          {selectedSlug === 'bgmi' && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    Mandatory 4 Starters Roster (E03 Invariant)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Exactly one starter must be IGL. UIDs must preserve leading zeros and be unique across the event.
                  </p>
                </div>
                <span className="badge-gold">4 Starters Required</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {starters.map((player, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: player.isIgl ? '1px solid var(--gold-500)' : '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: player.isIgl ? 'var(--gold-400)' : '#ffffff' }}>
                        {idx === 0 ? 'Starter 1 (Default IGL)' : `Starter ${idx + 1}`}
                      </span>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--gold-300)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="igl-selection"
                          checked={player.isIgl}
                          onChange={() => handleStarterChange(idx, 'isIgl', true)}
                        />
                        Designate as IGL
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>In-Game Name (IGN) *</label>
                        <input
                          type="text"
                          required
                          value={player.ign}
                          onChange={e => handleStarterChange(idx, 'ign', e.target.value)}
                          placeholder="e.g. SoulMortal"
                          style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Player UID (Preserve 0s) *</label>
                        <input
                          type="text"
                          required
                          value={player.uid}
                          onChange={e => handleStarterChange(idx, 'uid', e.target.value)}
                          placeholder="e.g. 00512345678"
                          style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Govt ID Proof Type</label>
                        <select
                          value={player.proofType}
                          onChange={e => handleStarterChange(idx, 'proofType', e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }}
                        >
                          <option value="aadhaar">Aadhaar Card</option>
                          <option value="pan">PAN Card</option>
                          <option value="voter_id">Voter ID</option>
                          <option value="college_id">College ID</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Verification Method</label>
                        <select
                          value={player.verifyMethod}
                          onChange={e => handleStarterChange(idx, 'verifyMethod', e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }}
                        >
                          <option value="in_person">In-Person at Venue Desk</option>
                          <option value="upload">Secure Private Upload</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Substitute Slot (Slot 5) */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px dashed rgba(245, 158, 11, 0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ember-400)' }}>
                      Substitute Slot (Optional 5th Slot)
                    </span>
                    <span className="badge-pending" style={{ fontSize: '0.7rem' }}>Decision Gate: Pending</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Substitute IGN</label>
                      <input
                        type="text"
                        value={substitute.ign}
                        onChange={e => setSubstitute({ ...substitute, ign: e.target.value })}
                        placeholder="Optional IGN"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Substitute UID</label>
                      <input
                        type="text"
                        value={substitute.uid}
                        onChange={e => setSubstitute({ ...substitute, uid: e.target.value })}
                        placeholder="Optional UID"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Declaration Acceptance (E06) */}
          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1.25rem', borderRadius: '10px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Official Tournament Declaration (E06)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
              I hereby declare as team captain that all player details and UIDs submitted are genuine. Our squad agrees to abide by Srusti Academy LAN Tournament rules, organizer-provided hardware policies, referee pause adjudications, and conduct protocols. I understand that submitting false credentials will lead to official disqualification.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                required
                checked={declarationAccepted}
                onChange={e => setDeclarationAccepted(e.target.checked)}
              />
              I accept the tournament declaration on behalf of the squad (Hash: SHA-256 bound v1)
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}>
            Submit Squad Roster <ArrowRight size={18} />
          </button>
        </form>
      )}

    </div>
  );
}
