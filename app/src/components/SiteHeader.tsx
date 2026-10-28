'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  return <header className="site-header" onKeyDown={e => {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }}><div className="nav-inner">
    <Link href="/" className="site-brand" aria-label="Fire and Flames home"><span className="brand-monogram">F<span>&</span>F<span className="brand-dot">.</span></span><span className="brand-caption">SRUSTI ACADEMY<br />FESTIVAL / 2026</span></Link>
    <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
    <nav id="site-navigation" className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <Link href="/e-fest" aria-current={path === '/e-fest' ? 'page' : undefined} onClick={() => setOpen(false)}>E-Fest <span>01</span></Link>
      <Link href="/esports" aria-current={path === '/esports' ? 'page' : undefined} onClick={() => setOpen(false)}>Esports <span>02</span></Link>
      <Link href="/teacher-login" onClick={() => setOpen(false)}>Teacher sign-in</Link>
      <Link className="nav-signin" href="/student-login" onClick={() => setOpen(false)}>Student sign-in <ArrowUpRight size={16} /></Link>
    </nav>
  </div></header>;
}
