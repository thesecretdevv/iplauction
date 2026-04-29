import HowToPlayClient from './HowToPlayClient';

export const metadata = {
  title: 'How to Play IPL Auction Online | Rules, Scoring, Results & Strategy',
  description: 'Learn how to play IPL Auction Online with full auction rules, bidding strategy, scoring system, leaderboard logic, room setup, Mega Auction and Mini Auction tips.',
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
  alternates: {
    canonical: '/how-to-play',
  },
  openGraph: {
    title: 'How to Play IPL Auction Online',
    description: 'Complete IPL auction simulator guide covering auction rules, room setup, bidding strategy, scoring system, results breakdown, leaderboard logic, and winning tips.',
    url: 'https://iplauction.fun/how-to-play',
    siteName: 'IPL Auction Online',
    images: [
      {
        url: '/assets/favicon.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Play IPL Auction Online',
    description: 'IPL auction rules, bidding strategy, scoring system, results breakdown, leaderboard logic, and room setup tips.',
    images: ['/assets/og-image.png'],
  },
};

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
