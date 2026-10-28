import { NextResponse } from 'next/server';
import { jsonError, readJson, runCommand, str } from '@/lib/api/command';
import { siteOrigin } from '@/lib/env';

// No transactional email provider is approved yet, so the captain receives the one-time link to share.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the invitation as JSON.');
  const res = await runCommand('ff_invite_member', { p_registration_id: id, p_email: str(body.email) });
  if (!res.ok) return res;
  const { data } = await res.json();
  return NextResponse.json({
    data: { invitation_id: data.invitation_id, expires_at: data.expires_at, invite_url: `${siteOrigin(request.url)}/invite/${data.token}`, email_sent: false },
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
