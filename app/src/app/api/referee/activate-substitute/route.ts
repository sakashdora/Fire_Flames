import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the substitution as JSON.');
  return runCommand('ff_staff_activate_substitute', {
    p_match_id: str(body.match_id), p_entry_id: str(body.entry_id), p_starter_member_id: str(body.starter_member_id),
    p_substitute_member_id: str(body.substitute_member_id), p_reason: str(body.reason),
  });
}
