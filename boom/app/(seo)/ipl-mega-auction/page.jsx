import '../seo.css';
import SeoLandingPage from '../SeoLandingPage';
import { seoPages } from '../seo-pages';
import { createMetadata } from '../../lib/seo';

const page = seoPages['/ipl-mega-auction'];

export const metadata = createMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  canonicalPath: page.canonicalPath,
  index: page.index ?? true,
  keywords: ['ipl mega auction', 'ipl mega auction simulator', 'mega auction game'],
});

export default function Page() {
  return <SeoLandingPage page={page} />;
}
