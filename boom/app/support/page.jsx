import Link from 'next/link';
import BrandLink from '../components/BrandLink';
import JsonLd from '../components/JsonLd';
import { SUPPORT_URL } from '../components/ChaiSupport';
import { breadcrumbSchema, createMetadata } from '../lib/seo';

export const metadata = createMetadata({
  title: 'Support IPL Auction Simulator',
  description: 'Support IPL Auction Simulator to help cover server costs and keep the multiplayer auction experience fast, ad-light, and free to use.',
  path: '/support',
  keywords: ['support ipl auction simulator', 'donate server costs', 'buy me a chai'],
});

const reasons = [
  'No login wall. Anyone can jump in and play with friends quickly.',
  'No pay-to-play model. The core auction experience stays free.',
  'No heavy ad clutter interrupting rooms, bidding, or results.',
  'Real server costs grow as more users create rooms and play live auctions.',
  'Maintenance takes ongoing effort: bug fixes, performance tuning, new features, and smoother multiplayer syncing.',
];

const promise = [
  'Keep the site responsive during busy traffic spikes.',
  'Reduce lag, disconnects, and room instability as usage grows.',
  'Maintain the live auction flow, results pages, and multiplayer room system cleanly.',
  'Continue improving the product without turning it into a bloated ad experience.',
];

export default function SupportPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Support', path: '/support' }])} />
      <div style={{ minHeight: '100vh', background: '#050608', color: '#f8fafc', padding: '24px 16px 40px' }}>
        <style>{`
          .support-shell { max-width: 1120px; margin: 0 auto; }
          .support-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.08); }
          .support-grid { display:grid; grid-template-columns:minmax(0, 1.1fr) minmax(300px, 0.9fr); gap:22px; margin-top:28px; }
          .support-card { background:#0b0d12; border:1px solid #1d2330; border-radius:24px; padding:24px; }
          .support-list { display:grid; gap:12px; margin-top:18px; }
          .support-item { display:flex; align-items:flex-start; gap:10px; color:#cbd5e1; line-height:1.7; }
          .support-dot { width:10px; height:10px; border-radius:999px; background:#E8B84B; margin-top:8px; flex-shrink:0; }
          @media (max-width: 860px) {
            .support-grid { grid-template-columns:1fr; }
            .support-card { border-radius:18px; padding:18px; }
          }
        `}</style>

        <div className="support-shell">
          <div className="support-topbar">
            <BrandLink compact={true} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/" style={{ border: '1px solid #222', color: '#dbe4ee', textDecoration: 'none', borderRadius: 999, padding: '10px 16px', fontWeight: 700, letterSpacing: 1 }}>Home</Link>
              <Link href="/how-to-play" style={{ border: '1px solid #222', color: '#dbe4ee', textDecoration: 'none', borderRadius: 999, padding: '10px 16px', fontWeight: 700, letterSpacing: 1 }}>How to Play</Link>
              <a href={SUPPORT_URL} target="_blank" rel="noreferrer" style={{ border: 'none', background: '#E8B84B', color: '#000', textDecoration: 'none', borderRadius: 999, padding: '10px 18px', fontWeight: 900, letterSpacing: 1.2 }}>Buy Me a Chai</a>
            </div>
          </div>

          <div className="support-grid">
            <div className="support-card">
              <div style={{ color: '#E8B84B', fontSize: 12, letterSpacing: 3, fontWeight: 800, marginBottom: 8 }}>SUPPORT THE PROJECT</div>
              <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 7vw, 68px)', lineHeight: 0.92, letterSpacing: 2 }}>
                HELP KEEP IPL AUCTION SIMULATOR FAST, FREE, AND ALIVE
              </h1>
              <p style={{ marginTop: 18, color: '#d1d5db', fontSize: '1.08rem', lineHeight: 1.9, maxWidth: 760 }}>
                IPL Auction Simulator is built as a passion project for cricket fans who want a smooth multiplayer auction experience without annoying blockers.
                There is no login requirement, no paywall, and no heavy ad-first experience. The goal is simple: open the site, create a room, invite friends, and play without friction.
              </p>
              <p style={{ marginTop: 14, color: '#d1d5db', fontSize: '1.05rem', lineHeight: 1.9, maxWidth: 760 }}>
                As the number of users keeps growing, the cost of running servers, keeping rooms stable, reducing lag, fixing bugs, and maintaining everything cleanly also keeps growing.
                A small contribution helps keep the platform responsive and lets the work continue without turning the site into a cluttered, ad-heavy product.
              </p>

              <div className="support-list">
                {reasons.map((item) => (
                  <div key={item} className="support-item">
                    <span className="support-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div className="support-card">
                <div style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1.5 }}>What Your Support Helps With</div>
                <div className="support-list">
                  {promise.map((item) => (
                    <div key={item} className="support-item">
                      <span className="support-dot" style={{ background: '#22D3EE' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="support-card" style={{ borderColor: 'rgba(232,184,75,0.28)' }}>
                <div style={{ color: '#E8B84B', fontSize: 12, letterSpacing: 3, fontWeight: 800, marginBottom: 8 }}>DONATE</div>
                <div style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1, letterSpacing: 1.5 }}>
                  BUY ME A CHAI
                </div>
                <p style={{ marginTop: 14, color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.8 }}>
                  If the game has been useful, fun, or part of your auction nights with friends, you can support it here.
                  Every contribution goes a long way toward keeping the servers running smoothly.
                </p>
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, width: '100%', minHeight: 52, borderRadius: 14, background: '#E8B84B', color: '#000', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: 1.5, textTransform: 'uppercase' }}
                >
                  Support the Servers
                </a>
                <div style={{ marginTop: 12, color: '#6b7280', fontSize: 12, lineHeight: 1.7 }}>
                  No pressure. The platform remains free either way. This is simply for people who want to help the project stay healthy and keep improving.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
