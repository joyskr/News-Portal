import ArticleGrid from '../components/ArticleGrid';
import AuthPanel from '../components/AuthPanel';
import { getArticles } from '../lib/api';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const { articles } = await getArticles({ category: params?.category, search: params?.search });
  const categories = ['World', 'Business', 'Technology', 'Sports', 'General'];

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Self-updating news portal</p>
          <h1>Latest headlines from trusted RSS sources.</h1>
          <p>Browse freely without an account. Registration is optional for future personalization features.</p>
          <form className="search" action="/">
            <input name="search" placeholder="Search headlines" defaultValue={params?.search || ''} />
            <button>Search</button>
          </form>
        </div>
        <AuthPanel />
      </section>

      <nav className="categories">
        <a href="/">All</a>
        {categories.map((category) => (
          <a key={category} href={`/?category=${encodeURIComponent(category)}`}>{category}</a>
        ))}
      </nav>

      <ArticleGrid articles={articles} />
    </main>
  );
}
