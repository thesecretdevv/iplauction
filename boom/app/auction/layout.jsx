import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'Live IPL Auction Room',
  description: 'Live private IPL auction gameplay room.',
  path: '/auction',
  index: false,
});

export default function AuctionLayout({ children }) {
  return children;
}
