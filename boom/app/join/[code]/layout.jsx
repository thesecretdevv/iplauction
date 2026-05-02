import { createMetadata } from '../../lib/seo';

export const metadata = createMetadata({
  title: 'Join IPL Auction Room',
  description: 'Join a private IPL auction room by code.',
  path: '/room',
  index: false,
});

export default function JoinLayout({ children }) {
  return children;
}
