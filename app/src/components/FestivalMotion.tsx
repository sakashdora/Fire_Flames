'use client';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Content stays visible without JavaScript; scrolling remains native.
export default function FestivalMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-intro]', { y: 38, opacity: 0, duration: 1.05, stagger: 0.1, ease: 'power3.out', clearProps: 'all' });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(item => {
          gsap.from(item, { y: 34, opacity: 0, duration: 0.85, ease: 'power3.out', clearProps: 'all',
            scrollTrigger: { trigger: item, start: 'top 94%', once: true } });
        });
      });
      media.add('(prefers-reduced-motion: no-preference) and (min-width: 900px) and (pointer: fine)', () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(item => {
          gsap.fromTo(item, { yPercent: -4 }, { yPercent: 4, ease: 'none',
            scrollTrigger: { trigger: item.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
        });
        const word = root.current?.querySelector('[data-drift]');
        if (word) gsap.to(word, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, []);
  return <div ref={root} className="festival-page">{children}</div>;
}
