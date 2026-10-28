import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!str(body?.revision_id)) return jsonError(422, 'invalid', 'Missing result revision.');
  return runCommand('ff_staff_review_result', { p_revision_id: str(body!.revision_id) });
}
