import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'IPL Auction Results',
  description: 'Private IPL auction results and squad rankings.',
  path: '/results',
  index: false,
});

export default function ResultsLayout({ children }) {
  return children;
}
