import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import './globals.css';
export const metadata: Metadata = {
  title: 'Fire & Flames 2026 | Srusti Academy of Management & Technology',
  description: 'Fire & Flames E-Fest by ED Cell and Kurukshetra Esports by Srustiprosar. Explore the events at Srusti Academy, Bhubaneswar.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to content</a><SiteHeader />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="site-footer">
      <div className="footer-top"><Link href="/" className="footer-wordmark">FIRE & FLAMES<span>2026</span></Link><p>Srusti Academy of Management & Technology<br />(Autonomous), Bhubaneswar.</p></div>
      <div className="footer-bottom"><span>ED Cell × Srustiprosar</span><div><Link href="/e-fest">E-Fest</Link><Link href="/esports">Esports</Link><Link href="/teacher-login">Teacher sign-in</Link><Link href="/referee">Staff workspace</Link></div><span>© 2026 Srusti Academy</span></div>
    </footer>
  </body></html>;
}
