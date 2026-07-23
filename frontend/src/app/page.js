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

  function emptyMessage() {
    if (category || search) {
      return 'No articles match this filter. Choose All or try a different search.';
    }
    return 'No articles yet. Trigger /api/refresh on the backend after configuring RSS feeds.';
  }

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Self-updating news portal</p>
          <h1>Latest headlines from trusted RSS sources.</h1>
          <p>Browse freely without an account. Registration is optional for future personalization features.</p>
          <form className="search" action="/" onSubmit={submitSearch}>
            <input name="search" placeholder="Search headlines" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button>Search</button>
          </form>
        </div>
        <AuthPanel />
      </section>

      <nav className="categories">
        <Link href="/">All</Link>
        {categories.map((item) => (
          <Link key={item} href={`/?category=${encodeURIComponent(item)}`}>{item}</Link>
        ))}
      </nav>

      <aside className="ad-slot ad-leaderboard" aria-label="Advertisement">
        <span>Advertisement</span>
        <strong>Premium sponsor space</strong>
      </aside>

      {isLoading && <p className="empty">Loading latest articles...</p>}
      {!isLoading && error && <p className="empty error">{error}</p>}
      {!isLoading && !error && <ArticleGrid articles={articles} emptyMessage={emptyMessage()} />}
    </main>
  );
}
