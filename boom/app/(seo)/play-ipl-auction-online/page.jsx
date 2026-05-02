import '../seo.css';
import SeoLandingPage from '../SeoLandingPage';
import { seoPages } from '../seo-pages';
import { createMetadata } from '../../lib/seo';

const page = seoPages['/play-ipl-auction-online'];

export const metadata = createMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  keywords: ['play ipl auction online', 'ipl auction online', 'ipl auction game'],
});

export default function Page() {
  return <SeoLandingPage page={page} />;
}
