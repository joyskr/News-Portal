export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getArticles(params = {}) {
  const url = new URL('/api/articles', API_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return { articles: [] };
  return response.json();
}
