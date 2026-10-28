import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the verification as JSON.');
  return runCommand('ff_staff_verify_identity', {
    p_event_slug: str(body.event_slug), p_profile_id: str(body.profile_id), p_proof_type: str(body.proof_type),
    p_method: str(body.method) ?? 'in_person', p_status: str(body.status), p_rejection_reason: str(body.rejection_reason),
  });
}
