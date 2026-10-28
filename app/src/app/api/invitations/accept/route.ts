import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  const token = str(body?.token);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return jsonError(422, 'invalid', 'This invitation link is incomplete.');
  return runCommand('ff_accept_invitation', { p_token: token });
}
