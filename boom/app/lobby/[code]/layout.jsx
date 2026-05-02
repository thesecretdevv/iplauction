import { createMetadata } from '../../lib/seo';

export const metadata = createMetadata({
  title: 'IPL Auction Lobby',
  description: 'Private IPL auction lobby.',
  path: '/room',
  index: false,
});

export default function LobbyLayout({ children }) {
  return children;
}
