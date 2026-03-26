'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './landing.css';

/* ── Live ticker values that animate like real stats ── */
function useLiveStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const base = { rooms: 847, players: 204, purse: 2400, bids: 12843 };
    setStats(base);
    const id = setInterval(() => {
      setStats(s => ({
        rooms:   s.rooms   + Math.floor(Math.random() * 3),
        players: 204,
        purse:   s.purse   + Math.floor(Math.random() * 5),
        bids:    s.bids    + Math.floor(Math.random() * 7),
      }));
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return stats;
}

/* ── Data ── */
const BATSMAN_PATH = 'M50 10 A5 5 0 1 0 50 20 A5 5 0 1 0 50 10 Z M40 25 L60 25 L65 50 L55 50 L50 80 L45 80 L45 50 L35 50 Z M65 40 L80 60 M45 40 L25 50';
const BOWLER_PATH  = 'M40 15 A5 5 0 1 0 40 25 A5 5 0 1 0 40 15 Z M35 30 L55 25 L60 50 L50 60 L45 90 L35 90 L40 60 L20 40 Z M60 30 L80 15 M40 40 L20 50';

const PLAYERS = [
  { name: 'P. KUMAR',  role: 'Batsman',     path: BATSMAN_PATH },
  { name: 'A. SINGH',  role: 'Bowler',      path: BOWLER_PATH  },
  { name: 'M. STOKES', role: 'All-Rounder', path: BATSMAN_PATH },
  { name: 'R. SHARMA', role: 'Batsman',     path: BATSMAN_PATH },
  { name: 'J. BUMRAH', role: 'Bowler',      path: BOWLER_PATH  },
];

const TEAMS = ['MI','CSK','RCB','KKR','DC','SRH','GT','LSG','RR','PBKS'];

const TICKER_ITEMS = [
  '204 PLAYERS IN THE POOL','10 FRANCHISES PER GAME','LIVE MULTIPLAYER BIDDING',
  'REAL-TIME PURSE TRACKER','BUILD YOUR DREAM SQUAD','OUTSMART YOUR RIVALS',
  'FREE TO PLAY','IPL AUCTION',
];

const HOW_STEPS = [
  { num: '01', title: 'CREATE OR JOIN A ROOM', body: 'Host a private game and share the room code with friends, or jump into a public room instantly. No account needed — just a franchise name and you are in.' },
  { num: '02', title: 'PICK YOUR SQUAD',       body: 'Every player gets a base price. Watch your rivals bid, decide when to hold back and when to go all-in. Your purse is limited — spend it wisely.' },
  { num: '03', title: 'WIN THE AUCTION',        body: 'The franchise with the best squad balance wins. Star-studded lineups only work if you have the budget to back them. Dominate the table.' },
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
  const stats = useLiveStats();

  return (
    <div className="landing-root">

      {/* NAVBAR */}
      <nav className="l-nav anim-hide-init nav-reveal">
        <div className="l-nav-logo font-bebas">IPL <span style={{color:'#E8B84B'}}>AUCTION</span></div>

        <div className="l-nav-links">
          {['Auction','Teams','Players','Schedule'].map(l => (
            <a key={l} href="#" className="l-nav-link">{l}</a>
          ))}
        </div>

        <div className="l-nav-actions">
          <button className="l-btn-outline">Log In</button>
          <button className="l-btn-gold" onClick={() => router.push('/room')}>Join Auction</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="l-hero">
        {/* Left */}
        <div className="l-hero-left anim-hide-init hero-reveal">
          <span className="l-hero-eyebrow">IPL Auction</span>

          <h1 className="l-hero-h1">
            STRIKE YOUR<br />
            <span className="l-hero-h1-gold">BID.</span>
            <span className="l-cursor blink" />
          </h1>

          <p className="l-hero-subtext">
            10 franchises. 204 players. One game.<br />
            Outbid your friends and build the ultimate squad.
          </p>

          {/* Live Game Stats */}
          <div className="l-countdown">
            <span className="l-countdown-label">LIVE GAME STATS</span>
            <div className="l-countdown-row">
              <div className="l-cd-box">
                <span className="l-cd-num" style={{fontSize:'1.6rem'}}>{stats ? stats.rooms.toLocaleString() : '—'}</span>
                <span className="l-cd-unit">ROOMS</span>
              </div>
              <span className="l-countdown-sep">/</span>
              <div className="l-cd-box">
                <span className="l-cd-num" style={{fontSize:'1.6rem'}}>{stats ? stats.players : '—'}</span>
                <span className="l-cd-unit">PLAYERS</span>
              </div>
              <span className="l-countdown-sep">/</span>
              <div className="l-cd-box pulse">
                <span className="l-cd-num" style={{fontSize:'1.4rem'}}>{stats ? stats.bids.toLocaleString() : '—'}</span>
                <span className="l-cd-unit">BIDS PLACED</span>
              </div>
            </div>
          </div>

          <div className="l-ctas">
            <button className="l-btn-primary" onClick={() => router.push('/room')}>Play Now — Free</button>
            <button className="l-btn-secondary" onClick={() => router.push('/room')}>
              Join a Room
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right – Bat */}
        <div className="l-hero-right">
          <div className="l-bat-container bat-sequence">
            <div className="shockwave shockwave-anim" />

            {/* Backing circle */}
            <svg className="l-bat-bg-circle" viewBox="0 0 500 500">
              <circle cx="250" cy="250" r="240" fill="none" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Orbiting particles */}
            <svg className="l-orbit-svg orbit-anim" viewBox="0 0 400 400">
              <g fill="#E8B84B">
                <circle cx="200" cy="20"  r="2" />
                <circle cx="380" cy="200" r="2" />
                <circle cx="200" cy="380" r="2" />
                <circle cx="20"  cy="200" r="2" />
                <circle cx="72"  cy="72"  r="1.5" />
                <circle cx="328" cy="328" r="1.5" />
                <circle cx="72"  cy="328" r="1.5" />
                <circle cx="328" cy="72"  r="1.5" />
              </g>
            </svg>

            {/* Cricket Bat SVG */}
            <svg className="l-bat-svg" viewBox="0 0 120 500" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="grip" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="8"  height="16" fill="#222" />
                  <rect x="8" width="8" height="16" fill="#E8B84B" />
                </pattern>
              </defs>
              <rect x="45" y="10" width="20" height="120" fill="url(#grip)" stroke="#111" strokeWidth="1" />
              <rect x="40" y="0"  width="30" height="10"  fill="#111" />
              <polygon points="45,130 65,130 55,180" fill="#E8B84B" />
              <rect x="20" y="130" width="60"  height="360" fill="#F7F7F7" />
              <line x1="30" y1="130" x2="30" y2="490" stroke="#DDDDDD" strokeWidth="1" />
              <line x1="40" y1="140" x2="40" y2="490" stroke="#DDDDDD" strokeWidth="1" />
              <line x1="50" y1="130" x2="50" y2="490" stroke="#DDDDDD" strokeWidth="1" />
              <line x1="60" y1="150" x2="60" y2="490" stroke="#DDDDDD" strokeWidth="1" />
              <line x1="70" y1="130" x2="70" y2="490" stroke="#DDDDDD" strokeWidth="1" />
              <rect x="80" y="130" width="15" height="360" fill="#C8A84B" />
              <rect x="20" y="490" width="75" height="10"  fill="#E8B84B" />
              <text x="-460" y="55" transform="rotate(-90)" fontFamily="'Bebas Neue', sans-serif" fontSize="22" fill="#222" letterSpacing="4">IPL AUC</text>
              <text x="-360" y="52" transform="rotate(-90)" fontFamily="'Courier Prime', monospace" fontSize="8"  fill="#555">PRO SERIES . WEIGHT 2.9</text>
            </svg>
          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <div className="l-ticker anim-hide-init sr1">
        <div className="l-ticker-track marquee-anim">
          {[0,1].map(i => (
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
          <div className="l-cards">
            {PLAYERS.map(p => <PlayerCard key={p.name} {...p} />)}
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
          {TEAMS.map(t => <div key={t} className="l-team-badge">{t}</div>)}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div className="l-footer-inner">
          <div className="l-footer-top">
            <div className="l-footer-brand">
              <div className="l-footer-logo font-bebas">IPL <span style={{color:'#E8B84B'}}>AUCTION</span></div>
              <p className="l-footer-tagline">The free online IPL auction game.</p>
            </div>
            <div className="l-footer-links">
              {['Privacy','Terms','Contact','API'].map(l => (
                <a key={l} href="#" className="l-footer-link">{l}</a>
              ))}
            </div>
          </div>
          <div className="l-footer-bottom">
            © 2025 IPL AUCTION. FREE TO PLAY. BUILT FOR THE GAME.
          </div>
        </div>
      </footer>

    </div>
  );
}
