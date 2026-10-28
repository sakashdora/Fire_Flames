import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the inspection as JSON.');
  return runCommand('ff_staff_signoff_hardware', {
    p_station_id: str(body.station_id), p_session_id: str(body.session_id) || null, p_asset_code: str(body.asset_code),
    p_config_version: str(body.config_version), p_result: str(body.result) ?? 'passed', p_reason: str(body.reason),
  });
}
