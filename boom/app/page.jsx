import LandingPageClient from './LandingPageClient';
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

import MiniGame from './MiniGame';

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={webApplicationSchema()} />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={faqSchema(coreFaqs)} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }])} />
      
      <div style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#000000",
        color: "#ededed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}>
        <div style={{
          maxWidth: "520px",
          width: "100%",
          textAlign: "left",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#888888",
            marginBottom: "1.5rem",
            border: "1px solid #333",
            padding: "0.3rem 0.75rem",
            borderRadius: "99px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#eab308" }}></div>
            Maintenance
          </div>
          
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "#ffffff",
            marginBottom: "1rem",
          }}>Website is undergoing critical maintenance.</h1>
          
          <p style={{
            fontSize: "1.0625rem",
            color: "#a1a1aa",
            lineHeight: 1.6,
            marginBottom: "2rem",
            fontWeight: 400
          }}>
            Please check back in three hours. We are actively working behind the scenes to bring you a better experience.
          </p>
          
          <div style={{
            borderTop: "1px solid #222",
            padding: "2rem 0 1rem 0",
          }}>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}>
              Keep the game alive
            </h3>
            <p style={{
              fontSize: "0.9375rem",
              color: "#a1a1aa",
              lineHeight: 1.6,
              marginBottom: "1.5rem"
            }}>
              We are adding new features and working hard to maintain continuous uptime. Even a small contribution helps us cover server costs.
              <br/><br/>
              Mention your name while donating, and you'll be featured on our Supporters page with a special badge.
            </p>
            
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="https://onlychai.neocities.org/support?name=iplauction.fun&upi=naga.tum%40ptyes" target="_blank" rel="noopener noreferrer" className="support-btn" style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#eab308", // Yellow for CSK
                color: "#000000",
                textDecoration: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "opacity 0.2s ease",
              }}>
                Support CSK
              </a>
              <a href="https://onlychai.neocities.org/support?name=iplauction.fun&upi=naga.tum%40ptyes" target="_blank" rel="noopener noreferrer" className="support-btn" style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ef4444", // Red for RCB
                color: "#ffffff",
                textDecoration: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "opacity 0.2s ease",
              }}>
                Support RCB
              </a>
              <a href="https://onlychai.neocities.org/support?name=iplauction.fun&upi=naga.tum%40ptyes" target="_blank" rel="noopener noreferrer" className="support-btn" style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff", // White for Other Teams
                color: "#000000",
                textDecoration: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "opacity 0.2s ease",
              }}>
                Support Other Teams
              </a>
            </div>
          </div>

          <MiniGame />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .support-btn:hover {
          opacity: 0.85;
        }
      `}} />
    </>
  );
}
