import '../seo.css';
import SeoLandingPage from '../SeoLandingPage';
import { seoPages } from '../seo-pages';
import { createMetadata } from '../../lib/seo';

const page = seoPages['/ipl-auction-purse-calculator'];

export const metadata = createMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  canonicalPath: page.canonicalPath,
  index: page.index ?? true,
  keywords: ['ipl auction purse calculator', 'ipl auction budget', 'ipl purse strategy'],
});

export default function Page() {
  return <SeoLandingPage page={page} />;
}
