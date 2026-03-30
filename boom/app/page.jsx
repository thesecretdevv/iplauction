'use client';

import { useRouter } from 'next/navigation';
import CircularGallery from './components/CircularGallery';
import ALL_PLAYERS from './data/Players.json';
import './landing.css';


const BATSMAN_PATH = 'M50 10 A5 5 0 1 0 50 20 A5 5 0 1 0 50 10 Z M40 25 L60 25 L65 50 L55 50 L50 80 L45 80 L45 50 L35 50 Z M65 40 L80 60 M45 40 L25 50';
const BOWLER_PATH = 'M40 15 A5 5 0 1 0 40 25 A5 5 0 1 0 40 15 Z M35 30 L55 25 L60 50 L50 60 L45 90 L35 90 L40 60 L20 40 Z M60 30 L80 15 M40 40 L20 50';

const PLAYERS = [
  { name: 'P. KUMAR', role: 'Batsman', path: BATSMAN_PATH },
  { name: 'A. SINGH', role: 'Bowler', path: BOWLER_PATH },
  { name: 'M. STOKES', role: 'All-Rounder', path: BATSMAN_PATH },
  { name: 'R. SHARMA', role: 'Batsman', path: BATSMAN_PATH },
  { name: 'J. BUMRAH', role: 'Bowler', path: BOWLER_PATH },
];

const TEAMS = [
  { id: 'CSK', name: 'Chennai Super Kings', short: 'CSK', color: '#F9CA24', logo: '/assets/CSK.png' },
  { id: 'MI', name: 'Mumbai Indians', short: 'MI', color: '#4FC3F7', logo: '/assets/MI.png' },
  { id: 'RCB', name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#FF5252', logo: '/assets/RCB.png' },
  { id: 'KKR', name: 'Kolkata Knight Riders', short: 'KKR', color: '#CE93D8', logo: '/assets/KKR.png' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', short: 'SRH', color: '#FF8A65', logo: '/assets/SRH.png' },
  { id: 'DC', name: 'Delhi Capitals', short: 'DC', color: '#64B5F6', logo: '/assets/DC.png' },
  { id: 'PBKS', name: 'Punjab Kings', short: 'PBKS', color: '#EF9A9A', logo: '/assets/PBKS.png' },
  { id: 'RR', name: 'Rajasthan Royals', short: 'RR', color: '#F48FB1', logo: '/assets/RR.png' },
  { id: 'GT', name: 'Gujarat Titans', short: 'GT', color: '#4DD0E1', logo: '/assets/GT.png' },
  { id: 'LSG', name: 'Lucknow Super Giants', short: 'LSG', color: '#81D4FA', logo: '/assets/LSG.png' },
];

const TICKER_ITEMS = [
  '204 PLAYERS IN THE POOL', '10 FRANCHISES PER GAME', 'LIVE MULTIPLAYER BIDDING',
  'REAL-TIME PURSE TRACKER', 'BUILD YOUR DREAM SQUAD', 'OUTSMART YOUR RIVALS',
  'FREE TO PLAY', 'IPL AUCTION',
];

const MARQUEE_NAMES = [
  'MS DHONI', 'VIRAT KOHLI', 'ROHIT SHARMA', 'YASHASVI JAISWAL',
  'SHREYAS IYER', 'RISHABH PANT', 'SANJU SAMSON', 'AXAR PATEL',
  'ISHAN KISHAN', 'JASPRIT BUMRAH'
];

const GALLERY_ITEMS = MARQUEE_NAMES.map(name => {
  const nUpper = name.toUpperCase();
  const p = ALL_PLAYERS.find(pl => {
    const pUpper = pl.name.toUpperCase();
    return pUpper === nUpper || pUpper.includes(nUpper.split(' ')[1] || nUpper);
  });
  return {
    image: p?.photo_url || '/assets/Kohli.avif',
    text: name
  };
});

const HOW_STEPS = [
  { num: '01', title: 'CREATE OR JOIN A ROOM', body: 'Host a private game and share the room code with friends, or jump into a public room instantly. No account needed — just a franchise name and you are in.' },
  { num: '02', title: 'PICK YOUR SQUAD', body: 'Every player gets a base price. Watch your rivals bid, decide when to hold back and when to go all-in. Your purse is limited — spend it wisely.' },
  { num: '03', title: 'WIN THE AUCTION', body: 'The franchise with the best squad balance wins. Star-studded lineups only work if you have the budget to back them. Dominate the table.' },
];

/* ── Components ── */
function CdBox({ value, label, pulse }) {
  return (
    <div className={`l-cd-box${pulse ? ' pulse' : ''}`}>
      <span className="l-cd-num">{value}</span>
      <span className="l-cd-unit">{label}</span>
    </div>
  );
}

function PlayerCard({ name, role, path }) {
  return (
    <div className="l-card">
      <div className="l-card-img">
        <svg className="l-card-svg" viewBox="0 0 100 100">
          <path d={path} fill="none" stroke="#E8B84B" strokeWidth="2" strokeLinecap="square" />
        </svg>
      </div>
      <div className="l-card-info">
        <div>
          <div className="l-card-name">{name}</div>
          <div className="l-card-role">{role}</div>
        </div>
        <div className="l-card-price">₹2.00 CR</div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-root">

      {/* NAVBAR */}
      <nav className="l-nav anim-hide-init nav-reveal">
        <div className="l-nav-logo font-bebas">IPL <span style={{ color: '#E8B84B' }}>AUCTION ONLINE</span></div>

        <div className="l-nav-links">
          {['Auction', 'Teams', 'Players'].map(l => (
            <a key={l} href={l === 'Auction' ? '/room' : `/${l.toLowerCase()}`} className="l-nav-link">{l}</a>
          ))}
        </div>

        <div className="l-nav-actions">
          <button className="l-nav-login" onClick={() => router.push('/room?action=create')}>Create Room</button>
          <button className="l-nav-login" onClick={() => router.push('/room?action=browse')}>Live Auctions</button>
          <button className="l-btn-gold" onClick={() => router.push('/room?action=join-code')}>Join Room</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="l-hero">
        {/* Left */}
        <div className="l-hero-left anim-hide-init hero-reveal">
          <span className="l-hero-eyebrow">IPL Auction Online</span>

          <h1 className="l-hero-h1">
            STRIKE YOUR<br />
            <span className="l-hero-h1-gold">BID.</span>
            <span className="l-cursor blink" />
          </h1>

          <p className="l-hero-subtext">
            Compete for the best squad in the IPL 2026 season.<br />
            10 franchises. 520+ players. Real auction dynamics.
          </p>

          {/* Static Game Stats - Refined */}
          <div className="l-stats-refined">
            <span className="l-stats-label">AT A GLANCE</span>
            <div className="l-stats-grid">
              <div className="l-stat-item">
                <span className="l-stat-val">10</span>
                <span className="l-stat-name" style={{ color: '#E8B84B' }}>FRANCHISES</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-val">120CR</span>
                <span className="l-stat-name" style={{ color: '#22D3EE' }}>PURSE</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-val">520+</span>
                <span className="l-stat-name" style={{ color: '#818CF8' }}>PLAYERS</span>
              </div>
            </div>
          </div>

          <div className="l-ctas">
            <button className="l-btn-primary" onClick={() => router.push('/room?action=create')}>Play Now — Free</button>
            <button className="l-btn-secondary" onClick={() => router.push('/room?action=browse')}>
              Live Auction Rooms
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="l-btn-secondary" onClick={() => router.push('/room?action=join-code')}>
              Join a Room
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right – Hero Image */}
        <div className="l-hero-right">
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', animationDelay: '0.4s' }} className="anim-hide-init hero-reveal">
            {/* Ambient Gold Glow Behind Players */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: '#E8B84B', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, pointerEvents: 'none' }}></div>

            {/* Hero Players Image */}
            <img src="/assets/Hero_players.png" alt="" fetchPriority="high" style={{ position: 'relative', zIndex: 10, width: '130%', maxWidth: '850px', objectFit: 'contain', filter: 'drop-shadow(0 10px 40px rgba(232,184,75,0.15))', transform: 'translateX(-15%)' }} />
          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <div className="l-ticker anim-hide-init sr1">
        <div className="l-ticker-track marquee-anim">
          {[0, 1].map(i => (
            <div key={i} className="l-ticker-set">
              {TICKER_ITEMS.flatMap((item, j) => [
                <span key={`dot-${j}`}>●</span>,
                <span key={`item-${j}`}>{item}</span>,
              ])}
            </div>
          ))}
        </div>
      </div>

      {/* MARQUEE PLAYERS */}
      <section className="l-players anim-hide-init sr2">
        <div className="l-players-inner">
          <div className="l-section-title-row">
            <div className="l-gold-bar" />
            <h2 className="l-section-h2">MARQUEE PLAYERS</h2>
          </div>
        </div>
        <div className="l-desktop-marquee" style={{ height: '600px', position: 'relative', width: '100%', maxWidth: '100vw', cursor: 'grab', overflow: 'hidden' }}>
          <CircularGallery
            items={GALLERY_ITEMS}
            bend={3}
            textColor="#E8B84B"
            borderRadius={0.05}
            font="700 32px 'Montserrat', sans-serif"
          />
        </div>
        <div className="l-mobile-marquee">
          <div style={{ display: 'flex', overflowX: 'auto', gap: 16, padding: '24px', scrollSnapType: 'x mandatory' }}>
            {GALLERY_ITEMS.map((item, i) => (
              <div key={i} style={{ minWidth: 220, flexShrink: 0, scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden', background: '#111', border: '1px solid #222' }}>
                <img src={item.image} style={{ width: '100%', height: 280, objectFit: 'cover' }} alt="" fetchPriority="high" />
                <div style={{ padding: 12, textAlign: 'center', background: '#0a0a0c', color: '#E8B84B', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="l-how anim-hide-init sr3">
        <div className="l-how-grid">
          {HOW_STEPS.map(({ num, title, body }) => (
            <div key={num} className="l-step">
              <div className="l-step-num">{num}</div>
              <div className="l-step-bar" />
              <h3 className="l-step-title">{title}</h3>
              <p className="l-step-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAMS */}
      <section className="l-teams">
        <p className="l-teams-label">This Season&apos;s Franchises</p>
        <div className="l-teams-grid">
          {TEAMS.map(t => (
            <div
              key={t.id}
              className="l-team-badge"
              onClick={() => router.push('/teams')}
              title={t.name}
              style={{ borderColor: '#1c1c1c', background: `${t.color}08` }}
            >
              <img
                src={t.logo}
                alt={t.short}
                style={{ width: '70px', height: '70px', objectFit: 'contain', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div className="l-footer-inner">
          <div className="l-footer-top">
            <div className="l-footer-brand">
              <div className="l-footer-logo font-bebas">IPL <span style={{ color: '#E8B84B' }}>AUCTION ONLINE</span></div>
              <p className="l-footer-tagline">The free online IPL auction game.</p>
            </div>
            <div className="l-footer-links">
              {['Privacy', 'Terms', 'Contact', 'API'].map(l => (
                <a key={l} href="#" className="l-footer-link">{l}</a>
              ))}
            </div>
          </div>
          <div className="l-footer-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <span>© 2026 IPL AUCTION ONLINE. FREE TO PLAY. BUILT FOR THE GAME.</span>

            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '1px', lineHeight: '1.6', maxWidth: '600px', marginTop: '4px' }}>
              IPL Auction Online is a fan-made simulator and is not affiliated with the BCCI, IPL, or any official franchise.
              Data and player information are attributed to <a href="https://www.iplt20.com" target="_blank" rel="noreferrer" style={{ color: '#E8B84B', textDecoration: 'none' }}>iplt20.com</a> & <a href="https://cricapi.com" target="_blank" rel="noreferrer" style={{ color: '#E8B84B', textDecoration: 'none' }}>CricAPI</a>.
            </div>

            <span style={{ fontSize: '9px', color: '#666', letterSpacing: '2px', textTransform: 'lowercase', marginTop: '8px' }}>
              <a target="_blank" rel="noreferrer" href="https://icons8.com/icon/OLf3WK9ioebI/auction" style={{ color: 'inherit', textDecoration: 'none' }}>Auction Hammer</a> icon by <a target="_blank" rel="noreferrer" href="https://icons8.com" style={{ color: 'inherit', textDecoration: 'none' }}>Icons8</a>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
