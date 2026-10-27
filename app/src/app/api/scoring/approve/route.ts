import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scoring_version_id, kill_multiplier, tie_break_policy, approved_by } = body;

    // E07 Invariant: incomplete scoring rules cannot be approved!
    if (kill_multiplier === null || kill_multiplier === undefined || !tie_break_policy) {
      return NextResponse.json({
        error: 'Cannot approve incomplete scoring version: kill multiplier and tie-break policy are strictly required (E07 compliance).'
      }, { status: 422 });
    }

    if (!approved_by) {
      return NextResponse.json({ error: 'Missing authorized approver ID' }, { status: 422 });
    }

    return NextResponse.json({
      status: 'approved',
      scoring_version_id,
      kill_multiplier,
      tie_break_policy,
      approved_by,
      approved_at: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
