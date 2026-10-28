import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the registration as JSON.');
  return runCommand('ff_start_registration', {
    p_event_slug: str(body.event_slug), p_team_name: str(body.team_name), p_mode: str(body.mode) ?? 'team',
    p_idempotency_key: str(body.idempotency_key),
  });
}
