import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registration_id, rules_version_id, declaration_hash, declaration_version, actor_id } = body;

    if (!registration_id || !declaration_hash) {
      return NextResponse.json({ error: 'Missing registration or declaration hash' }, { status: 422 });
    }

    return NextResponse.json({
      status: 'accepted',
      registration_id,
      declaration_version: declaration_version || 'v1.0',
      declaration_hash,
      accepted_at: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
