import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePassToken, hashPassToken, encryptPassEnvelope, decryptPassEnvelope } from '../lib/crypto/pass-envelope.ts';

const KEY = 'ab'.repeat(32);
const binding = { passId: 'pass-1', participantId: 'participant-1', eventId: 'event-1' };

test('ADR 004: 256-bit token, deterministic SHA-256 lookup hash', () => {
  const token = generatePassToken();
  assert.match(token, /^[0-9a-f]{64}$/);
  const hash = hashPassToken(token);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.notEqual(hash, token);
  assert.equal(hashPassToken(` ${token} `), hash, 'scanner whitespace must not change the lookup hash');
});

test('ADR 004: AES-256-GCM envelope round-trips and rejects tampering', () => {
  const token = generatePassToken();
  const env = encryptPassEnvelope(token, binding, KEY);
  assert.equal(env.nonce.length, 24);
  assert.equal(env.tag.length, 32);
  assert.equal(env.keyVersion, 1);
  assert.equal(decryptPassEnvelope(env, binding, KEY), token);
  assert.throws(() => decryptPassEnvelope({ ...env, ciphertext: env.ciphertext.slice(0, -2) + (env.ciphertext.endsWith('00') ? '11' : '00') }, binding, KEY));
  assert.throws(() => decryptPassEnvelope(env, binding, 'cd'.repeat(32)), 'wrong key must fail');
});

test('ADR 004: envelope is bound to its pass, participant and event', () => {
  const env = encryptPassEnvelope(generatePassToken(), binding, KEY);
  assert.throws(() => decryptPassEnvelope(env, { ...binding, participantId: 'participant-2' }, KEY));
  assert.throws(() => decryptPassEnvelope(env, { ...binding, eventId: 'event-2' }, KEY));
});

test('ADR 004: no built-in fallback key', () => {
  const saved = process.env.PASS_ENCRYPTION_KEY;
  delete process.env.PASS_ENCRYPTION_KEY;
  try {
    assert.throws(() => encryptPassEnvelope('x', binding), /PASS_ENCRYPTION_KEY/);
    assert.throws(() => encryptPassEnvelope('x', binding, 'short'), /PASS_ENCRYPTION_KEY/);
  } finally {
    if (saved !== undefined) process.env.PASS_ENCRYPTION_KEY = saved;
  }
});
