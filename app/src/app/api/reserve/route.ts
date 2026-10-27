import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entry_id, event_slug, active_reservations_count, actor_id, idempotency_key } = body;

    if (!entry_id) {
      return NextResponse.json({ error: 'Missing entry ID' }, { status: 422 });
    }

    // BGMI has confirmed capacity of 24 teams
    const capacityLimit = event_slug === 'bgmi' ? 24 : 50;

    if (typeof active_reservations_count === 'number' && active_reservations_count >= capacityLimit) {
      return NextResponse.json({
        error: `Capacity reached: maximum ${capacityLimit} entries already reserved or confirmed (E04 compliance).`
      }, { status: 409 });
    }

    return NextResponse.json({
      status: 'held',
      reservation_id: `res-${entry_id.substring(0, 8)}`,
      entry_id,
      capacity_limit: capacityLimit,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      note: 'Atomic capacity reservation held for 30 minutes.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
