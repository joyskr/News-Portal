import crypto from 'node:crypto';

const keyLength = 64;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt);
  return `scrypt:${salt}:${derivedKey}`;
}

export async function verifyPassword(password, passwordHash = '') {
  const [algorithm, salt, storedKey] = passwordHash.split(':');
  if (algorithm !== 'scrypt' || !salt || !storedKey) return false;
  const derivedKey = await scrypt(password, salt);
  return timingSafeEqual(storedKey, derivedKey);
}

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey.toString('hex'));
    });
  });
}

function timingSafeEqual(a, b) {
  const first = Buffer.from(a, 'hex');
  const second = Buffer.from(b, 'hex');
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}
