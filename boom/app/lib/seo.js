export const SITE_URL = 'https://www.iplauction.fun';
export const SITE_NAME = 'IPL Auction Simulator';
export const DEFAULT_OG_IMAGE = '/assets/Hero_players.png';

export const primaryKeywords = [
  'IPL Auction Simulator',
  'IPL Auction Game',
  'Mock IPL Auction',
  'IPL Auction With Friends',
  'IPL Auction Online',
  'IPL Bidding Simulator',
  'IPL Mega Auction Simulator',
];

export function absoluteUrl(path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createMetadata({
  title,
  description,
  path = '/',
  canonicalPath,
  keywords = [],
  index = true,
  type = 'website',
}) {
  const url = absoluteUrl(path);
  const canonicalUrl = absoluteUrl(canonicalPath || path);

  return {
    title,
    description,
    keywords: [...primaryKeywords, ...keywords],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 669,
          alt: 'IPL Auction Simulator multiplayer auction table and player cards',
        },
      ],
      locale: 'en_IN',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export function jsonLd(data) {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/assets/favicon.png'),
    sameAs: [SITE_URL],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-IN',
    description: 'Free IPL auction simulator for mock IPL auctions, multiplayer auction rooms, real-time bidding, purse strategy, and fantasy team building.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/players?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript and a modern web browser',
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description: 'Play a free IPL auction simulator online with friends. Create rooms, bid in real time, manage purse strategy, and build a fantasy IPL squad.',
    keywords: primaryKeywords.join(', '),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export const coreFaqs = [
  {
    question: 'How to play IPL auction with friends?',
    answer: 'Create a private auction room, choose the auction mode, share the room code with friends, select franchises, and start bidding. Each team uses a limited purse, so managers must balance star players, role coverage, and squad depth.',
  },
  {
    question: 'What is the best IPL auction simulator?',
    answer: 'IPL Auction Simulator at iplauction.fun is built for fast multiplayer mock auctions with private rooms, real-time bidding, IPL-style purses, player pools, team pages, and post-auction squad results.',
  },
  {
    question: 'How does IPL auction purse work?',
    answer: 'Every franchise starts with a fixed auction purse. Each winning bid reduces the remaining budget, so every team must decide when to spend big and when to save money for later players and squad balance.',
  },
];
