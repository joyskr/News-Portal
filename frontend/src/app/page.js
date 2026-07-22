'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ArticleGrid from '../components/ArticleGrid';
import AuthPanel from '../components/AuthPanel';
import { getArticles } from '../lib/api';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['World', 'Business', 'Technology', 'Sports', 'General'];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCategory = params.get('category') || '';
    const nextSearch = params.get('search') || '';
    setCategory(nextCategory);
    setSearch(nextSearch);
    setIsLoading(true);

    getArticles({ category: nextCategory, search: nextSearch })
      .then((data) => setArticles(data.articles || []))
      .finally(() => setIsLoading(false));
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    window.location.href = params.toString() ? `/?${params.toString()}` : '/';
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
        {categories.map((category) => (
          <Link key={category} href={`/?category=${encodeURIComponent(category)}`}>{category}</Link>
        ))}
      </nav>

      {isLoading ? <p className="empty">Loading latest articles...</p> : <ArticleGrid articles={articles} />}
    </main>
  );
}
