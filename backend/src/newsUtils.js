export function feedUrls(value = process.env.RSS_FEEDS || '') {
  return value.split(',').map((feed) => feed.trim()).filter(Boolean);
}

export function categoryFor(feedTitle = '') {
  const title = feedTitle.toLowerCase();
  if (title.includes('technology') || title.includes('tech')) return 'Technology';
  if (title.includes('business') || title.includes('finance')) return 'Business';
  if (title.includes('sport')) return 'Sports';
  if (title.includes('world') || title.includes('international')) return 'World';
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
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
