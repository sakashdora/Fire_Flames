import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || !body.marks || typeof body.marks !== 'object') return jsonError(422, 'invalid', 'Missing marks.');
  const marks = Object.fromEntries(Object.entries(body.marks as Record<string, unknown>).map(([k, v]) => [k, v === null || v === '' ? null : String(v)]));
  return runCommand('ff_judge_save_scorecard', { p_assignment_id: str(body.assignment_id), p_marks: marks, p_lock: body.lock === true });
}
