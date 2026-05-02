import { SITE_URL } from './lib/seo';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/ad',
          '/api/',
          '/auction',
          '/join/',
          '/lobby/',
          '/mode',
          '/play-mode',
          '/results',
          '/team-select',
          '/room?action=',
          '/*?action=',
          '/*?code=',
          '/*?team=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
