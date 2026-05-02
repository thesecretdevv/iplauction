import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'IPL Players List - Auction Pool, Roles and Base Prices',
  description: 'Explore the IPL auction player list with searchable batters, bowlers, wicketkeepers, all-rounders, countries, teams, and base prices.',
  path: '/players',
  keywords: ['ipl players list', 'ipl auction player pool', 'ipl player base price'],
});

export default function PlayersLayout({ children }) {
  return children;
}
