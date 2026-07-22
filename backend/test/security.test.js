import assert from 'node:assert/strict';
import test from 'node:test';
import { requireRefreshToken } from '../src/security.js';

function runMiddleware(headers = {}, env = {}) {
  const previousToken = process.env.REFRESH_TOKEN;
  const previousNodeEnv = process.env.NODE_ENV;
  if (env.REFRESH_TOKEN === undefined) delete process.env.REFRESH_TOKEN;
  else process.env.REFRESH_TOKEN = env.REFRESH_TOKEN;
  if (env.NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = env.NODE_ENV;

  let error;
  requireRefreshToken({ headers }, {}, (nextError) => {
    error = nextError;
  });

  if (previousToken === undefined) delete process.env.REFRESH_TOKEN;
  else process.env.REFRESH_TOKEN = previousToken;
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  return error;
}

test('manual refresh is open only for non-production without configured token', () => {
  assert.equal(runMiddleware({}, { NODE_ENV: 'development', REFRESH_TOKEN: '' }), undefined);
  assert.equal(runMiddleware({}, { NODE_ENV: 'production', REFRESH_TOKEN: '' }).status, 401);
});

test('manual refresh requires matching configured token', () => {
  assert.equal(runMiddleware({ 'x-refresh-token': 'secret' }, { NODE_ENV: 'production', REFRESH_TOKEN: 'secret' }), undefined);
  assert.equal(runMiddleware({ 'x-refresh-token': 'wrong' }, { NODE_ENV: 'production', REFRESH_TOKEN: 'secret' }).status, 401);
});
