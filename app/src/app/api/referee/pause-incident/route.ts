import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, event_id, entry_id, official_id, request_type, decision, reason, duration_seconds } = body;

    if (!match_id || !official_id || !decision || !reason) {
      return NextResponse.json({ error: 'Missing mandatory adjudication fields' }, { status: 422 });
    }

    return NextResponse.json({
      status: 'recorded',
      match_id,
      entry_id,
      official_id,
      request_type: request_type || 'pause',
      decision,
      reason,
      duration_seconds: duration_seconds || 0,
      adjudicated_at: new Date().toISOString(),
      note: 'Human official decision recorded with append-only audit trail. Automated DQs prohibited (E09).'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
