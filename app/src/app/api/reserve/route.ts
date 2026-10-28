import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!str(body?.registration_id)) return jsonError(422, 'invalid', 'Missing registration.');
  return runCommand('ff_reserve_entry', { p_registration_id: str(body!.registration_id), p_idempotency_key: str(body!.idempotency_key) });
}
