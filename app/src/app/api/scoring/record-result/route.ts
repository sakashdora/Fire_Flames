import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

// Points are computed in the database from the approved scoring version; browser totals are ignored.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || !Array.isArray(body.results)) return jsonError(422, 'invalid', 'Missing match results.');
  const results = (body.results as Record<string, unknown>[]).map(r => ({ entry_id: str(r.entry_id), placement: Number(r.placement), kills: Number(r.kills ?? 0) }));
  return runCommand('ff_staff_record_result', { p_match_id: str(body.match_id), p_results: results });
}
