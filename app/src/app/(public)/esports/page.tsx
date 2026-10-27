import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Calendar, Users, Shield, AlertTriangle, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { EVENT_CATALOGUE } from '@/domain/events';

export default function EsportsPage() {
  const bgmi = EVENT_CATALOGUE.find(e => e.slug === 'bgmi')!;
  const freeFire = EVENT_CATALOGUE.find(e => e.slug === 'free-fire')!;

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '1rem', background: 'rgba(234, 88, 12, 0.15)', color: 'var(--ember-400)', borderColor: 'rgba(234, 88, 12, 0.4)' }}>
          ORGANIZER: SRUSTIPROSAR ESPORTS
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
          <span className="flame-gradient-text">KURUKSHETRA</span> <span className="gold-gradient-text">ESPORTS</span>
        </h1>
        <p style={{ maxWidth: '750px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Official offline LAN esports championship at Srusti Academy of Management & Technology.
        </p>
      </div>

      {/* Flagship: Kalinga BGMI Clash Season 1 */}
      <div className="glass-panel glass-gold-glow" style={{ padding: '2.5rem', marginBottom: '3rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="badge-gold">Confirmed Client Brief</span>
              <span className="badge-gold" style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5' }}>LAN Finals</span>
            </div>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
              KALINGA BGMI CLASH SEASON 1
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
              Source Alias: <strong>KALINGA CLASH 2K26</strong> • Stable Event Slug: <code>bgmi</code>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              High-stakes Battle Royale tournament for 24 confirmed squads. Complete organizer-managed hardware, strict referee anti-tampering inspection, and live server-calculated scoring.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Dates</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--ember-400)" /> 13 & 14 Nov 2026
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Prize Pool</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Trophy size={15} /> ₹10,000 INR
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Team Capacity</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={15} color="var(--gold-400)" /> 24 Teams Max
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Queries / Contact</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={15} color="var(--gold-400)" /> 8260555312
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                Register BGMI Roster <ArrowRight size={16} />
              </Link>
              <Link href="/referee" className="btn-secondary">
                LAN Referee Workspace
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
            <Image
              src="/brand/kurukshetra-esports-960.webp"
              alt="Kurukshetra BGMI Clash"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* BGIS 2026 Placement Chart Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>BGIS 2026 Placement Points System</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Transcribed exactly from the verified tournament scoring reference image.
              </p>
            </div>
            <div className="badge-gold">Version 1.0 Draft Reference</div>
          </div>

          {/* Accessible HTML Table */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <thead>
                <tr style={{ background: 'rgba(217, 119, 6, 0.25)', borderBottom: '1px solid var(--border-gold)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Place</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Points</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Place</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Points</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Place</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Points</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Place</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--gold-300)', fontWeight: 700 }}>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--gold-400)' }}>1 (WWCD)</td>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: '#ffffff' }}>10</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>2</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>6</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>3</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>5</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>4</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>4</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>5</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>3</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>6</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>2</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>7</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>1</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>8</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>1</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>9–16</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>0</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>9–16</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>0</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>9–16</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>0</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>9–16</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px dashed rgba(239, 68, 68, 0.35)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              <AlertTriangle size={16} /> Gated Scoring Settings (E07 Compliance)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              The supplied chart specifies placement points only. Kill multiplier, tie-break rules, round count, and placements 17–24 remain unresolved by organizers. Final total scores and standings publication remain strictly locked until complete approved scoring rules are signed off.
            </p>
          </div>
        </div>

        {/* LAN Operations & Roster Protocol */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            LAN Operational Protocol & Rules
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: '0.5rem' }}>
                1. Hardware & Integrity
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Organizer-provided hardware only for finals; no personal devices or unauthorized modifications. Station hardware integrity signed off by referees.
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: '0.5rem' }}>
                2. Roster Invariants (E03)
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Exactly 4 starters and 1 substitute slot. Exactly 1 starter designated as IGL. Leading zeros in UIDs strictly preserved. Duplicate UIDs across active rosters rejected.
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: '0.5rem' }}>
                3. Technical Pauses (E09)
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Pauses logged with reason, duration, affected match, and referee decision. No automated disqualifications; human adjudication preserves complete audit trail.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Free Fire Status Card */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Free Fire Tournament Status</h3>
          <span className="badge-pending">Unconfirmed by Organizers</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Free Fire details and its share of the earlier advertised combined ₹20,000 remain unconfirmed. We do not infer ₹10,000 for Free Fire by subtraction. Registration and schedules for Free Fire remain gated until approved specifications are delivered.
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Preserving separate Free Fire requirements independently without premature activation.
        </div>
      </div>

    </div>
  );
}
