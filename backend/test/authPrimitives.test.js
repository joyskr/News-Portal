import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from '../src/passwords.js';
import { createToken, verifyToken } from '../src/tokens.js';

test('password hashing verifies correct password and rejects wrong password', async () => {
  const hash = await hashPassword('correct horse battery staple');
  assert.match(hash, /^scrypt:/);
  assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
});

test('token signing verifies payload and rejects tampering', () => {
  const token = createToken({ sub: 123, email: 'reader@example.com' }, 'test-secret', 60);
  assert.equal(verifyToken(token, 'test-secret').sub, 123);

  const parts = token.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ sub: 999, exp: Math.floor(Date.now() / 1000) + 60 })).toString('base64url');
  assert.throws(() => verifyToken(`${parts[0]}.${tamperedPayload}.${parts[2]}`, 'test-secret'), /signature/);
});

test('token verification rejects expired tokens', () => {
  const token = createToken({ sub: 123 }, 'test-secret', -1);
  assert.throws(() => verifyToken(token, 'test-secret'), /expired/);
});
