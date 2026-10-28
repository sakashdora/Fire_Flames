import { jsonError, num, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the operation as JSON.');
  const event = str(body.event_slug);
  switch (body.kind) {
    case 'session': return runCommand('ff_admin_create_session', { p_event_slug: event, p_label: str(body.label), p_starts_at: str(body.starts_at), p_ends_at: str(body.ends_at) });
    case 'station': return runCommand('ff_admin_create_station', { p_event_slug: event, p_name: str(body.name), p_kind: str(body.station_kind) ?? 'checkpoint' });
    case 'match': return runCommand('ff_admin_create_match', { p_event_slug: event, p_round_label: str(body.round_label), p_match_number: num(body.match_number), p_session_id: str(body.session_id) || null });
    case 'duty': return runCommand('ff_admin_assign_duty', { p_email: str(body.email), p_session_id: str(body.session_id), p_station_id: str(body.station_id) });
    case 'rubric': return runCommand('ff_admin_create_rubric', { p_event_slug: event, p_name: str(body.name), p_criteria: body.criteria ?? [] });
    case 'judge': return runCommand('ff_admin_assign_judge', { p_email: str(body.email), p_entry_id: str(body.entry_id), p_rubric_id: str(body.rubric_id) });
    default: return jsonError(422, 'invalid', 'Unknown operation.');
  }
}
