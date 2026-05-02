import { jsonLd } from '../lib/seo';

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLd(data)}
    />
  );
}
