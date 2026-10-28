import { jsonError, readJson, runCommand, str } from '@/lib/api/command';

type Player = { profile_id?: unknown; ign?: unknown; player_uid?: unknown; is_igl?: unknown };
const player = (p: Player, withIgl: boolean) => ({
  profile_id: str(p.profile_id), ign: str(p.ign)?.trim() ?? '', player_uid: str(p.player_uid)?.trim() ?? '',
  ...(withIgl ? { is_igl: p.is_igl === true } : {}),
});

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || !Array.isArray(body.starters)) return jsonError(422, 'invalid', 'Roster submission requires a list of starters.');
  if (body.starters.length !== 4) return jsonError(422, 'invalid', 'Roster submission requires exactly 4 starters.');
  const sub = body.substitute && typeof body.substitute === 'object' && str((body.substitute as Player).profile_id)
    ? player(body.substitute as Player, false) : null;
  return runCommand('ff_submit_roster', {
    p_registration_id: str(body.registration_id),
    p_starters: (body.starters as Player[]).map(p => player(p, true)),
    p_substitute: sub,
    p_idempotency_key: str(body.idempotency_key),
  });
}
