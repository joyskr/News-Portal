export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const isApiConfigured = Boolean(API_URL);

export async function getArticles(params = {}) {
  if (!isApiConfigured) {
    return {
      articles: [],
      error: 'The frontend is missing NEXT_PUBLIC_API_URL. Set it to the deployed backend URL in Netlify and redeploy.',
    };
  }

  const url = new URL('/api/articles', API_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        articles: [],
        error: `The news API returned ${response.status}. Check the backend deployment and CORS settings.`,
      };
    }
    return response.json();
  } catch (error) {
    console.warn(`Unable to fetch articles from ${url}:`, error.message);
    return {
      articles: [],
      error: `Unable to reach the news API at ${API_URL}. Check NEXT_PUBLIC_API_URL and backend CORS settings.`,
    };
  }
}

export async function getArticleCategories() {
  const data = await getArticles({ limit: 100 });
  if (data.error) return { categories: [], error: data.error };

  const categories = [...new Set((data.articles || []).map((article) => article.category).filter(Boolean))];
  return { categories };
}
