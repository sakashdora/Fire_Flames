import { jsonError, num, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the role grant as JSON.');
  return runCommand('ff_admin_grant_role', {
    p_email: str(body.email), p_role: str(body.role), p_event_slug: str(body.event_slug) || null, p_days: num(body.days), p_reason: str(body.reason),
  });
}
