/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api';

export default function ArticleGrid({ articles, emptyMessage }) {
  const [token, setToken] = useState(null);
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    const storedToken = localStorage.getItem('newsToken');
    setToken(storedToken);
    if (!storedToken) return;

    fetch(`${API_URL}/api/me/bookmarks`, { headers: { Authorization: `Bearer ${storedToken}` } })
      .then((response) => (response.ok ? response.json() : { articles: [] }))
      .then((data) => setSaved(new Set(data.articles.map((article) => article.id))))
      .catch(() => setSaved(new Set()));
  }, []);

  async function toggleBookmark(articleId) {
    if (!token) return;
    const nextSaved = new Set(saved);
    const shouldRemove = nextSaved.has(articleId);
    if (shouldRemove) nextSaved.delete(articleId);
    else nextSaved.add(articleId);
    setSaved(nextSaved);

    const response = await fetch(`${API_URL}/api/me/bookmarks/${articleId}`, {
      method: shouldRemove ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) setSaved(saved);
  }

  return (
    <section className="grid">
      {articles.length === 0 && <p className="empty">{emptyMessage}</p>}
      {articles.map((article) => (
        <article className="card" key={article.id}>
          {article.image_url && <img src={article.image_url} alt="" />}
          <div>
            <span>{article.category} &middot; {article.source}</span>
            <h2><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h2>
            <p>{article.summary}</p>
            <footer>
              {article.published_at && <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleString()}</time>}
              {token && (
                <button className="save-button" type="button" onClick={() => toggleBookmark(article.id)}>
                  {saved.has(article.id) ? 'Saved' : 'Save'}
                </button>
              )}
            </footer>
          </div>
        </article>
      ))}
    </section>
  );
}
