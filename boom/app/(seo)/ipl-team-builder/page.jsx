import '../seo.css';
import SeoLandingPage from '../SeoLandingPage';
import { seoPages } from '../seo-pages';
import { createMetadata } from '../../lib/seo';

const page = seoPages['/ipl-team-builder'];

export const metadata = createMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  canonicalPath: page.canonicalPath,
  index: page.index ?? true,
  keywords: ['ipl team builder', 'fantasy ipl team builder', 'ipl squad builder'],
});

export default function Page() {
  return <SeoLandingPage page={page} />;
}
