'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './festival-hero.css';

const embers = [6, 14, 23, 31, 44, 58, 67, 76, 85, 93];

export default function FestivalHero() {
  const root = useRef<HTMLElement>(null);
  const pausedRef = useRef(false);
  const syncMotion = useRef<(() => void) | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
    syncMotion.current?.();
  }, [paused]);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from('.blaze-backdrop', { opacity: 0, scale: 1.08, duration: 1.6, clearProps: 'opacity' }, 0)
          .from('.blaze-kicker', { opacity: 0, letterSpacing: '0.2em', duration: 1 }, .2)
          .from('.blaze-title > span', { yPercent: 110, opacity: 0, duration: 1.1, stagger: .09, clearProps: 'all' }, .3)
          .from('.blaze-tagline', { opacity: 0, y: 14, duration: .8, clearProps: 'all' }, .8)
          .from('.blaze-card', { opacity: 0, y: 32, duration: .9, stagger: .14, clearProps: 'all' }, .9)
          .from('.blaze-foot', { opacity: 0, duration: .8, clearProps: 'all' }, 1.3);

        const ambient = gsap.timeline({ repeat: -1, yoyo: true });
        ambient.to('.blaze-backdrop img', { scale: 1.045, xPercent: -1.2, duration: 14, ease: 'sine.inOut' }, 0);
        gsap.utils.toArray<HTMLElement>('.blaze-ember').forEach((ember, index) => {
          ambient.fromTo(ember, { y: 40, opacity: 0 }, {
            y: -160 - index * 12, opacity: .8, duration: 5, repeat: 2, ease: 'sine.inOut',
          }, index * .45);
        });

        let inView = true;
        const sync = () => ambient.paused(pausedRef.current || document.hidden || !inView);
        syncMotion.current = sync;
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          sync();
        }, { threshold: .05 });
        observer.observe(element);
        document.addEventListener('visibilitychange', sync);
        sync();
        return () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', sync);
          syncMotion.current = null;
          intro.kill();
          ambient.kill();
        };
      });
    }, element);
    return () => { media.revert(); context.revert(); };
  }, []);

  return (
    <section ref={root} className="blaze-hero" aria-labelledby="festival-title">
      <div className="blaze-backdrop" aria-hidden="true">
        <Image src="/brand/hero-ribbon-1672.webp" alt="" fill priority sizes="100vw" />
      </div>
      <div className="blaze-vignette" aria-hidden="true" />
      <div className="blaze-embers" aria-hidden="true">
        {embers.map((left, i) => <span key={left} className="blaze-ember" style={{ left: `${left}%`, bottom: `${30 + (i % 4) * 8}%` }} />)}
      </div>

      <div className="blaze-content">
        <p className="blaze-kicker">SRUSTI ACADEMY <span>/</span> 2026</p>
        <h1 id="festival-title" className="blaze-title" aria-label="Fire and Flames 2026">
          <span>FIRE</span> <span className="blaze-amp">&amp;</span> <span>FLAMES</span>
        </h1>
        <p className="blaze-tagline">Ideas ignite. Rivalries rise.</p>
        <p className="blaze-dates">13–14 November 2026 · Bhubaneswar</p>

        <div className="blaze-cards" id="arenas">
          <Link className="blaze-card blaze-card-efest" href="/e-fest">
            <Image className="blaze-card-art" src="/brand/efest-gateway-790.webp" alt="" fill sizes="(max-width: 820px) 100vw, 50vw" />
            <span className="blaze-card-body">
              <span className="blaze-card-head">
                <small>ED CELL PRESENTS</small>
                <Image className="blaze-card-logo logo-edcell" src="/brand/ed-cell-logo-320.webp" alt="ED Cell" width={104} height={104} />
              </span>
              <strong>THE E-FEST</strong>
              <span className="blaze-card-cta">Explore E-Fest <ChevronRight size={18} /></span>
            </span>
          </Link>
          <Link className="blaze-card blaze-card-esports" href="/esports">
            <Image className="blaze-card-art" src="/brand/kurukshetra-banner-790.webp" alt="" fill sizes="(max-width: 820px) 100vw, 50vw" />
            <span className="blaze-card-body">
              <span className="blaze-card-head">
                <small>SRUSTIPROSAR PRESENTS</small>
                <Image className="blaze-card-logo logo-prosar" src="/brand/srustiprosar-logo-dark-320.webp" alt="Srustiprosar" width={160} height={92} />
              </span>
              <strong>KURUKSHETRA</strong>
              <span className="blaze-card-cta">Explore Esports <ChevronRight size={18} /></span>
            </span>
          </Link>
        </div>

        <div className="blaze-foot">
          <span className="blaze-foot-line" />
          <span>OPEN TO STUDENTS FROM ALL COLLEGES</span>
          <span className="blaze-foot-line" />
          <button className="blaze-motion-toggle" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Resume background animation' : 'Pause background animation'}>
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>
    </section>
  );
}
