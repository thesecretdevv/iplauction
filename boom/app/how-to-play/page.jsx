import HowToPlayClient from './HowToPlayClient';
import { createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'How to Play IPL Auction Simulator - Rules, Purse and Strategy',
  description: 'Learn how to play IPL Auction Simulator with friends, including room setup, bidding rules, purse strategy, scoring, results, and mock auction tips.',
  path: '/how-to-play',
  keywords: [
    'How to play IPL Auction Online',
    'IPL auction online game guide',
    'IPL auction rules',
    'IPL auction bidding strategy',
    'IPL auction room setup',
    'IPL auction points calculation',
    'IPL auction leaderboard',
    'IPL auction results',
    'Mega Auction rules',
    'Mini Auction rules',
    'multiplayer cricket auction game',
    'cricket auction simulator rules',
    'fantasy cricket auction strategy',
  ],
  type: 'article',
});

const faqs = [
  {
    q: 'How do points work in IPL Auction Online?',
    a: 'Each player has an internal rating out of 100. After the auction, the game uses those ratings to score your final Playing XI. Team totals and averages appear in results and leaderboard views.',
  },
  {
    q: 'Are ratings visible during the auction?',
    a: 'No. Ratings are hidden during live bidding to make the auction more strategic and realistic. They are shown after the auction in the results experience.',
  },
  {
    q: 'How many players are needed to start a multiplayer room?',
    a: 'A host can start with 1 active non-spectator player, though the app warns when only one bidder is present.',
  },
  {
    q: 'What happens on the results page?',
    a: 'The results page shows squad strength, purse summary, total team rating, average rating, player-level scores, and the full leaderboard ranking of all teams.',
  },
  {
    q: 'What is the difference between Mega and Mini Auction?',
    a: 'Mega Auction is the broader squad-building mode, while Mini Auction is tighter and more XI-focused, with stricter balance checks in final ranking.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function HowToPlayPage() {
  return <HowToPlayClient faqSchemaJson={JSON.stringify(faqSchema)} />;
}
