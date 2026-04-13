export default function sitemap() {
  const baseUrl = 'https://iplauction.fun';
  const now = new Date();

  return [
    '',
    '/how-to-play',
    '/schedule',
    '/teams',
    '/players',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
