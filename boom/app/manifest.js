import { SITE_URL } from './lib/seo';

export default function manifest() {
  return {
    name: 'IPL Auction Simulator',
    short_name: 'IPL Auction',
    description: 'Play a free IPL auction simulator online with friends.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#E8B84B',
    categories: ['games', 'sports', 'entertainment'],
    lang: 'en-IN',
    id: SITE_URL,
    icons: [
      {
        src: '/assets/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
