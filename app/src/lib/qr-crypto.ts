import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';

// ADR 004: QR Redisplay & Cryptographic Envelopes
// Server-side only; never expose encryption keys to the browser or database rows.

const DEFAULT_SERVER_KEY = process.env.PASS_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const KEY_VERSION = 1;

export interface EncryptedPassEnvelope {
  ciphertext: string;
  nonce: string;
  tag: string;
  keyVersion: number;
}

/**
 * Generate a cryptographically secure 256-bit random pass token.
 */
export function generatePassToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Compute SHA-256 hash of a pass token for fast database lookup.
 */
export function hashPassToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Encrypt a pass token using AES-256-GCM for authenticated redisplay.
 */
export function encryptPassEnvelope(token: string, keyHex: string = DEFAULT_SERVER_KEY): EncryptedPassEnvelope {
  const key = Buffer.from(keyHex, 'hex');
  const nonce = randomBytes(12); // 96-bit standard GCM nonce
  const cipher = createCipheriv('aes-256-gcm', key, nonce);

  let ciphertext = cipher.update(token, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    nonce: nonce.toString('hex'),
    tag,
    keyVersion: KEY_VERSION
  };
}

/**
 * Decrypt an AES-256-GCM encrypted pass envelope.
 */
export function decryptPassEnvelope(
  envelope: { ciphertext: string; nonce: string; tag: string },
  keyHex: string = DEFAULT_SERVER_KEY
): string {
  const key = Buffer.from(keyHex, 'hex');
  const nonce = Buffer.from(envelope.nonce, 'hex');
  const tag = Buffer.from(envelope.tag, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
