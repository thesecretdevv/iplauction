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
        fontFamily: "'Inter', sans-serif",
        background: "#0f172a",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background glow effects */}
        <div style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)",
          top: "-200px",
          left: "-200px",
          borderRadius: "50%",
          zIndex: 0
        }}></div>
        <div style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(0,0,0,0) 70%)",
          bottom: "-100px",
          right: "-100px",
          borderRadius: "50%",
          zIndex: 0
        }}></div>
        
        <div style={{
          maxWidth: "650px",
          background: "rgba(30, 41, 59, 0.7)",
          padding: "3rem",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 1,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          animation: "fadeUp 0.8s ease-out forwards"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#fca5a5",
            padding: "0.35rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            <span style={{
              display: "block",
              width: "8px",
              height: "8px",
              background: "#ef4444",
              borderRadius: "50%",
              boxShadow: "0 0 8px #ef4444",
              animation: "pulse 2s infinite"
            }}></span>
            Important Notice
          </div>
          
          <div style={{
            fontSize: "4rem",
            marginBottom: "1.5rem",
            display: "inline-block",
            animation: "float 3s ease-in-out infinite"
          }}>🛠️</div>
          
          <h1 style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Website is undergoing some critical maintenance</h1>
          
          <p style={{
            color: "#94a3b8",
            fontSize: "1.125rem",
            lineHeight: 1.6,
            marginBottom: "2rem"
          }}>Please check back in an hour. We appreciate your patience while we make things better.</p>
          
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "2.5rem",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              background: "linear-gradient(to bottom, #6366f1, #ec4899)"
            }}></div>
            <h3 style={{
              fontSize: "1.25rem",
              color: "#e2e8f0",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>☕ Support Our Work</h3>
            <p style={{
              fontSize: "0.95rem",
              marginBottom: 0,
              color: "#cbd5e1",
              lineHeight: 1.7
            }}>
              We are adding up new features, maintaining continuous uptime, and working hard on maintaining our servers. 
              Even a small amount helps us contribute to these efforts!
              <br/><br/>
              <strong>Don't forget:</strong> Mention your name while donating, and you'll be added to our Supporters page later with an exclusive <span style={{
                color: "#f472b6",
                fontWeight: 600,
                background: "rgba(244, 114, 182, 0.1)",
                padding: "0.15rem 0.4rem",
                borderRadius: "4px"
              }}>Supporter Badge!</span>
            </p>
          </div>

          <a href="#" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
            color: "white",
            textDecoration: "none",
            padding: "1rem 2.5rem",
            borderRadius: "12px",
            fontSize: "1.125rem",
            fontWeight: 600,
            transition: "all 0.3s ease",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: "24px", height: "24px" }}>
              <path d="M2 21H22V19H2V21ZM20 8H18V5H20V8ZM18 3H6V13C6 14.1046 6.89543 15 8 15H14C15.1046 15 16 14.1046 16 13V3H18C19.1046 3 20 3.89543 20 5V8C20 9.10462 19.1046 10 18 10H16V13C16 15.2091 14.2091 17 12 17H8C5.79086 17 4 15.2091 4 13V3C4 2.44772 4.44772 2 5 2H19C20.6569 2 22 3.34315 22 5V8C22 9.65685 20.6569 11 19 11H18V13C18 16.3137 15.3137 19 12 19H8C4.68629 19 2 16.3137 2 13V3C2 1.89543 2.89543 1 4 1H18V3Z"></path>
            </svg>
            Support Chai
          </a>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </>
  );
}
