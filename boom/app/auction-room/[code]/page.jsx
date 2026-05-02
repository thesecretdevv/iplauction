import Link from 'next/link';
import { getBackendUrl } from '../../lib/backendUrl';
import { createMetadata } from '../../lib/seo';

export const dynamic = 'force-dynamic';

async function getRoom(code) {
  try {
    const response = await fetch(`${getBackendUrl()}/api/rooms/${encodeURIComponent(String(code || '').toUpperCase())}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const code = String(params.code || '').toUpperCase();
  const room = await getRoom(code);
  const isIndexable = room && !room.isPrivate;

  return createMetadata({
    title: room?.name ? `${room.name} - Public IPL Auction Room` : 'Public IPL Auction Room',
    description: room?.name
      ? `Join or view ${room.name}, a public IPL auction simulator room with live bidding, purse strategy, and fantasy squad building.`
      : 'Public IPL auction room for live bidding and fantasy squad building.',
    path: `/auction-room/${code.toLowerCase()}`,
    keywords: ['public ipl auction room', 'ipl auction room', 'live ipl auction'],
    index: Boolean(isIndexable),
  });
}

export default async function PublicAuctionRoomPage({ params }) {
  const code = String(params.code || '').toUpperCase();
  const room = await getRoom(code);

  if (!room || room.isPrivate) {
    return (
      <main style={{ minHeight: '100vh', background: '#080808', color: '#fff', padding: '100px 24px', fontFamily: "'Rajdhani', sans-serif", textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4rem', letterSpacing: 0 }}>Auction Room Not Public</h1>
        <p style={{ color: '#c7d0db' }}>This room is private, expired, or unavailable for search indexing.</p>
        <Link href="/room?action=browse" style={{ display: 'inline-block', marginTop: 24, background: '#E8B84B', color: '#000', padding: '12px 16px', textDecoration: 'none', fontWeight: 800 }}>Browse Live Rooms</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#fff', padding: '100px 24px', fontFamily: "'Rajdhani', sans-serif" }}>
      <section style={{ maxWidth: 820, margin: '0 auto' }}>
        <p style={{ color: '#E8B84B', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 800 }}>Public IPL Auction Room</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, margin: '8px 0', letterSpacing: 0 }}>{room.name || `Room ${code}`}</h1>
        <p style={{ color: '#c7d0db', fontSize: '1.1rem', lineHeight: 1.65 }}>
          This public IPL auction simulator room is available for live bidding and fantasy squad building.
        </p>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, margin: '30px 0' }}>
          {[
            ['Room Code', code],
            ['Mode', room.mode || room.auctionMode || 'mega'],
            ['Players', room.playerCount ?? room.players ?? 0],
          ].map(([label, value]) => (
            <div key={label} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 18, background: 'rgba(12,16,24,0.86)' }}>
              <dt style={{ color: '#94A3B8', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</dt>
              <dd style={{ margin: '8px 0 0', fontSize: '1.2rem', fontWeight: 800 }}>{value}</dd>
            </div>
          ))}
        </dl>
        <Link href={`/join/${code}`} style={{ background: '#E8B84B', color: '#000', padding: '12px 16px', textDecoration: 'none', fontWeight: 800 }}>Join Auction Room</Link>
      </section>
    </main>
  );
}
