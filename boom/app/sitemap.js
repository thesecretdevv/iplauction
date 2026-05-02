import players from './data/Players.json';
import { SQUADS } from './data/squads';
import { SITE_URL, slugify } from './lib/seo';

export default function sitemap() {
  const lastModified = new Date();
  const staticRoutes = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/ipl-auction-simulator', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/play-ipl-auction-online', changeFrequency: 'weekly', priority: 0.92 },
    { path: '/ipl-auction-with-friends', changeFrequency: 'weekly', priority: 0.92 },
    { path: '/mock-ipl-auction', changeFrequency: 'weekly', priority: 0.92 },
    { path: '/ipl-mega-auction', changeFrequency: 'weekly', priority: 0.88 },
    { path: '/ipl-auction-rules', changeFrequency: 'monthly', priority: 0.86 },
    { path: '/ipl-auction-purse-calculator', changeFrequency: 'monthly', priority: 0.84 },
    { path: '/ipl-team-builder', changeFrequency: 'monthly', priority: 0.84 },
    { path: '/ipl-player-list', changeFrequency: 'weekly', priority: 0.86 },
    { path: '/how-to-play', changeFrequency: 'monthly', priority: 0.82 },
    { path: '/schedule', changeFrequency: 'daily', priority: 0.78 },
    { path: '/teams', changeFrequency: 'weekly', priority: 0.82 },
    { path: '/players', changeFrequency: 'weekly', priority: 0.82 },
  ];

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

  return [...staticRoutes, ...teamRoutes, ...playerRoutes].map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
