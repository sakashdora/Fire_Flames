'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const home = path === '/';

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!home) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [home]);

  const close = () => setOpen(false);
  const classes = ['site-header', home ? 'is-home' : '', home && (scrolled || open) ? 'is-solid' : ''].join(' ').trim();

  return <header className={classes} onKeyDown={e => {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }}><div className="nav-inner">
    <Link href="/" className="site-brand" aria-label="Fire and Flames home"><span className="brand-serif">F&amp;F</span></Link>
    <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
    <nav id="site-navigation" className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <Link href="/e-fest" aria-current={path === '/e-fest' ? 'page' : undefined} onClick={close}>E-Fest</Link>
      <Link href="/esports" aria-current={path === '/esports' ? 'page' : undefined} onClick={close}>Esports</Link>
      {signedIn
        ? <Link href="/dashboard" aria-current={path.startsWith('/dashboard') ? 'page' : undefined} onClick={close}>My workspace</Link>
        : <Link href="/student-login" aria-current={path === '/student-login' ? 'page' : undefined} onClick={close}>Student sign-in</Link>}
    </nav>
  </div></header>;
}
