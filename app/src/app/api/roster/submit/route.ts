import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entry_id, registration_id, starters, substitute, idempotency_key, actor_id } = body;

    if (!starters || !Array.isArray(starters) || starters.length !== 4) {
      return NextResponse.json({
        error: 'Roster submission requires exactly 4 starters'
      }, { status: 422 });
    }

    // Check IGL count
    const iglCount = starters.filter((s: any) => s.is_igl).length;
    if (iglCount !== 1) {
      return NextResponse.json({
        error: 'Exactly one starter must be designated as In-Game Leader (IGL)'
      }, { status: 422 });
    }

    // Verify IGN and UIDs are non-empty and preserve leading zeros as strings
    for (let i = 0; i < starters.length; i++) {
      const s = starters[i];
      if (!s.ign || typeof s.ign !== 'string' || !s.ign.trim()) {
        return NextResponse.json({ error: `Starter ${i + 1} has invalid IGN` }, { status: 422 });
      }
      if (!s.player_uid || typeof s.player_uid !== 'string' || !s.player_uid.trim()) {
        return NextResponse.json({ error: `Starter ${i + 1} has invalid player UID` }, { status: 422 });
      }
    }

    // Check uniqueness within squad
    const uids = starters.map((s: any) => s.player_uid.trim());
    if (substitute && substitute.player_uid) {
      uids.push(substitute.player_uid.trim());
    }
    if (new Set(uids).size !== uids.length) {
      return NextResponse.json({
        error: 'Duplicate player UIDs detected within roster submission'
      }, { status: 422 });
    }

    return NextResponse.json({
      status: 'submitted',
      entry_id,
      starters_count: 4,
      substitute_included: !!(substitute && substitute.player_uid),
      uids,
      message: 'Roster snapshot recorded. Personal devices strictly prohibited for finals.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}
