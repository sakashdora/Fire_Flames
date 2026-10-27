import Link from 'next/link';
import Image from 'next/image';
import { Flame, Calendar, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { EVENT_CATALOGUE } from '@/domain/events';

export default function EFestPage() {
  const efestEvents = EVENT_CATALOGUE.filter(e => e.track === 'e-fest');

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '1rem' }}>
          ORGANIZER: ENTREPRENEURSHIP DEVELOPMENT (ED) CELL
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
          <span className="gold-gradient-text">FIRE & FLAMES</span> <span className="flame-gradient-text">E-FEST 2026</span>
        </h1>
        <p style={{ maxWidth: '780px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Annual Entrepreneurship & Management Fest at Srusti Academy of Management & Technology.
        </p>
      </div>

      {/* Pricing & Policy Card */}
      <div className="glass-panel glass-gold-glow" style={{ padding: '2rem 2.5rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Documented E-Fest Fee Policy
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 700 }}>FOUR GAMES</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>₹99 per Team</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IPL Auction, Brand War, E-Trivia, Treasure Hunt. One payment covers accepted roster.</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 700 }}>SRUSTI BAZAR</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>₹299 per Stall</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned commercial courtyard stall with power access and table setup.</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 700 }}>SRUSTI EXHIBITION</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>₹199 per Entry</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project prototype or working hardware showcase in Exhibition Gallery 1.</div>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
          * Individual intake (₹59/solo) remains gated until the college formally approves its pooling/allocation policy. The technical default allocates a complete provisional team before taking payment.
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {efestEvents.map((evt) => (
          <div key={evt.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ position: 'relative', width: '100%', height: '190px' }}>
                <Image src={evt.image} alt={evt.name} fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className="badge-gold">
                    {evt.priceOptions[0].label}
                  </span>
                </div>
              </div>

              <div style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {evt.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--gold-400)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  📅 {evt.datesDisplay} • 📍 {evt.venue}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {evt.description}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  <div><strong>Format:</strong> {evt.format}</div>
                  {evt.teamMin && <div><strong>Team Size:</strong> {evt.teamMin}–{evt.teamMax} members</div>}
                  {evt.capacity && <div><strong>Capacity:</strong> {evt.capacity} {evt.capacityUnit}s</div>}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 1.75rem 1.75rem' }}>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>
                Register for {evt.name} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
