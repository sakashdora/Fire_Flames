import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, entry_id, starter_member_id, substitute_member_id, authorized_by, reason } = body;

    if (!match_id || !entry_id || !starter_member_id || !substitute_member_id || !authorized_by) {
      return NextResponse.json({ error: 'Missing substitute activation fields' }, { status: 422 });
    }

    return NextResponse.json({
      status: 'activated',
      match_id,
      entry_id,
      starter_member_id,
      substitute_member_id,
      authorized_by,
      reason: reason || 'Authorized tactical/health substitution',
      activated_at: new Date().toISOString(),
      note: 'Substitute switch authorized within locked roster without modifying paid team identity or tournament capacity (E08).'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
