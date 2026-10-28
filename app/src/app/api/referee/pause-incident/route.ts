import { jsonError, num, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the adjudication as JSON.');
  return runCommand('ff_staff_log_incident', {
    p_match_id: str(body.match_id), p_entry_id: str(body.entry_id) || null, p_request_type: str(body.request_type) ?? 'pause',
    p_decision: str(body.decision), p_reason: str(body.reason), p_duration_seconds: num(body.duration_seconds), p_penalty_points: num(body.penalty_points),
  });
}
