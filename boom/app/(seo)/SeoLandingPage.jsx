import Link from 'next/link';
import JsonLd from '../components/JsonLd';
import { breadcrumbSchema, coreFaqs, faqSchema } from '../lib/seo';

const sharedLinks = [
  ['Create an auction room', '/room?action=create'],
  ['Browse IPL players', '/players'],
  ['View IPL teams', '/teams'],
  ['Read auction rules', '/ipl-auction-rules'],
  ['Practice purse strategy', '/ipl-auction-purse-calculator'],
  ['Build an IPL team', '/ipl-team-builder'],
];

export default function SeoLandingPage({ page }) {
  return (
    <main className="seo-page">
      <JsonLd data={faqSchema(page.faqs || coreFaqs)} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: page.title, path: page.path }])} />

      <section className="seo-hero">
        <p className="seo-kicker">{page.kicker}</p>
        <h1>{page.h1}</h1>
        <p>{page.intro}</p>
        <div className="seo-actions">
          <Link href="/room?action=create">Start Free Auction</Link>
          <Link href="/how-to-play">How to Play</Link>
        </div>
      </section>

      <section className="seo-band">
        <div className="seo-grid">
          {page.features.map((feature) => (
            <article key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-content">
        <div>
          <h2>{page.whyTitle}</h2>
          {page.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside>
          <h2>Explore IPL auction tools</h2>
          <nav>
            {sharedLinks.map(([label, href]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </aside>
      </section>

      <section className="seo-faq">
        <h2>IPL Auction Simulator FAQs</h2>
        {coreFaqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
