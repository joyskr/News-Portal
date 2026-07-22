import crypto from 'node:crypto';

function base64UrlEncode(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value));
  return buffer.toString('base64url');
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function sign(message, secret) {
  return crypto.createHmac('sha256', secret).update(message).digest('base64url');
}

export function createToken(payload, secret, expiresInSeconds = 7 * 24 * 60 * 60) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const unsigned = `${base64UrlEncode(header)}.${base64UrlEncode(body)}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyToken(token, secret) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) throw new Error('Invalid token.');

  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(unsigned, secret);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new Error('Invalid token signature.');
  }

  const payload = base64UrlDecode(encodedPayload);
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired.');
  }
  return payload;
}
