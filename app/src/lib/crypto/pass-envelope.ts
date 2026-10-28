import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';

// ADR 004: QR pass tokens. Server-only. The database stores the SHA-256 lookup hash and an
// AES-256-GCM envelope; the key lives only in the server environment (PASS_ENCRYPTION_KEY).

export const PASS_KEY_VERSION = 1;

export interface EncryptedPassEnvelope {
  ciphertext: string;
  nonce: string;
  tag: string;
  keyVersion: number;
}

/** Associated data binds an envelope to one pass; a copied envelope fails to decrypt elsewhere. */
export interface PassBinding {
  passId: string;
  participantId: string;
  eventId: string;
}

function resolveKey(keyHex = process.env.PASS_ENCRYPTION_KEY): Buffer {
  if (!keyHex || !/^[0-9a-f]{64}$/i.test(keyHex)) {
    throw new Error('PASS_ENCRYPTION_KEY must be set to 64 hex characters (256-bit key)');
  }
  return Buffer.from(keyHex, 'hex');
}

const aad = (b: PassBinding) => Buffer.from(`${b.passId}|${b.participantId}|${b.eventId}`, 'utf8');

export function generatePassToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashPassToken(token: string): string {
  return createHash('sha256').update(token.trim(), 'utf8').digest('hex');
}

export function encryptPassEnvelope(token: string, binding: PassBinding, keyHex?: string): EncryptedPassEnvelope {
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', resolveKey(keyHex), nonce);
  cipher.setAAD(aad(binding));
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]).toString('hex');
  return { ciphertext, nonce: nonce.toString('hex'), tag: cipher.getAuthTag().toString('hex'), keyVersion: PASS_KEY_VERSION };
}

export function decryptPassEnvelope(envelope: Omit<EncryptedPassEnvelope, 'keyVersion'>, binding: PassBinding, keyHex?: string): string {
  const decipher = createDecipheriv('aes-256-gcm', resolveKey(keyHex), Buffer.from(envelope.nonce, 'hex'));
  decipher.setAAD(aad(binding));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'hex')), decipher.final()]).toString('utf8');
}
