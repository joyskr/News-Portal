import { query } from './db.js';
import { hashPassword, verifyPassword } from './passwords.js';
import { createToken as signToken, verifyToken } from './tokens.js';

const tokenSecret = () => process.env.JWT_SECRET || 'development-secret-change-me';
const publicUserFields = 'id, name, email, created_at';

export function createToken(user) {
  return signToken({ sub: user.id, email: user.email, name: user.name }, tokenSecret());
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!name?.trim() || !normalizedEmail || !password || password.length < 8) {
    const error = new Error('Name, email, and an 8+ character password are required.');
    error.status = 400;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${publicUserFields}`,
    [name.trim(), normalizedEmail, passwordHash]
  );
  return result.rows[0];
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();
  const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password || '', user.password_hash))) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice(7), tokenSecret());
    } catch {
      req.user = null;
    }
  }
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user?.sub) {
    const error = new Error('Sign in to use this feature.');
    error.status = 401;
    next(error);
    return;
  }
  next();
}
