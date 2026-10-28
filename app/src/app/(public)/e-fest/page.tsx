import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FestivalMotion from '@/components/motion/FestivalMotion';
import { EVENT_CATALOGUE } from '@/domain/events';
export default function EFestPage() {
  const events = EVENT_CATALOGUE.filter(e => e.track === 'e-fest');
  return <FestivalMotion><div className="wrap">
    <section className="track-heading"><Link className="eyebrow back-link" href="/">← BACK TO THE FESTIVAL</Link><div className="hero-eyebrow" data-intro><span>01 / ORGANIZED BY ED CELL</span><span>13—14 NOVEMBER 2026</span></div><h1 data-intro>BIG IDEAS.<br /><em>REAL PLAY.</em></h1><div className="track-subline" data-intro><p>Fire & Flames — The E-Fest.<br />Six challenges. A campus full of possibilities.</p><span className="large-stat">₹36,000<small>COMBINED E-FEST PRIZE POOL</small></span></div></section>
    <nav className="event-index" aria-label="Jump to an event">{events.map((e,i)=><a key={e.id} href={`#${e.slug}`}><span>0{i+1}</span>{e.name}</a>)}</nav>
    <section className="event-details">{events.map((event,i)=><article key={event.id} id={event.slug} className="event-detail" data-reveal>
      <div className="detail-art"><Image src={event.image} alt={`${event.name} original artwork`} fill sizes="(max-width: 650px) 100vw, 40vw" /></div>
      <div className="detail-copy"><span className="eyebrow">0{i+1} / ED CELL</span><h2>{event.name}</h2><p>{event.description}</p><dl className="event-facts"><div><dt>Entry fee</dt><dd>{event.priceOptions[0].label}</dd></div><div><dt>{event.teamMin ? 'Team size' : 'Availability'}</dt><dd>{event.teamMin ? `${event.teamMin}–${event.teamMax} members` : `${event.capacity} ${event.capacityUnit === 'stall' ? 'stalls' : 'entries'}`}</dd></div><div><dt>Prize pool</dt><dd>{event.prizePoolDisplay}</dd></div><div><dt>Schedule</dt><dd>13–14 November · times to follow</dd></div></dl><Link href={`/register?event=${event.slug}`} className="btn-primary">Choose {event.name} <ArrowUpRight size={18} /></Link></div>
    </article>)}</section>
    <section className="participation-note" data-reveal><div><span className="eyebrow">BEFORE YOU JOIN</span><h2>A few things<br />to know.</h2></div><div><details><summary>Can students from other colleges participate?</summary><p>Yes. Participation is open to students from other colleges. Select an event and review its team requirements.</p></details><details><summary>Can I enter a game individually?</summary><p>The four games list a ₹59 individual option. Individual entry will open once the team allocation process is confirmed. Team entry is ₹99 per team.</p></details><details><summary>How do I pay?</summary><p>Payment collection will open after the official college payment details are confirmed. Do not pay an unofficial account.</p></details></div></section>
  </div></FestivalMotion>;
}
