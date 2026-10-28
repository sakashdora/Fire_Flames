import { jsonError, num, readJson, runCommand, str } from '@/lib/api/command';

// Saves the organizer-approved kill points and tie-break policy on the draft, then approves it.
// Approval fails in the database if either value is missing (E07).
export async function POST(request: Request) {
  const body = await readJson(request);
  const id = str(body?.scoring_version_id);
  if (!body || !id) return jsonError(422, 'invalid', 'Missing scoring version.');
  if ('kill_multiplier' in body || 'tie_break_policy' in body) {
    const draft = await runCommand('ff_admin_update_scoring', {
      p_scoring_version_id: id, p_kill_multiplier: num(body.kill_multiplier), p_tie_break_policy: str(body.tie_break_policy),
    });
    if (!draft.ok || body.approve === false) return draft;
  }
  return runCommand('ff_admin_approve_scoring', { p_scoring_version_id: id });
}
