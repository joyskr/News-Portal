export const DEFAULT_RSS_FEEDS = [
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.sciencedaily.com/rss/top/science.xml',
];

export function feedUrls(value = process.env.RSS_FEEDS || '', { includeDefaults = true } = {}) {
  const configuredFeeds = value.split(',').map((feed) => feed.trim()).filter(Boolean);
  const feeds = includeDefaults ? [...configuredFeeds, ...DEFAULT_RSS_FEEDS] : configuredFeeds;
  return [...new Set(feeds)];
}

export function categoryFor(feedTitle = '', feedUrl = '') {
  const source = `${feedTitle} ${feedUrl}`.toLowerCase();
  if (source.includes('artificial-intelligence') || source.includes('machine-learning') || /\bai\b/.test(source)) return 'AI';
  if (source.includes('science') || source.includes('environment') || source.includes('nasa')) return 'Science';
  if (source.includes('technology') || source.includes('tech')) return 'Technology';
  if (source.includes('business') || source.includes('finance')) return 'Business';
  if (source.includes('sport')) return 'Sports';
  if (source.includes('world') || source.includes('international')) return 'World';
  return 'General';
}

export function mediaUrl(media) {
  const value = Array.isArray(media) ? media[0] : media;
  return value?.url || value?.$.url || null;
}

export function imageFrom(item) {
  return item.enclosure?.url || mediaUrl(item['media:content']) || mediaUrl(item['media:thumbnail']);
}

export function truncate(text = '', max = 500) {
  const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}
