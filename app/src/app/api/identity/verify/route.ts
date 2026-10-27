import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, profile_id, proof_type, method, status, reviewer_id } = body;

    if (!event_id || !profile_id || !proof_type) {
      return NextResponse.json({ error: 'Missing required verification fields' }, { status: 422 });
    }

    if (reviewer_id && reviewer_id === profile_id) {
      return NextResponse.json({ error: 'Reviewer cannot verify own identity (E05 invariant)' }, { status: 422 });
    }

    const validProofTypes = ['aadhaar', 'pan', 'voter_id', 'college_id'];
    if (!validProofTypes.includes(proof_type)) {
      return NextResponse.json({ error: 'Invalid proof type' }, { status: 422 });
    }

    return NextResponse.json({
      status: status || 'verified',
      profile_id,
      proof_type,
      method: method || 'in_person',
      verified_at: new Date().toISOString(),
      note: 'Verified without storing plaintext national ID numbers (Data minimization policy).'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
