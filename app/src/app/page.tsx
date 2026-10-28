import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FestivalMotion from '@/components/motion/FestivalMotion';
import FestivalHero from '@/components/hero/FestivalHero';
import { EVENT_CATALOGUE } from '@/domain/events';
export default function HomePage() {
  const events = EVENT_CATALOGUE.filter(e => e.track === 'e-fest');
  return <FestivalMotion>
    <FestivalHero />
    <section className="lineup-section wrap" id="lineup">
      <div className="section-heading" data-reveal><div><span className="eyebrow">01 / THE E-FEST LINEUP</span><h2>Play to your<br /><em>strengths.</em></h2></div><div><p>Bid. Pitch. Decode. Create.<br />Pick the challenge that feels like you.</p><Link className="text-link" href="/e-fest">Explore all six events <ArrowUpRight size={18} /></Link></div></div>
      <div className="event-poster-grid">{events.map((event, i) => <Link key={event.id} href={`/e-fest#${event.slug}`} className="event-poster" data-reveal>
        <div className="poster-image"><Image src={event.image} alt={`${event.name} event artwork`} fill sizes="(max-width: 650px) 90vw, (max-width: 1000px) 45vw, 30vw" /><span className="poster-index">0{i + 1}</span><span className="poster-arrow"><ArrowUpRight /></span></div>
        <div className="poster-caption"><h3>{event.name}</h3><span>{event.priceOptions[0].label}</span></div>
      </Link>)}</div>
    </section>
    <section className="campus-section wrap" data-reveal>
      <div className="campus-photo"><Image src="/brand/campus-photo-640.webp" alt="Srusti Academy campus building" fill sizes="(max-width: 650px) 100vw, 40vw" data-parallax /></div>
      <div className="campus-copy"><span className="eyebrow">BHUBANESWAR, ODISHA</span><h2>Your college.<br />Our campus.<br /><em>One big stage.</em></h2><p>Join students from across colleges at Srusti Academy of Management & Technology. Bring your ideas, your team and your competitive side.</p><div className="campus-date"><strong>13—14</strong><span>NOVEMBER<br />2026 · E-FEST & BGMI</span></div><Link href="/e-fest" className="text-link">Plan your participation <ArrowUpRight size={18} /></Link></div>
    </section>
    <div className="closing-strip" aria-hidden="true"><span data-drift>MAKE IT COUNT. MAKE IT COUNT.</span></div>
  </FestivalMotion>;
}
