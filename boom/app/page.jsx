'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularGallery from './components/CircularGallery';
import ALL_PLAYERS from './data/Players.json';
import { getBackendUrl } from './lib/backendUrl';
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

const TEAM_LOOKUP = Object.fromEntries(TEAMS.map((team) => [team.id, team]));

function getDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getMatchState(match, nowMs) {
  const openMs = new Date(match.auctionOpensAt).getTime();
  const startMs = new Date(match.startAt).getTime();
  const endMs = new Date(match.endAt).getTime();

  if (nowMs >= endMs) return 'completed';
  if (nowMs >= startMs) return 'locked';
  if (nowMs >= openMs) return 'open';
  return 'scheduled';
}

function isPlayableMatch(match, nowMs) {
  const state = getMatchState(match, nowMs);
  return state === 'scheduled' || state === 'open';
}

function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 'Live';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function formatMatchMeta(startAt) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(startAt));
}

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
  const [rivalsMatches, setRivalsMatches] = useState([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isCompactCard, setIsCompactCard] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncCompact = () => setIsCompactCard(window.innerWidth <= 720);
    syncCompact();
    window.addEventListener('resize', syncCompact);
    return () => window.removeEventListener('resize', syncCompact);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${getBackendUrl()}/api/rivals/matches`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setRivalsMatches(data?.matches || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const todayKey = getDateKey(new Date(nowMs));
  const todayRivals = useMemo(
    () => rivalsMatches.filter((match) => match.date === todayKey).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    [rivalsMatches, todayKey]
  );
  const featuredRival = useMemo(() => {
    const nextPlayableToday = todayRivals.find((match) => isPlayableMatch(match, nowMs));
    if (nextPlayableToday) return nextPlayableToday;
    return rivalsMatches.find((match) => isPlayableMatch(match, nowMs)) || null;
  }, [todayRivals, rivalsMatches, nowMs]);
  const rivalsHref = featuredRival ? `/room?action=rivals&matchKey=${encodeURIComponent(featuredRival.key)}` : '/room?action=browse';

  return (
    <div className="landing-root">

      {/* NAVBAR */}
      <nav className="l-nav anim-hide-init nav-reveal">
        <div className="l-nav-logo font-bebas">IPL <span style={{ color: '#E8B84B' }}>AUCTION ONLINE</span></div>

        <div className="l-nav-links">
          {[
            { label: 'Auction', href: '/room' },
            { label: 'Teams', href: '/teams' },
            { label: 'Players', href: '/players' },
            { label: 'How to Play', href: '/how-to-play' },
            { label: 'Schedule', href: '/schedule' },
          ].map((link) => (
            <a key={link.label} href={link.href} className="l-nav-link">{link.label}</a>
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
          <div className="l-hero-art-wrap anim-hide-init hero-reveal" style={{ animationDelay: '0.4s' }}>
            {/* Ambient Gold Glow Behind Players */}
            <div className="l-hero-glow" />

            {/* Hero Players Image */}
            <img className="l-hero-players" src="/assets/Hero_players.png" alt="" fetchPriority="high" />
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 28px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(160deg, rgba(232,184,75,0.12), rgba(9,10,14,0.96))', border: '1px solid rgba(232,184,75,0.18)', borderRadius: 28, padding: '22px 20px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#E8B84B', fontSize: 11, letterSpacing: 3, fontWeight: 800, marginBottom: 6 }}>NEW DAILY MODE</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: 1.5, color: '#fff' }}>TODAY IN RIVALS MODE</div>
            </div>
            <button onClick={() => router.push(rivalsHref)} style={{ border: 'none', borderRadius: 999, padding: '12px 18px', background: 'linear-gradient(135deg, #E8B84B, #c8921b)', color: '#000', fontWeight: 900, letterSpacing: 1.2, cursor: 'pointer' }}>
              PLAY AUCTION NOW
            </button>
          </div>

          {featuredRival ? (() => {
            const home = TEAM_LOOKUP[featuredRival.homeTeam];
            const away = TEAM_LOOKUP[featuredRival.awayTeam];
            const state = getMatchState(featuredRival, nowMs);
            const countdown = formatCountdown(new Date(featuredRival.startAt).getTime() - nowMs);
            const accent = state === 'open' ? '#4ade80' : state === 'locked' ? '#ef4444' : '#22D3EE';
            const timerLabel = state === 'locked' ? 'MATCH LIVE' : state === 'open' ? 'AUCTION LOCKS IN' : 'MATCH STARTS IN';
            const matchMeta = formatMatchMeta(featuredRival.startAt);

            return (
              <div style={{ background: '#0b0d12', border: `1px solid ${featuredRival.isHighProfile ? 'rgba(232,184,75,0.28)' : '#1b2030'}`, borderRadius: 22, padding: '18px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isCompactCard ? 'minmax(0, 1fr)' : '1fr auto', gap: 16, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ color: '#E8B84B', fontSize: 12, letterSpacing: 2.5, fontWeight: 800 }}>RIVALS</div>
                      <div style={{ color: '#94A3B8', fontSize: 12, letterSpacing: 1.4 }}>{matchMeta} IST</div>
                      <div style={{ color: featuredRival.isHighProfile ? '#E8B84B' : '#64748B', fontSize: 12, letterSpacing: 1.4 }}>
                        {featuredRival.isHighProfile ? 'HIGHLIGHT CLASH' : featuredRival.venue}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isCompactCard ? 12 : 18, flexWrap: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isCompactCard ? 8 : 12, minWidth: 0, flex: 1 }}>
                      <img src={home?.logo} alt={home?.short} style={{ width: isCompactCard ? 46 : 58, height: isCompactCard ? 46 : 58, objectFit: 'contain', flexShrink: 0 }} />
                      <div>
                        <div style={{ color: home?.color, fontWeight: 800, letterSpacing: 1.4, fontSize: isCompactCard ? 11 : 13 }}>{home?.short}</div>
                        <div style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: isCompactCard ? 18 : 26, letterSpacing: 1, lineHeight: 1 }}>{home?.name}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isCompactCard ? 24 : 34, color: '#94A3B8', letterSpacing: isCompactCard ? 2 : 4, flexShrink: 0 }}>VS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isCompactCard ? 8 : 12, minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: away?.color, fontWeight: 800, letterSpacing: 1.4, fontSize: isCompactCard ? 11 : 13 }}>{away?.short}</div>
                        <div style={{ color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: isCompactCard ? 18 : 26, letterSpacing: 1, lineHeight: 1 }}>{away?.name}</div>
                      </div>
                      <img src={away?.logo} alt={away?.short} style={{ width: isCompactCard ? 46 : 58, height: isCompactCard ? 46 : 58, objectFit: 'contain', flexShrink: 0 }} />
                    </div>
                  </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCompactCard ? 'stretch' : 'flex-end', gap: 10, textAlign: isCompactCard ? 'center' : 'right' }}>
                    <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>{timerLabel}</div>
                    <div style={{ color: accent, fontFamily: "'Bebas Neue', sans-serif", fontSize: isCompactCard ? 30 : 34, letterSpacing: 1.2 }}>{state === 'locked' ? 'LIVE' : countdown}</div>
                    <button onClick={() => router.push(rivalsHref)} style={{ border: 'none', borderRadius: 999, padding: '12px 18px', background: 'linear-gradient(135deg, #E8B84B, #c8921b)', color: '#000', fontWeight: 900, letterSpacing: 1.2, cursor: 'pointer', width: isCompactCard ? '100%' : 'auto' }}>
                      PLAY AUCTION NOW
                    </button>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div style={{ background: '#0b0d12', border: '1px solid #1b2030', borderRadius: 18, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ color: '#94A3B8', lineHeight: 1.7 }}>
                Rivals mode auto-updates with the IPL schedule each day. Jump in from here to find an online rival or create a private duel room.
              </div>
              <button onClick={() => router.push('/room?action=browse')} style={{ border: 'none', borderRadius: 999, padding: '12px 18px', background: 'linear-gradient(135deg, #E8B84B, #c8921b)', color: '#000', fontWeight: 900, letterSpacing: 1.2, cursor: 'pointer' }}>
                PLAY AUCTION NOW
              </button>
            </div>
          )}
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
              {[
                { label: 'How to Play', href: '/how-to-play' },
                { label: 'Players', href: '/players' },
                { label: 'Teams', href: '/teams' },
                { label: 'Live Rooms', href: '/room?action=browse' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="l-footer-link">{link.label}</a>
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
