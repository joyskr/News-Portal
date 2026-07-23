'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ArticleGrid from '../components/ArticleGrid';
import AuthPanel from '../components/AuthPanel';
import { getArticleCategories, getArticles } from '../lib/api';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCategory = params.get('category') || '';
    const nextSearch = params.get('search') || '';
    setCategory(nextCategory);
    setSearch(nextSearch);
    setIsLoading(true);
    setError('');

    getArticles({ category: nextCategory, search: nextSearch })
      .then((data) => {
        setArticles(data.articles || []);
        setError(data.error || '');
      })
      .finally(() => setIsLoading(false));

    getArticleCategories().then((data) => {
      if (!data.error) setCategories(data.categories);
    });
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    window.location.href = params.toString() ? `/?${params.toString()}` : '/';
  }

  function reloadCategory(event, href) {
    event.preventDefault();
    window.location.href = href;
  }

  function emptyMessage() {
    if (category || search) {
      return 'No articles match this filter. Choose All or try a different search.';
    }
    return 'No articles yet. Trigger /api/refresh on the backend after configuring RSS feeds.';
  }

  return (
    <main>
      <header className="topbar">
        <Link className="brand" href="/">Open News Portal</Link>
        <button className="auth-trigger" type="button" onClick={() => setIsAuthOpen(true)}>
          Login / Register
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Self-updating news portal</p>
          <h1>News organized for quick reading.</h1>
          <form className="search" action="/" onSubmit={submitSearch}>
            <input name="search" placeholder="Search headlines" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button>Search</button>
          </form>
        </div>
        <aside className="ad-slot ad-rail" aria-label="Advertisement">
          <span>Advertisement</span>
          <strong>Brand message</strong>
        </aside>
      </section>

      <nav className="categories">
        <Link href="/" onClick={(event) => reloadCategory(event, '/')}>All</Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={`/?category=${encodeURIComponent(item)}`}
            onClick={(event) => reloadCategory(event, `/?category=${encodeURIComponent(item)}`)}
          >
            {item}
          </Link>
        ))}
      </nav>

      <aside className="ad-slot ad-leaderboard" aria-label="Advertisement">
        <span>Advertisement</span>
        <strong>Premium sponsor space</strong>
      </aside>

      {isLoading && <p className="empty">Loading latest articles...</p>}
      {!isLoading && error && <p className="empty error">{error}</p>}
      {!isLoading && !error && <ArticleGrid articles={articles} emptyMessage={emptyMessage()} />}
      {isAuthOpen && <AuthPanel onClose={() => setIsAuthOpen(false)} />}
    </main>
  );
}
