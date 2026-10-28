// Maps database SQLSTATE codes raised by public.ff_* commands to HTTP responses.
// Messages from our own RAISE statements are written for people; generic constraint
// messages are replaced so raw SQL details never reach the browser.

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

const CONSTRAINT_MESSAGES: Record<string, string> = {
  one_uid_per_event: 'A player UID in this roster is already registered for the event.',
  one_profile_per_event_roster: 'A player in this roster is already on another team for the event.',
  one_accepted_event_membership: 'You are already part of an entry for this event.',
  one_live_reservation: 'This entry already holds a place.',
  esports_matches_event_id_round_label_match_number_key: 'That match number already exists for this round.',
  idempotency_records_actor_id_command_client_key_key: 'This request is already being processed. Refresh in a moment.',
};

const OWN_MESSAGE_CODES = new Set(['28000', '42501', 'FFMFA', 'FFPRF', 'FF409', 'P0002', '22023', '23514', '55000']);

export function mapDatabaseError(err: { code?: string; message?: string; details?: string | null } | null | undefined): ApiError {
  const code = err?.code ?? 'unknown';
  const raw = err?.message ?? '';
  const constraint = Object.keys(CONSTRAINT_MESSAGES).find(name => raw.includes(name) || err?.details?.includes(name));

  if (code === '23505') return { status: 409, code: 'conflict', message: constraint ? CONSTRAINT_MESSAGES[constraint] : 'This record already exists.' };
  if (code === 'PGRST202') return { status: 503, code: 'not_migrated', message: 'The database commands are not installed on this project yet.' };
  if (code === '42501' && /permission denied/i.test(raw)) return { status: 403, code: 'forbidden', message: 'You are not allowed to do that.' };

  const message = OWN_MESSAGE_CODES.has(code) && raw ? raw : 'Something went wrong. Please try again.';
  switch (code) {
    case '28000': return { status: 401, code: 'unauthenticated', message };
    case '42501': return { status: 403, code: 'forbidden', message };
    case 'FFMFA': return { status: 403, code: 'mfa_required', message };
    case 'FFPRF': return { status: 428, code: 'profile_required', message };
    case 'FF409': case '55000': return { status: 409, code: 'conflict', message };
    case 'P0002': return { status: 404, code: 'not_found', message };
    case '22023': case '22P02': return { status: 422, code: 'invalid', message: code === '22P02' ? 'One of the values is not in the expected format.' : message };
    case '23514': return /capacity/i.test(raw) ? { status: 409, code: 'capacity_reached', message } : { status: 422, code: 'invalid', message };
    case '23503': return { status: 404, code: 'not_found', message: 'A referenced record was not found.' };
    default: return { status: 500, code: 'server_error', message };
  }
}
