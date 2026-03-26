'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../GameContext';

const GOLD = '#E8B84B';
const BG   = '#080808';

const modes = [
  {
    id: 'mega',
    label: 'MEGA AUCTION',
    tag: 'FULL EXPERIENCE',
    subtitle: '500+ Players · 40+ Sets · All Franchises',
    desc: 'The complete IPL Mega Auction. Every set, every player, every franchise fighting for the ultimate squad.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
        <circle cx="24" cy="24" r="22" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M24 8 L26 21 L38 24 L26 27 L24 40 L22 27 L10 24 L22 21 Z" fill={GOLD} />
      </svg>
    ),
    stats: [{ val: '500+', label: 'PLAYERS' }, { val: '10', label: 'TEAMS' }, { val: '40+', label: 'SETS' }, { val: '₹120CR', label: 'PURSE' }],
    accentColor: GOLD,
    glowColor: 'rgba(232,184,75,0.10)',
  },
  {
    id: 'mini',
    label: 'MINI AUCTION',
    tag: 'QUICK GAME',
    subtitle: '200 Players · Top Picks · Random Sets',
    desc: 'Jump straight in. Top players from every category, shuffled and ready. Fast, brutal, fair.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
        <polygon points="24,3 44,15 44,33 24,45 4,33 4,15" stroke="#22D3EE" strokeWidth="1.5" />
        <polygon points="24,13 27.5,22 37,22 29.5,28 32,37 24,31 16,37 18.5,28 11,22 20.5,22" fill="#22D3EE" />
      </svg>
    ),
    stats: [{ val: '200', label: 'PLAYERS' }, { val: '10', label: 'TEAMS' }, { val: 'RAND', label: 'SETS' }, { val: '₹120CR', label: 'PURSE' }],
    accentColor: '#22D3EE',
    glowColor: 'rgba(34,211,238,0.08)',
  },
];

export default function ModePage() {
  const router = useRouter();
  const { setAuctionMode } = useGame();
  const [hov, setHov] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    setSelected(id);
    setTimeout(() => {
      setAuctionMode(id);
      router.push(`/play-mode?mode=${id.toUpperCase()}`);
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600&family=Courier+Prime:wght@400;700&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .mode-nav {
          position: fixed; top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; z-index: 50;
          border-bottom: 1px solid #1a1a1a; background: #080808;
        }
        .back-btn {
          background: none; border: 1px solid #2a2a2a; color: #666;
          font-family: 'Barlow Condensed', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 8px 16px; cursor: pointer; transition: color .2s, border-color .2s;
          display: flex; align-items: center; gap: 6px;
        }
        .back-btn:hover { color: #fff; border-color: #fff; }

        .brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: 0.3em; color: #333;
        }
        .brand span { color: ${GOLD}; }

        .mode-header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeUp .4s ease both;
          width: 100%; max-width: 600px;
        }
        .mode-eyebrow {
          font-family: 'Courier Prime', monospace; font-weight: 700;
          font-size: 11px; color: ${GOLD}; letter-spacing: 4px;
          text-transform: uppercase; display: block; margin-bottom: 12px;
        }
        .mode-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 10vw, 5rem);
          letter-spacing: -0.02em; line-height: 0.9;
          color: #fff; margin: 0 0 16px;
        }
        .mode-h1 span { color: ${GOLD}; }
        .mode-sub {
          font-family: 'Courier Prime', monospace;
          font-size: 13px; color: #555; line-height: 1.6;
          margin: 0;
        }

        /* Cards grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%; max-width: 780px;
          animation: fadeUp .5s ease both;
        }
        @media (max-width: 640px) {
          .cards-grid { grid-template-columns: 1fr; max-width: 420px; }
        }

        .mode-card {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          border-radius: 2px;
          padding: 24px 20px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .25s, background .25s;
        }
        .mode-card:hover {
          transform: translateY(-6px);
        }
        .mode-card:active {
          transform: translateY(-2px);
        }

        /* Corner triangle */
        .card-corner {
          position: absolute; top: 0; right: 0;
          width: 0; height: 0; border-style: solid;
          border-width: 0 40px 40px 0;
          transition: border-color .25s;
        }

        .card-tag {
          font-family: 'Barlow Condensed', sans-serif; font-weight: 600;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .card-tag-bar { display: inline-block; width: 20px; height: 2px; }

        .card-icon { margin-bottom: 16px; opacity: 0.65; transition: opacity .25s; }
        .mode-card:hover .card-icon { opacity: 1; }

        .card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.6rem, 5vw, 2rem);
          color: #fff; line-height: 1; margin-bottom: 4px;
        }
        .card-subtitle {
          font-family: 'Courier Prime', monospace;
          font-size: 11px; color: #555; margin-bottom: 14px;
          line-height: 1.5;
        }
        .card-divider { height: 1px; background: #1a1a1a; margin-bottom: 14px; }
        .card-desc {
          font-family: 'Courier Prime', monospace;
          font-size: 12px; color: #666; line-height: 1.65;
          margin-bottom: 20px;
        }

        /* Stats row */
        .stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 6px; margin-bottom: 20px;
        }
        .stat-box {
          background: #111; border: 1px solid #1e1e1e;
          padding: 8px 4px; text-align: center;
          transition: border-color .25s;
        }
        .stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; color: #fff; line-height: 1;
          transition: color .25s;
          white-space: nowrap;
        }
        .stat-label {
          font-family: 'Courier Prime', monospace;
          font-size: 8px; color: #444; letter-spacing: 1px;
          text-transform: uppercase; margin-top: 3px;
          white-space: nowrap;
        }

        /* CTA button */
        .card-cta {
          width: 100%;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: 0.08em;
          padding: 14px 12px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: transform .2s, box-shadow .2s;
          color: #000;
        }
        .card-cta:hover { transform: translate(-2px,-2px); box-shadow: 3px 3px 0 #fff; }

        .bottom-hint {
          margin-top: 32px;
          font-family: 'Courier Prime', monospace;
          font-size: 11px; color: #2a2a2a;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-align: center;
          animation: fadeIn .8s ease both;
          padding: 0 12px;
        }

        /* Grid background */
        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          opacity: 0.025;
          background-image: linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Grid */}
      <div className="grid-bg" />

      {/* Navbar */}
      <nav className="mode-nav" style={{ animation: 'fadeIn .4s ease both' }}>
        <button className="back-btn" onClick={() => router.push('/')}>← Back</button>
        <div className="brand">IPL <span>AUCTION</span></div>
      </nav>

      {/* Header */}
      <div className="mode-header">
        <span className="mode-eyebrow">Select Game Mode</span>
        <h1 className="mode-h1">
          HOW DO YOU<br />
          <span>WANT TO PLAY?</span>
        </h1>
        <p className="mode-sub">
          Two modes. Same purse. Different pressure.
        </p>
      </div>

      {/* Cards */}
      <div className="cards-grid" style={{ position: 'relative', zIndex: 1 }}>
        {modes.map((m) => {
          const isHov = hov === m.id;
          const isSel = selected === m.id;
          return (
            <div
              key={m.id}
              className="mode-card"
              onMouseEnter={() => setHov(m.id)}
              onMouseLeave={() => setHov(null)}
              onClick={() => handleSelect(m.id)}
              style={{
                background: isHov ? m.glowColor : '#0F0F0F',
                borderColor: isHov || isSel ? m.accentColor : '#1E1E1E',
                boxShadow: isHov ? `0 20px 60px ${m.glowColor}, 0 0 0 1px ${m.accentColor}22` : 'none',
              }}
            >
              {/* Corner */}
              <div className="card-corner" style={{
                borderColor: `transparent ${isHov ? m.accentColor : '#1E1E1E'} transparent transparent`
              }} />

              {/* Tag */}
              <div className="card-tag" style={{ color: m.accentColor }}>
                <span className="card-tag-bar" style={{ background: m.accentColor }} />
                {m.tag}
              </div>

              {/* Icon */}
              <div className="card-icon">{m.icon}</div>

              {/* Title */}
              <div className="card-title">{m.label}</div>
              <div className="card-subtitle">{m.subtitle}</div>

              <div className="card-divider" />

              <p className="card-desc">{m.desc}</p>

              {/* Stats */}
              <div className="stats-row">
                {m.stats.map(s => (
                  <div
                    key={s.label}
                    className="stat-box"
                    style={{ borderColor: isHov ? `${m.accentColor}30` : '#1e1e1e' }}
                  >
                    <div className="stat-val" style={{ color: isHov ? m.accentColor : '#fff', fontSize: s.val.length > 4 ? '0.85rem' : '1.1rem' }}>
                      {s.val}
                    </div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="card-cta" style={{ background: m.accentColor }}>
                {isSel ? 'LOADING…' : `SELECT ${m.id === 'mega' ? 'MEGA' : 'MINI'}`}
                {!isSel && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <p className="bottom-hint">
        Up to 10 players per room · Share room code · ₹120 Crore purse
      </p>
    </div>
  );
}
