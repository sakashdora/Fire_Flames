import Link from 'next/link';
import Image from 'next/image';
import { Flame, Trophy, Calendar, Users, Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EVENT_CATALOGUE } from '@/domain/events';

export default function HomePage() {
  const efestEvents = EVENT_CATALOGUE.filter(e => e.track === 'e-fest');
  const esportsEvents = EVENT_CATALOGUE.filter(e => e.track === 'esports');

  return (
    <div>
      {/* Hero Container: Dual-Track Organizer Split */}
      <section style={{ maxWidth: '1280px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge-gold" style={{ marginBottom: '1rem' }}>
            Srusti Academy Autonomous • Bhubaneswar
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.25rem' }}>
            <span className="gold-gradient-text">FIRE & FLAMES</span> <span className="flame-gradient-text">2026</span>
          </h1>
          <p style={{ maxWidth: '780px', margin: '0 auto', fontSize: '1.15rem', color: 'var(--text-muted)' }}>
            Two premier parallel arenas across 13 & 14 November 2026. External college participants welcome.
          </p>
        </div>

        {/* Dual Hero Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          
          {/* Track 1: Fire & Flames E-Fest (ED Cell) */}
          <div className="glass-panel glass-gold-glow" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={20} color="var(--gold-400)" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold-400)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      ORGANIZER: ED CELL
                    </span>
                    <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800 }}>E-Fest Arena</h2>
                  </div>
                </div>
                <span className="badge-gold">4 Games + 2 Stalls</span>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                <Image
                  src="/brand/fire-and-flames-cover-960.webp"
                  alt="Fire & Flames Cover"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Entrepreneurship, business strategy, live auctions, and campus-wide treasure hunts. Standard fee: <strong>₹99 per team</strong> (IPL, Brand War, E-Trivia, Treasure Hunt).
              </p>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-300)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <Calendar size={15} /> 13 & 14 November 2026
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Srusti Bazar: ₹299/stall • Srusti Exhibition: ₹199/entry • Solo allocation policy gated
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/e-fest" className="btn-primary" style={{ flex: 1 }}>
                Explore E-Fest <ArrowRight size={16} />
              </Link>
              <Link href="/register" className="btn-secondary">
                Register
              </Link>
            </div>
          </div>

          {/* Track 2: Kurukshetra Esports (Srustiprosar) */}
          <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderColor: 'rgba(234, 88, 12, 0.4)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(234, 88, 12, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={20} color="var(--ember-400)" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--ember-400)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      ORGANIZER: SRUSTIPROSAR
                    </span>
                    <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800 }}>Kurukshetra Esports</h2>
                  </div>
                </div>
                <span className="badge-gold">₹10,000 Pool</span>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                <Image
                  src="/brand/kurukshetra-esports-960.webp"
                  alt="Kurukshetra Esports BGMI"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span className="badge-gold" style={{ fontSize: '0.72rem', background: 'rgba(220, 38, 38, 0.2)', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#fca5a5' }}>
                  KALINGA BGMI CLASH SEASON 1
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
                  Alias: Kalinga Clash 2K26
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Official venue LAN. <strong>24 teams</strong>, 4 starters + 1 substitute slot, 1 IGL. No personal devices for finals. BGIS 2026 16-tier placement scoring.
              </p>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ember-400)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <Calendar size={15} /> 13 & 14 November 2026
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                  <AlertCircle size={14} /> Entry Fee & QR Pending Approval (Checkout Gated)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/esports" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ea580c, #c2410c)', borderColor: 'var(--ember-400)' }}>
                Esports Arena <ArrowRight size={16} />
              </Link>
              <Link href="/register" className="btn-secondary">
                Register Squad
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Confirmed LAN & Governance Highlights */}
      <section style={{ maxWidth: '1280px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem 2.5rem', borderLeft: '4px solid var(--gold-500)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Shield size={18} /> LAN Tournament Integrity
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Organizer-provided hardware and dedicated gaming network only. Technical pauses and disconnects adjudicated with human referee review and audit logging.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Users size={18} /> Inter-College Participation
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Students from Srusti Academy and all recognized universities/colleges are eligible. Required government ID proof (Aadhaar / PAN / Voter ID) verified securely.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 700, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} /> Verified Financial Protection
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Payments only accepted via independently verified college payment QR. Screenshots or unverified UTR entries are not auto-approved.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Complete Event Catalogue Grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>All Events & Competitions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Explore detailed formats, rules, prize pools, and registration requirements.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/e-fest" className="btn-secondary" style={{ fontSize: '0.82rem' }}>E-Fest (6)</Link>
            <Link href="/esports" className="btn-secondary" style={{ fontSize: '0.82rem' }}>Esports (2)</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {EVENT_CATALOGUE.map((evt) => (
            <div key={evt.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ position: 'relative', width: '100%', height: '170px' }}>
                  <Image src={evt.image} alt={evt.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className="badge-gold" style={{ background: evt.track === 'esports' ? 'rgba(234, 88, 12, 0.85)' : 'rgba(217, 119, 6, 0.85)', color: '#ffffff', borderColor: 'transparent' }}>
                      {evt.organizerName}
                    </span>
                  </div>
                  {evt.capacity && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span className="badge-gold" style={{ background: 'rgba(0,0,0,0.7)', color: '#fef3c7' }}>
                        Cap: {evt.capacity} {evt.capacityUnit}s
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                    {evt.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} /> {evt.datesDisplay} • {evt.venue}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {evt.description}
                  </p>

                  {/* Fee & Gates Status */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                      {evt.priceOptions.map(p => p.label).join(' • ')}
                    </div>
                    {evt.gates.length > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
                        ⚠️ {evt.gates[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <Link href={evt.track === 'esports' ? '/esports' : '/e-fest'} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                  View Full Event Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
