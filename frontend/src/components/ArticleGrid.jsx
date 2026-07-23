/* eslint-disable @next/next/no-img-element */
'use client';

import { Fragment, useEffect, useState } from 'react';
import { API_URL } from '../lib/api';

function storedJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export default function ArticleGrid({ articles, emptyMessage }) {
  const [token, setToken] = useState(null);
  const [saved, setSaved] = useState(new Set());
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [reactions, setReactions] = useState({});
  const [comments, setComments] = useState({});
  const [commentDraft, setCommentDraft] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('newsToken');
    setToken(storedToken);
    setReactions(storedJson('articleReactions', {}));
    setComments(storedJson('articleComments', {}));
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

  function react(articleId, value) {
    const nextReactions = { ...reactions, [articleId]: value };
    setReactions(nextReactions);
    localStorage.setItem('articleReactions', JSON.stringify(nextReactions));
  }

  function submitComment(event) {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text || !selectedArticle) return;

    const articleComments = comments[selectedArticle.id] || [];
    const nextComments = {
      ...comments,
      [selectedArticle.id]: [...articleComments, { text, createdAt: new Date().toISOString() }],
    };
    setComments(nextComments);
    localStorage.setItem('articleComments', JSON.stringify(nextComments));
    setCommentDraft('');
  }

  async function shareArticle(article) {
    const shareData = { title: article.title, text: article.summary, url: article.url };
    setShareMessage('');
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(article.url);
    setShareMessage('Link copied');
  }

  function openReader(article) {
    setSelectedArticle(article);
    setCommentDraft('');
    setShareMessage('');
  }

  function closeReader() {
    setSelectedArticle(null);
  }

  return (
    <>
      <section className="grid">
        {articles.length === 0 && <p className="empty">{emptyMessage}</p>}
        {articles.map((article, index) => (
          <Fragment key={article.id}>
            <article className="card">
              {article.image_url && <img src={article.image_url} alt="" />}
              <div>
                <span>{article.category} &middot; {article.source}</span>
                <h2>
                  <button className="headline-button" type="button" onClick={() => openReader(article)}>
                    {article.title}
                  </button>
                </h2>
                <p>{article.summary}</p>
                <footer>
                  {article.published_at && <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleString()}</time>}
                  <button className="save-button" type="button" onClick={() => openReader(article)}>Read</button>
                </footer>
              </div>
            </article>
            {index === 5 && (
              <aside className="ad-slot ad-inline" aria-label="Advertisement">
                <span>Advertisement</span>
                <strong>Sponsored placement</strong>
              </aside>
            )}
          </Fragment>
        ))}
      </section>

      {selectedArticle && (
        <div className="reader-backdrop" role="presentation" onMouseDown={closeReader}>
          <article className="reader-panel" role="dialog" aria-modal="true" aria-label={selectedArticle.title} onMouseDown={(event) => event.stopPropagation()}>
            <header className="reader-header">
              <div>
                <p className="eyebrow">{selectedArticle.category} &middot; {selectedArticle.source}</p>
                <h2>{selectedArticle.title}</h2>
                {selectedArticle.published_at && <time dateTime={selectedArticle.published_at}>{new Date(selectedArticle.published_at).toLocaleString()}</time>}
              </div>
              <button className="icon-button" type="button" onClick={closeReader} aria-label="Close article">X</button>
            </header>

            <div className="reader-layout">
              <div className="reader-content">
                {selectedArticle.image_url && <img className="reader-image" src={selectedArticle.image_url} alt="" />}
                <p className="reader-summary">{selectedArticle.summary || 'No summary is available for this article.'}</p>
                <a className="source-link" href={selectedArticle.url} target="_blank" rel="noreferrer">Open original source</a>

                <div className="engagement-bar">
                  <button className={reactions[selectedArticle.id] === 'like' ? 'active' : ''} type="button" onClick={() => react(selectedArticle.id, 'like')}>Like</button>
                  <button className={reactions[selectedArticle.id] === 'dislike' ? 'active' : ''} type="button" onClick={() => react(selectedArticle.id, 'dislike')}>Dislike</button>
                  <button type="button" onClick={() => shareArticle(selectedArticle)}>Share</button>
                  {token && (
                    <button type="button" onClick={() => toggleBookmark(selectedArticle.id)}>
                      {saved.has(selectedArticle.id) ? 'Saved' : 'Save'}
                    </button>
                  )}
                </div>
                {shareMessage && <p className="share-message">{shareMessage}</p>}

                <section className="comments">
                  <h3>Comments</h3>
                  <form onSubmit={submitComment}>
                    <textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add a comment" rows="3" />
                    <button type="submit">Post comment</button>
                  </form>
                  {(comments[selectedArticle.id] || []).map((comment) => (
                    <p className="comment" key={`${comment.createdAt}-${comment.text}`}>{comment.text}</p>
                  ))}
                </section>
              </div>

              <aside className="reader-ads">
                <div className="ad-slot ad-board" aria-label="Advertisement">
                  <span>Advertisement</span>
                  <strong>Reader sponsor</strong>
                </div>
                <div className="ad-slot ad-board" aria-label="Advertisement">
                  <span>Advertisement</span>
                  <strong>Market update</strong>
                </div>
              </aside>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
