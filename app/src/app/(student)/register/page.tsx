import { getSessionUser } from '@/lib/supabase/server';
import { EVENT_CATALOGUE } from '@/domain/events';
import StartRegistration, { type LiveEvent } from '@/components/workspace/StartRegistration';
import { Notice } from '@/components/ui/Notice';

export const metadata = { title: 'Register | Fire & Flames 2026' };
export const dynamic = 'force-dynamic';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event } = await searchParams;
  const { supabase } = await getSessionUser();
  if (!supabase) return <div className="ws"><Notice>Registration is unavailable because Supabase is not connected to this deployment.</Notice></div>;

  const { data, error } = await supabase.rpc('ff_public_catalogue', { p_track: null });
  if (error) return <div className="ws"><Notice tone="error">We could not load the event list. Refresh to try again.</Notice></div>;

  const events: LiveEvent[] = (data as any[]).map(e => {
    const info = EVENT_CATALOGUE.find(x => x.slug === e.slug);
    return { ...e, dates: info?.datesDisplay ?? null, organizer: info?.organizerName ?? null };
  });
  const initial = events.find(e => e.slug === event)?.slug ?? events.find(e => e.registration_open)?.slug ?? events[0]?.slug;

  return <div className="ws">
    <div className="ws-head">
      <span className="badge-gold">REGISTRATION</span>
      <h1>Register your team</h1>
      <p>Start an entry as captain. You then invite teammates, accept the official rules and hold your place. Payment opens once the college publishes its official payment details.</p>
    </div>
    <StartRegistration events={events} initialSlug={initial} />
  </div>;
}
