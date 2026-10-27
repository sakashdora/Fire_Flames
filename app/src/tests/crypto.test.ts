import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePassToken, hashPassToken, encryptPassEnvelope, decryptPassEnvelope } from '../lib/qr-crypto.ts';

test('ADR 004: Pass token generation, hashing and AES-256-GCM encryption/decryption', () => {
  // 1. Generate 256-bit token
  const token = generatePassToken();
  assert.equal(token.length, 64, 'Token must be 64 hex characters (256 bits)');

  // 2. Hash token with SHA-256
  const hash = hashPassToken(token);
  assert.equal(hash.length, 64, 'SHA-256 hash must be 64 hex characters');
  assert.notEqual(hash, token, 'Hash must differ from plaintext token');

  // Same token produces identical hash
  assert.equal(hashPassToken(token), hash, 'Hash must be deterministic for lookup');

  // 3. Encrypt envelope
  const envelope = encryptPassEnvelope(token);
  assert.ok(envelope.ciphertext, 'Ciphertext must be present');
  assert.equal(envelope.nonce.length, 24, 'Nonce must be 12 bytes (24 hex characters)');
  assert.equal(envelope.tag.length, 32, 'GCM auth tag must be 16 bytes (32 hex characters)');
  assert.equal(envelope.keyVersion, 1, 'Key version must be 1');

  // 4. Decrypt envelope
  const decrypted = decryptPassEnvelope(envelope);
  assert.equal(decrypted, token, 'Decrypted token must exactly match original plaintext token');

  // 5. Tampered ciphertext or tag must fail decryption
  const tamperedEnvelope = {
    ...envelope,
    ciphertext: envelope.ciphertext.slice(0, -2) + '00'
  };
  assert.throws(() => {
    decryptPassEnvelope(tamperedEnvelope);
  }, /unsupported state or unable to authenticate data/i, 'Tampered envelope must fail GCM auth tag validation');
});
