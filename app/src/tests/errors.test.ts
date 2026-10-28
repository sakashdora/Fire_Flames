import test from 'node:test';
import assert from 'node:assert/strict';
import { mapDatabaseError } from '../lib/api/errors.ts';

test('command SQLSTATEs map to HTTP statuses', () => {
  const cases: [string, number, string][] = [
    ['28000', 401, 'unauthenticated'], ['42501', 403, 'forbidden'], ['FFMFA', 403, 'mfa_required'], ['FFPRF', 428, 'profile_required'],
    ['FF409', 409, 'conflict'], ['55000', 409, 'conflict'], ['P0002', 404, 'not_found'], ['22023', 422, 'invalid'],
  ];
  for (const [code, status, name] of cases) {
    const r = mapDatabaseError({ code, message: 'Our message' });
    assert.equal(r.status, status, code);
    assert.equal(r.code, name, code);
    assert.equal(r.message, 'Our message', `${code} keeps the authored message`);
  }
});

test('capacity rejection is a 409 conflict, other check violations are 422', () => {
  assert.equal(mapDatabaseError({ code: '23514', message: 'Capacity reached: maximum 24 entries already reserved or confirmed' }).status, 409);
  assert.equal(mapDatabaseError({ code: '23514', message: 'Exactly one starter must be designated as IGL' }).status, 422);
});

test('raw constraint and server errors never leak SQL details', () => {
  const dup = mapDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "one_uid_per_event"', details: 'Key (event_id, player_uid)=(…) already exists.' });
  assert.equal(dup.status, 409);
  assert.doesNotMatch(dup.message, /constraint|Key \(/);
  assert.match(dup.message, /player UID/);
  const unknown = mapDatabaseError({ code: 'XX000', message: 'internal error at plpgsql line 12' });
  assert.equal(unknown.status, 500);
  assert.doesNotMatch(unknown.message, /plpgsql/);
  assert.equal(mapDatabaseError({ code: '42501', message: 'permission denied for function rpc_reserve_entry' }).message, 'You are not allowed to do that.');
});
