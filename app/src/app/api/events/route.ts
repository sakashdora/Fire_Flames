import { NextResponse } from 'next/server';
import { EVENT_CATALOGUE } from '@/domain/events';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get('track');

  let results = EVENT_CATALOGUE;
  if (track === 'e-fest' || track === 'esports') {
    results = results.filter(e => e.track === track);
  }

  // Safe public projection (no room secrets, no participant data)
  return NextResponse.json({
    status: 'success',
    events: results.map(e => ({
      slug: e.slug,
      name: e.name,
      track: e.track,
      organizer: e.organizerName,
      dates: e.datesDisplay,
      venue: e.venue,
      capacity: e.capacity,
      priceOptions: e.priceOptions,
      gates: e.gates,
      scoringChart: e.scoringChart
    }))
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300'
    }
  });
}
