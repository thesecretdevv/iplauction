import Link from 'next/link';

const CARD = '#0f1218';
const GOLD = '#E8B84B';

export const metadata = {
  title: 'Page Not Found | IPL Auction Online',
  description: 'The page you requested was not found. Jump back into IPL Auction Online, live rooms, teams, players, or the how-to-play guide.',
};

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#fff', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: 'min(720px, 100%)', background: CARD, border: '1px solid #1f2430', borderRadius: 24, padding: '40px 28px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(54px, 10vw, 96px)', letterSpacing: 6, lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: 2, marginTop: 12 }}>PAGE NOT FOUND</h1>
        <p style={{ maxWidth: 520, margin: '14px auto 0', color: '#94a3b8', lineHeight: 1.8 }}>
          This IPL Auction Online page does not exist anymore. Use the links below to go back to the live cricket auction game, browse rooms, or read the guide.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 28 }}>
          <Link href="/" style={{ background: `linear-gradient(135deg, ${GOLD}, #c8921b)`, color: '#000', padding: '12px 18px', borderRadius: 999, textDecoration: 'none', fontWeight: 900, letterSpacing: 1 }}>
            HOME
          </Link>
          <Link href="/room" style={{ border: '1px solid #2b3342', color: '#e5e7eb', padding: '12px 18px', borderRadius: 999, textDecoration: 'none', fontWeight: 800, letterSpacing: 1 }}>
            LIVE ROOMS
          </Link>
          <Link href="/how-to-play" style={{ border: '1px solid #2b3342', color: '#e5e7eb', padding: '12px 18px', borderRadius: 999, textDecoration: 'none', fontWeight: 800, letterSpacing: 1 }}>
            HOW TO PLAY
          </Link>
        </div>
      </div>
    </main>
  );
}
