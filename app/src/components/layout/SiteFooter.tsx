import Link from 'next/link';

export default function SiteFooter({ signedIn }: { signedIn: boolean }) {
  return <footer className="site-footer">
    <div className="footer-top"><Link href="/" className="footer-wordmark">FIRE & FLAMES<span>2026</span></Link><p>Srusti Academy of Management & Technology<br />(Autonomous), Bhubaneswar.</p></div>
    <div className="footer-bottom">
      <span>ED Cell × Srustiprosar</span>
      <div>
        <Link href="/e-fest">E-Fest</Link>
        <Link href="/esports">Esports</Link>
        {signedIn ? <Link href="/dashboard">My workspace</Link> : <Link href="/teacher-login">Teacher sign-in</Link>}
        <Link href="/login">Staff portal</Link>
      </div>
      <span>© 2026 Srusti Academy</span>
    </div>
  </footer>;
}
