import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'IPL Schedule and Auction Windows - Play Daily Auction Rooms',
  description: 'Check IPL schedule-inspired auction windows, Rivals mode matchups, and live IPL Auction Simulator rooms.',
  path: '/schedule',
  keywords: ['ipl schedule', 'daily ipl auction', 'ipl rivals mode'],
});

export default function ScheduleLayout({ children }) {
  return children;
}
