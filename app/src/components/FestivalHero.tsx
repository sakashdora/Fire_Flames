'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './festival-hero.css';

const sparks = [8, 17, 26, 39, 47, 56, 64, 73, 82, 91];

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
        intro.from('.ignition-meta', { opacity: 0, y: 12, duration: .7 })
          .from('.ignition-title-line > span', { yPercent: 108, rotate: 3, duration: 1.15, stagger: .12, clearProps: 'all' }, .1)
          .from('.ignition-deck', { opacity: 0, y: 18, duration: .8, clearProps: 'all' }, .5)
          .from('.ignition-visual', { opacity: 0, scale: .85, rotate: -12, duration: 1.5, clearProps: 'all' }, .05)
          .from('.track-ticket', { opacity: 0, y: 25, duration: .8, stagger: .12, clearProps: 'all' }, .65);

        const ambient = gsap.timeline({ repeat: -1 });
        ambient.to('.orbit-rotor', { rotation: 360, duration: 40, ease: 'none' }, 0);
        gsap.utils.toArray<HTMLElement>('.ignition-spark').forEach((spark, index) => {
          ambient.fromTo(spark, { y: 30, opacity: 0 }, {
            y: -120 - index * 9, opacity: .7, duration: 4, repeat: 7,
            yoyo: true, ease: 'sine.inOut',
          }, index * .5);
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

      media.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 900px)', () => {
        const visual = element.querySelector('.orbit-pointer');
        const xTo = gsap.quickTo(visual, 'x', { duration: 1.1, ease: 'power3.out' });
        const yTo = gsap.quickTo(visual, 'y', { duration: 1.1, ease: 'power3.out' });
        const move = (event: PointerEvent) => {
          if (pausedRef.current) return;
          const rect = element.getBoundingClientRect();
          xTo((event.clientX - rect.left - rect.width / 2) * .018);
          yTo((event.clientY - rect.top - rect.height / 2) * .018);
        };
        const leave = () => { xTo(0); yTo(0); };
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', leave);
        return () => {
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', leave);
        };
      });
    }, element);
    return () => { media.revert(); context.revert(); };
  }, []);

  return (
    <section ref={root} className="ignition-hero" aria-labelledby="festival-title">
      <div className="ignition-backdrop" aria-hidden="true">
        <Image src="/brand/ember-hero-1920.webp" alt="" fill priority sizes="100vw" />
      </div>
      <div className="ignition-grain" aria-hidden="true" />
      <div className="ignition-sparks" aria-hidden="true">
        {sparks.map((left, i) => <span key={left} className="ignition-spark" style={{ left: `${left}%`, bottom: `${10 + i % 4 * 9}%` }} />)}
      </div>

      <div className="ignition-content wrap">
        <div className="ignition-meta">
          <span><i /> SRUSTI ACADEMY <b>/</b> BHUBANESWAR</span>
          <button className="hero-motion-toggle" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Resume ambient animation' : 'Pause ambient animation'}>
            {paused ? <Play size={12} /> : <Pause size={12} />}<span>{paused ? 'RESUME MOTION' : 'PAUSE MOTION'}</span>
          </button>
        </div>

        <div className="ignition-stage">
          <div className="ignition-copy">
            <p className="ignition-kicker ignition-deck">THE CAMPUS COMES ALIVE.</p>
            <h1 id="festival-title" className="ignition-title" aria-label="Fire and Flames 2026">
              <span className="ignition-title-line"><span>FIRE <i>&</i></span></span>
              <span className="ignition-title-line"><span>FLAMES<span className="ignition-period">.</span></span></span>
            </h1>
            <div className="ignition-deck ignition-description"><span className="ignition-rule" /><p>For the ideas that spark.<br />And the rivalries that burn.</p></div>
            <p className="ignition-mobile-date">13—14 NOVEMBER 2026 <span> / E-FEST + BGMI</span></p>
          </div>

          <div className="ignition-visual" role="img" aria-label="E-Fest and BGMI: 13–14 November 2026">
            <div className="orbit-pointer" aria-hidden="true">
              <div className="orbit-aura" />
              <svg className="orbit-rotor" viewBox="0 0 500 500" fill="none">
                <circle cx="250" cy="250" r="224" stroke="currentColor" strokeOpacity=".12" />
                <circle cx="250" cy="250" r="209" stroke="currentColor" strokeWidth="2" strokeDasharray="2 15" strokeOpacity=".6" />
                <circle cx="250" cy="250" r="193" stroke="currentColor" strokeWidth="2" strokeDasharray="300 910" />
                <circle cx="250" cy="250" r="180" stroke="currentColor" strokeOpacity=".18" />
                <path d="M250 8V38M250 462V492M8 250H38M462 250H492" stroke="currentColor" />
                <circle cx="250" cy="26" r="4" fill="currentColor" />
                <circle cx="250" cy="474" r="3" fill="currentColor" />
              </svg>
              <div className="orbit-inner"><span>MARK THE DATES</span><strong>13<span>—</span>14</strong><b>NOVEMBER / 2026</b><div className="orbit-cross">✳</div></div>
            </div>
            <p className="orbit-caption">E-FEST + BGMI <span>·</span> TWO DAYS. ALL IN.</p>
          </div>
        </div>

        <div className="ignition-entrances" id="arenas">
          <Link className="track-ticket ticket-efest" href="/e-fest">
            <span className="ticket-number">01</span>
            <Image className="ticket-logo" src="/brand/ed-cell-logo-320.webp" alt="" width={42} height={42} />
            <span className="ticket-copy"><small>ED CELL PRESENTS</small><strong>THE E-FEST</strong><span>Ideas. Enterprise. A little friendly rivalry.</span></span>
            <span className="ticket-action"><span>EXPLORE</span><ArrowUpRight size={22} /></span>
          </Link>
          <Link className="track-ticket ticket-esports" href="/esports">
            <span className="ticket-number">02</span>
            <Image className="ticket-logo" src="/brand/srustiprosar-logo-320.webp" alt="" width={42} height={42} />
            <span className="ticket-copy"><small>SRUSTIPROSAR PRESENTS</small><strong>KURUKSHETRA</strong><span>Your squad. Your arena. Your moment.</span></span>
            <span className="ticket-action"><span>EXPLORE</span><ArrowUpRight size={22} /></span>
          </Link>
        </div>
        <div className="ignition-bottom"><span>OPEN TO STUDENTS FROM ALL COLLEGES</span><a href="#lineup">DISCOVER THE LINEUP <ArrowDown size={13} /></a></div>
      </div>
    </section>
  );
}
