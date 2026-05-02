import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'Create or Join IPL Auction Rooms - Multiplayer Auction Game',
  description: 'Create a private IPL auction room, join with a code, or browse public live auction rooms for multiplayer IPL bidding.',
  path: '/room',
  keywords: ['ipl auction room', 'private auction room', 'ipl auction with friends'],
  index: false,
});

export default function RoomLayout({ children }) {
  return children;
}
