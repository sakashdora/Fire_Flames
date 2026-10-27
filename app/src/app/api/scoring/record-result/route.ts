import { NextResponse } from 'next/server';

const BGIS_2026_PLACEMENT_POINTS: Record<number, number> = {
  1: 10,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, scoring_version_id, results, recorded_by, reviewed_by, kill_multiplier } = body;

    if (!match_id || !results || !Array.isArray(results) || !recorded_by) {
      return NextResponse.json({ error: 'Missing required match results parameters' }, { status: 422 });
    }

    // Invariant: Scorer and Reviewer must be distinct individuals
    if (reviewed_by && reviewed_by === recorded_by) {
      return NextResponse.json({
        error: 'Scorer and Reviewer must be distinct officials (E10 invariant).'
      }, { status: 422 });
    }

    const mult = typeof kill_multiplier === 'number' ? kill_multiplier : 1;

    // Server-side calculation only
    const calculatedRows = results.map((row: any) => {
      const placement = Number(row.placement);
      const kills = Number(row.kills || 0);
      const placePoints = BGIS_2026_PLACEMENT_POINTS[placement] ?? 0;
      const killPoints = kills * mult;
      const totalPoints = placePoints + killPoints;

      return {
        entry_id: row.entry_id,
        placement,
        kills,
        placement_points: placePoints,
        kill_points: killPoints,
        total_points: totalPoints
      };
    });

    return NextResponse.json({
      status: reviewed_by ? 'reviewed' : 'draft',
      match_id,
      scoring_version_id,
      recorded_by,
      reviewed_by: reviewed_by || null,
      reviewed_at: reviewed_by ? new Date().toISOString() : null,
      results: calculatedRows,
      note: 'Totals computed on server from official BGIS 2026 placement table. Browser calculations rejected.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
