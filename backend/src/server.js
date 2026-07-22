import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createToken, loginUser, optionalAuth, registerUser, requireAuth } from './auth.js';
import { migrate } from './db.js';
import { listArticles, listBookmarks, refreshNews, removeBookmark, saveBookmark } from './news.js';
import { requireRefreshToken } from './security.js';

const app = express();
const port = process.env.PORT || 8080;

const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  if (configuredOrigins.includes(normalizedOrigin)) return true;

  try {
    const { hostname } = new URL(normalizedOrigin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(optionalAuth);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/articles', async (req, res, next) => {
  try {
    const articles = await listArticles(req.query);
    res.json({ articles, user: req.user || null });
  } catch (error) {
    next(error);
  }
});

app.post('/api/refresh', requireRefreshToken, async (_req, res, next) => {
  try {
    res.json(await refreshNews());
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === '23505') error.status = 409;
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const user = await loginUser(req.body);
    res.json({ user, token: createToken(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/me/bookmarks', requireAuth, async (req, res, next) => {
  try {
    res.json({ articles: await listBookmarks(req.user.sub) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/me/bookmarks/:articleId', requireAuth, async (req, res, next) => {
  try {
    await saveBookmark(req.user.sub, req.params.articleId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete('/api/me/bookmarks/:articleId', requireAuth, async (req, res, next) => {
  try {
    await removeBookmark(req.user.sub, req.params.articleId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({ error: error.message || 'Server error' });
});

await migrate();
await refreshNews();
setInterval(refreshNews, Number(process.env.NEWS_REFRESH_MINUTES || 20) * 60 * 1000);

app.listen(port, () => console.log(`News API listening on ${port}`));
