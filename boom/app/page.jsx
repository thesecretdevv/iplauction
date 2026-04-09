import LandingPageClient from './LandingPageClient';

export const metadata = {
  title: 'IPL Auction Online Game | Play Live Cricket Auction Online',
  description: 'Play IPL Auction Online, the live cricket auction game where you create rooms, bid in real time, build your franchise, and assemble your dream IPL squad.',
  alternates: {
    canonical: '/',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'IPL Auction Online',
  url: 'https://iplauction.fun',
  description: 'Live IPL auction game with multiplayer rooms, real-time bidding, private room codes, and full franchise squad building.',
  inLanguage: 'en-IN',
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IPL Auction Online',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  url: 'https://iplauction.fun',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  description: 'IPL Auction Online is a live cricket auction simulator where you create rooms, join private auctions, bid on players, and build your IPL franchise online.',
  keywords: 'ipl auction game, ipl auction online, cricket auction online, live auction rooms, private auction room',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <LandingPageClient />
    </>
  );
}
