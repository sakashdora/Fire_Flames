import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Flame, Shield, Trophy, UserCheck, Users, LogIn } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fire & Flames 2026 | Srusti Academy of Management & Technology',
  description: 'Official dual-track fest portal: Fire & Flames E-Fest by ED Cell and Kurukshetra Esports by Srustiprosar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Top Announcement Bar */}
        <div style={{ background: 'linear-gradient(90deg, #78350f, #991b1b, #78350f)', padding: '0.4rem 1rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: '#fef3c7', borderBottom: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <span>🔥 KALINGA BGMI CLASH SEASON 1: 13–14 Nov 2026 • 24 Teams • ₹10,000 Pool • Personal devices strictly prohibited for finals</span>
        </div>

        {/* Global Navigation Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(7, 6, 5, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Brand Logo & College Title */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }}>
                <Flame size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                  FIRE & FLAMES
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold-400)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Srusti Academy Autonomous
                </div>
              </div>
            </Link>

            {/* Track Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/e-fest" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame size={16} color="var(--ember-400)" />
                E-Fest (ED Cell)
              </Link>
              <Link href="/esports" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Trophy size={16} color="var(--gold-400)" />
                Kurukshetra Esports
              </Link>
              <Link href="/register" style={{ color: 'var(--gold-300)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={16} />
                Register Team
              </Link>
            </nav>

            {/* Separate Sign-in Entrances & Staff Portals */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/student-login" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
                <LogIn size={14} />
                Student Portal
              </Link>
              <Link href="/teacher-login" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem', borderColor: 'rgba(217, 119, 6, 0.3)' }}>
                <UserCheck size={14} color="var(--gold-400)" />
                Teacher Login
              </Link>
              <Link href="/referee" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
                <Shield size={14} />
                Staff Workspaces
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* Global Footer */}
        <footer style={{ background: '#0a0806', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '3rem 1.5rem 2rem', marginTop: '4rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                FIRE & FLAMES 2026
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Srusti Academy of Management & Technology (Autonomous), Bhubaneswar. Celebrating entrepreneurship, management leadership, and esports mastery.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '0.75rem' }}>
                ORGANIZERS
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>🔥 <strong>ED Cell:</strong> Fire & Flames E-Fest (4 games, Bazar, Exhibition)</li>
                <li>🏆 <strong>Srustiprosar:</strong> Kurukshetra Esports (BGMI Season 1 & Free Fire)</li>
                <li>📍 <strong>Queries / Helpdesk:</strong> 8260555312</li>
              </ul>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gold-400)', marginBottom: '0.75rem' }}>
                COMPLIANCE & GOVERNANCE
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                No unofficial payment collection. Unknown esports fees remain gated until formal college finance sign-off. Teacher sign-in does not confer administrative authority without scoped assignment.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            <div>© 2026 Srusti Academy of Management & Technology. All rights reserved.</div>
            <div>Built for Fire & Flames 2026 • Verified Staging Target</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
