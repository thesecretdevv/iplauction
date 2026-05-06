import '../seo.css';
import SeoLandingPage from '../SeoLandingPage';
import { seoPages } from '../seo-pages';
import { createMetadata } from '../../lib/seo';

const page = seoPages['/mock-ipl-auction'];

export const metadata = createMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  canonicalPath: page.canonicalPath,
  index: page.index ?? true,
  keywords: ['mock ipl auction', 'fantasy ipl auction', 'ipl auction practice'],
});

export default function Page() {
  return <SeoLandingPage page={page} />;
}
