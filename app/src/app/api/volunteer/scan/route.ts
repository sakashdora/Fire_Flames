import { jsonError, readJson, runCommand, str } from '@/lib/api/command';
import { hashPassToken } from '@/lib/crypto/pass-envelope';

// The scanned token is hashed here; the plaintext token is never sent to or stored by the database.
export async function POST(request: Request) {
  const body = await readJson(request);
  const token = str(body?.token)?.trim();
  if (!token) return jsonError(422, 'invalid', 'Scan or enter a pass code.');
  return runCommand('ff_staff_scan_pass', { p_token_hash: hashPassToken(token), p_session_id: str(body!.session_id), p_station_id: str(body!.station_id) });
}
