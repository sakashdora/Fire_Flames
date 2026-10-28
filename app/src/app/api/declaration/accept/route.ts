import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

// The declaration text and its hash come from the approved event version in the database,
// never from the browser.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!str(body?.registration_id)) return jsonError(422, 'invalid', 'Missing registration.');
  return runCommand('ff_accept_declaration', { p_registration_id: str(body!.registration_id) });
}
