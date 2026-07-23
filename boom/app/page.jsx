import MaintenanceClient from './MaintenanceClient';
import JsonLd from './components/JsonLd';
import {
  breadcrumbSchema,
  coreFaqs,
  createMetadata,
  faqSchema,
  organizationSchema,
  webApplicationSchema,
  websiteSchema,
} from './lib/seo';

export const metadata = createMetadata({
  title: 'IPL Auction Simulator - Play IPL Mega Auction Online with Friends',
  description: 'Play a free IPL Auction Simulator online with friends. Create mock IPL auction rooms, bid in real time, manage your purse, and build a fantasy IPL squad.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={webApplicationSchema()} />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={faqSchema(coreFaqs)} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }])} />
      <MaintenanceClient />
    </>
  );
}
