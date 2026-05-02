import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'IPL Teams 2026 - Franchises, Squads, Captains and Coaches',
  description: 'Browse IPL teams, franchise squads, captains, coaches, home grounds, and team details before playing the IPL Auction Simulator.',
  path: '/teams',
  keywords: ['ipl teams', 'ipl franchises', 'ipl squads'],
});

export default function TeamsLayout({ children }) {
  return children;
}
