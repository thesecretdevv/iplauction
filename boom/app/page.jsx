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
            marginBottom: "3rem",
            fontWeight: 400
          }}>
            Please check back in an hour. We are actively working behind the scenes to bring you a better experience.
          </p>
          
          <div style={{
            borderTop: "1px solid #222",
            borderBottom: "1px solid #222",
            padding: "2rem 0",
          }}>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}>
              Support our work
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
            
            <a href="#" className="support-btn" style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              backgroundColor: "#ffffff",
              color: "#000000",
              textDecoration: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "opacity 0.2s ease",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px" }}>
                <path d="M2 21H22V19H2V21ZM20 8H18V5H20V8ZM18 3H6V13C6 14.1046 6.89543 15 8 15H14C15.1046 15 16 14.1046 16 13V3H18C19.1046 3 20 3.89543 20 5V8C20 9.10462 19.1046 10 18 10H16V13C16 15.2091 14.2091 17 12 17H8C5.79086 17 4 15.2091 4 13V3C4 2.44772 4.44772 2 5 2H19C20.6569 2 22 3.34315 22 5V8C22 9.65685 20.6569 11 19 11H18V13C18 16.3137 15.3137 19 12 19H8C4.68629 19 2 16.3137 2 13V3C2 1.89543 2.89543 1 4 1H18V3Z"></path>
              </svg>
              Support Chai
            </a>
          </div>
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
