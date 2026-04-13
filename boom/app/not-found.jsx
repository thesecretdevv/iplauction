import Link from 'next/link';

const BG = '#07090f';
const CARD = '#0f1218';
const GOLD = '#E8B84B';
const CYAN = '#22D3EE';

export const metadata = {
  title: '404 | IPL Auction Online',
  description: 'The page you requested was not found. Head back into IPL Auction Online and jump into a room.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: BG, color: '#fff', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes nfFloat { 0% { transform: translateY(0px); } 50% { transform: translateY(-14px); } 100% { transform: translateY(0px); } }
        @keyframes nfPulse { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: .8; transform: scale(1.08); } }
        @keyframes nfSweep { 0% { transform: translateX(-20%); opacity: 0; } 20% { opacity: .18; } 100% { transform: translateX(120%); opacity: 0; } }
        @keyframes nfFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '12%', left: '8%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(232,184,75,0.09)', filter: 'blur(40px)', animation: 'nfPulse 5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', right: '10%', bottom: '16%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(34,211,238,0.08)', filter: 'blur(44px)', animation: 'nfPulse 6.2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animation: 'nfSweep 6.5s linear infinite' }} />
      </div>

      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 'min(820px, 100%)', background: CARD, border: '1px solid #1c2230', borderRadius: 20, padding: '44px 28px 36px', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.45)', animation: 'nfFadeUp .45s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(232,184,75,0.28)', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at center, rgba(232,184,75,0.12), rgba(15,18,24,0.2))', animation: 'nfFloat 3.8s ease-in-out infinite' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 54, letterSpacing: 6, color: GOLD, lineHeight: 1 }}>404</div>
            </div>
          </div>

          <div style={{ color: CYAN, letterSpacing: 4, fontSize: 11, fontWeight: 800 }}>PAGE LOST IN THE AUCTION</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(30px, 5vw, 52px)', letterSpacing: 2, marginTop: 12, lineHeight: 0.95 }}>
            THIS PAGE DIDN&apos;T MAKE THE FINAL XI
          </h1>
          <p style={{ maxWidth: 600, margin: '16px auto 0', color: '#9aa5b5', lineHeight: 1.8, fontSize: 15 }}>
            “Not every bid lands. The smart move is knowing where to go next.”
          </p>
          <p style={{ maxWidth: 620, margin: '12px auto 0', color: '#6f7a8a', lineHeight: 1.8, fontSize: 14 }}>
            The page you asked for isn&apos;t here anymore, but the auction is very much alive.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 28 }}>
            <Link href="/" style={{ background: `linear-gradient(135deg, ${GOLD}, #c8921b)`, color: '#000', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 900, letterSpacing: 1 }}>
              GO HOME
            </Link>
            <Link href="/room?action=browse" style={{ border: `1px solid ${CYAN}44`, color: CYAN, background: `${CYAN}10`, padding: '12px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, letterSpacing: 1 }}>
              BROWSE ROOMS
            </Link>
            <Link href="/how-to-play" style={{ border: '1px solid #2b3342', color: '#e5e7eb', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, letterSpacing: 1 }}>
              HOW TO PLAY
            </Link>
          </div>

          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #1b2230', color: '#5b6472', fontSize: 11, letterSpacing: 2 }}>
            IPL AUCTION ONLINE
          </div>
        </div>
      </div>
    </main>
  );
}
