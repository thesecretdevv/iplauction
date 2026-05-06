import '../seo.css';
import SeoLandingPage from '../SeoLandingPage';
import { seoPages } from '../seo-pages';
import { createMetadata } from '../../lib/seo';

const page = seoPages['/ipl-auction-simulator'];

export const metadata = createMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  canonicalPath: page.canonicalPath,
  index: page.index ?? true,
  keywords: ['ipl auction simulator', 'ipl mega auction simulator', 'ipl bidding simulator'],
});

export default function Page() {
  return <SeoLandingPage page={page} />;
}
