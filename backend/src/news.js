import Parser from 'rss-parser';
import { query } from './db.js';
import { categoryFor, feedUrls, imageFrom, truncate } from './newsUtils.js';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'NewsPortalBot/1.0 (+https://example.com)' },
});

export async function refreshNews() {
  const feeds = feedUrls();
  const saved = [];
  const failures = [];

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      const source = feed.title || new URL(url).hostname;
      const category = categoryFor(feed.title);

      for (const item of feed.items.slice(0, 25)) {
        if (!item.title || !item.link) continue;
        const result = await query(
          `INSERT INTO articles (title, summary, url, source, image_url, category, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (url) DO UPDATE SET
             title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             image_url = COALESCE(EXCLUDED.image_url, articles.image_url),
             published_at = COALESCE(EXCLUDED.published_at, articles.published_at)
           RETURNING id`,
          [
            truncate(item.title, 220),
            truncate(item.contentSnippet || item.summary || item.content || ''),
            item.link,
            truncate(source, 120),
            imageFrom(item),
            category,
            item.isoDate || item.pubDate || null,
          ]
        );
        if (result.rowCount) saved.push(result.rows[0].id);
      }
    } catch (error) {
      failures.push({ feed: url, reason: error.message });
      console.warn(`Failed to refresh ${url}:`, error.message);
    }
  }

  return { feeds: feeds.length, upserted: saved.length, failures };
}

export async function listArticles({ category, search, limit = 30 }) {
  const params = [];
  const where = [];

  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(title ILIKE $${params.length} OR summary ILIKE $${params.length})`);
  }
  params.push(Math.min(Number(limit) || 30, 100));

  const sql = `SELECT id, title, summary, url, source, image_url, category, published_at
               FROM articles
               ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY published_at DESC NULLS LAST, created_at DESC
               LIMIT $${params.length}`;
  return (await query(sql, params)).rows;
}

export async function listBookmarks(userId) {
  const result = await query(
    `SELECT a.id, a.title, a.summary, a.url, a.source, a.image_url, a.category, a.published_at, b.created_at AS bookmarked_at
     FROM bookmarks b
     JOIN articles a ON a.id = b.article_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function saveBookmark(userId, articleId) {
  await query('INSERT INTO bookmarks (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, articleId]);
}

export async function removeBookmark(userId, articleId) {
  await query('DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2', [userId, articleId]);
}
