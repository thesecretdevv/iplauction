import players from './data/Players.json';
import { SQUADS } from './data/squads';
import { seoPages } from './(seo)/seo-pages';
import { SITE_URL, slugify } from './lib/seo';

export default function sitemap() {
  const lastModified = new Date();
  const staticRoutes = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/how-to-play', changeFrequency: 'monthly', priority: 0.82 },
    { path: '/schedule', changeFrequency: 'daily', priority: 0.78 },
    { path: '/teams', changeFrequency: 'weekly', priority: 0.82 },
    { path: '/players', changeFrequency: 'weekly', priority: 0.82 },
  ];
  const seoRoutes = Object.values(seoPages)
    .filter((page) => page.index !== false)
    .map((page) => ({
      path: page.path,
      changeFrequency: page.path === '/ipl-auction-simulator' ? 'weekly' : 'monthly',
      priority: page.path === '/ipl-auction-simulator' ? 0.95 : 0.8,
    }));

  const teamRoutes = SQUADS.map((team) => ({
    path: `/teams/${slugify(team.name)}`,
    changeFrequency: 'weekly',
    priority: 0.72,
  }));

  const playerRoutes = players.slice(0, 250).map((player) => ({
    path: `/players/${slugify(player.name)}`,
    changeFrequency: 'monthly',
    priority: 0.58,
  }));

  return [...staticRoutes, ...seoRoutes, ...teamRoutes, ...playerRoutes].map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
