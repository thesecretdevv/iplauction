'use client';

import { useState, useRef, useCallback, Suspense, memo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame, fmt, nextBid } from '../GameContext';
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import { StatsModal } from '../../src/StatsModal';
import { SquadModal } from '../../src/SquadModal';
import { getPlayerRating } from '../data/playerRatings';
import ALL_PLAYERS from '../data/Players.json';

const kohliImg = '/assets/Kohli.avif';

const StatRow = ({ label, val }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ color: '#888', fontSize: 10, letterSpacing: 1 }}>{label}</span>
    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 15, letterSpacing: 1 }}>{val}</span>
  </div>
);

function fmtIncrement(currentBid, nextPrice) {
  const diff = +(nextPrice - currentBid).toFixed(2);
  if (diff <= 0) return '';
  if (diff < 1) return `+${Math.round(diff * 100)}L`;
  return `+${diff.toFixed(diff % 1 === 0 ? 0 : 1)} Cr`;
}

function playBidClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (_) {}
}

// ── Timer progress bar component ─────────────────────────────────────────────
function TimerBar({ timer, maxTimer = 30, isPaused }) {
  const pct = Math.min(100, (timer / maxTimer) * 100);
  const isLow = timer <= 5;
  const barColor = isPaused ? '#333' : isLow ? '#ef4444' : GOLD;

  return (
    <div style={{
      height: 3,
      background: '#111',
      width: '100%',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: barColor,
        transition: isPaused ? 'none' : 'width 1s linear, background 0.3s ease',
        boxShadow: !isPaused && isLow ? `0 0 8px ${barColor}` : 'none',
      }} />
    </div>
  );
}

function AuctionContent() {
  const router = useRouter();
  const {
    gs, isMulti, effectiveMyTeamId, humanBid, submitXI,
    showSquad, setShowSquad, showStats, setShowStats,
    viewingTeam, setViewingTeam, emit, isHost, multiGS, g,
    lobbyPlayers, myName, myTeamId, roomCode,
    lobbyMode, auctionMode, isSpectator, chatLog
  } = useGame();

  const searchParams = useSearchParams();
  const isSpectatorMode = isSpectator || searchParams.get('spectator') === '1';

  const [showTeams, setShowTeams]       = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [mobileTab, setMobileTab]       = useState('teams');   // 'teams' | 'settings'
  const [copied, setCopied]             = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [hamburgerTab, setHamburgerTab] = useState('upcoming'); // 'upcoming'|'sold'|'unsold'|'leaderboard'
  const [expandedTeam, setExpandedTeam] = useState(null);

  const handleBid = useCallback(() => {
    playBidClick();
    humanBid();
  }, [humanBid]);

  if (!gs) {
    return (
      <div style={{ height: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${GOLD}20`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: GOLD, letterSpacing: 3 }}>CONNECTING TO ARENA...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const upcomingPlayers = gs.playerQueue.slice(gs.currentIdx + 1);
  const groupedUpcoming = upcomingPlayers.reduce((acc, p) => {
    const sName = p.setName || "Other";
    if (!acc[sName]) acc[sName] = [];
    acc[sName].push(p);
    return acc;
  }, {});

  Object.keys(groupedUpcoming).forEach(cat => {
    groupedUpcoming[cat].sort((a, b) => a.name.localeCompare(b.name));
  });

  const CYAN = '#22D3EE';

  const UpcomingModal = memo(({ showUpcoming, setShowUpcoming, upcomingPlayers, groupedUpcoming }) => {
    if (!showUpcoming) return null;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Barlow Condensed', sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 900, background: "#0a0a0c", border: `1px solid ${GOLD}44`, borderRadius: 16, display: "flex", flexDirection: "column", maxHeight: "92vh", animation: "fadeUp 0.3s ease", boxShadow: "0 0 50px rgba(0,0,0,1)" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: GOLD, letterSpacing: 2 }}>UPCOMING PLAYERS</div>
              <div style={{ color: "#555", fontSize: 11, letterSpacing: 1, marginTop: 2 }}>POOLED BY CATEGORY · {upcomingPlayers.length} LEFT</div>
            </div>
            <button onClick={() => setShowUpcoming(false)} style={{ background: "transparent", border: "none", color: "#666", fontSize: 24, cursor: "pointer", padding: 4 }}>✕</button>
          </div>
          <div className="squad-scroller" style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
            {Object.entries(groupedUpcoming).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>No players remaining in the auction.</div>
            ) : (
              Object.entries(groupedUpcoming).map(([cat, players]) => (
                <div key={cat} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: "#fff", letterSpacing: 2 }}>{cat.toUpperCase()}</div>
                    <div style={{ color: CYAN, fontSize: 10, background: `${CYAN}15`, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{players.length}</div>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${BORDER}, transparent)` }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                    {players.map((p, i) => {
                      const pRec = ALL_PLAYERS.find(ap => ap.name === p.name);
                      const photoUrl = pRec?.photo_url;
                      return (
                        <div key={i} style={{ background: "#0d0d10", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', display: "flex", flexDirection: "column", alignItems: "center", transition: "transform 0.2s" }}
                          onMouseOver={e => e.currentTarget.style.borderColor = ROLE_C[p.role]}
                          onMouseOut={e => e.currentTarget.style.borderColor = BORDER}
                        >
                           <div style={{ width: '100%', height: 100, background: '#050505', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                             {photoUrl ? (
                               <img src={photoUrl} alt={p.name} style={{ height: '95%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
                             ) : (
                               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 36 }}>
                                 {ROLE_EMOJI[p.role]}
                               </div>
                             )}
                           </div>
                           <div style={{ padding: '8px', textAlign: 'center', width: '100%', background: '#0a0a0c', borderTop: `1px solid #111` }}>
                             <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>{p.name}</div>
                             <div style={{ fontSize: 9, color: ROLE_C[p.role], letterSpacing: 1, marginTop: 4, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>{p.role.toUpperCase()}</div>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  });

  if (gs.phase === 'selection') {
    const isMini = currentMode?.toLowerCase() === 'mini';
    if (isMini && !gs.selections[effectiveMyTeamId]) {
      // Auto-submit all 11 players for mini auction
      const mySquad = gs.squads[effectiveMyTeamId] || [];
      setTimeout(() => submitXI(mySquad.slice(0, 11)), 500);
      return (
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 4 }}>AUCTION COMPLETE</div>
          <div style={{ color: '#555', fontSize: 13, letterSpacing: 2 }}>FINALIZING YOUR SQUAD...</div>
        </div>
      );
    }
    return (
      <SelectionScreen
        mySquad={gs.squads[effectiveMyTeamId] || []}
        onSubmit={submitXI}
        submitted={isMulti ? gs.selections[effectiveMyTeamId] : false}
        playersNeeded={11}
      />
    );
  }

  if (gs.phase === 'finished') { router.push('/results'); return null; }

  const player      = gs.playerQueue[gs.currentIdx];
  const currentMode = isMulti ? lobbyMode : auctionMode;
  const pRecord     = ALL_PLAYERS.find(p => p.name.toLowerCase() === player.name.toLowerCase());
  const photoUrl    = pRecord?.photo_url || null;
  const stats       = pRecord?.stats || {};
  const rating      = getPlayerRating(player.name, currentMode);
  const myTeam      = TEAMS.find(t => t.id === effectiveMyTeamId);
  const bidderTeam  = gs.currentBidder ? TEAMS.find(t => t.id === gs.currentBidder) : null;
  const osCount     = (gs.squads[effectiveMyTeamId] || []).filter(p => p.overseas).length;
  
  // Dynamic limits based on mode
  const isMini      = gs.auctionMode?.toLowerCase() === 'mini';
  const maxSquadSize= isMini ? 11 : ((gs.playerQueue?.length || 0) <= 200 ? 15 : 25);
  const maxOverseas = isMini ? 4 : 8;

  const canBid      = gs.phase === 'bidding'
    && gs.currentBidder !== effectiveMyTeamId
    && (gs.purses[effectiveMyTeamId] || 0) >= (gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid))
    && (gs.squads[effectiveMyTeamId]?.length || 0) < maxSquadSize
    && (!player.overseas || osCount < maxOverseas);
  const iLeading    = gs.currentBidder === effectiveMyTeamId;
  const nextPrice   = gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid);
  const isTimerLow  = !gs.isPaused && gs.timer <= 5;

  const sortedTeams = [...TEAMS].sort((a, b) => (gs.purses[b.id] || 0) - (gs.purses[a.id] || 0));

  return (
    <div className="ac-app-root" style={{ fontFamily: "'Barlow Condensed', sans-serif", background: BG, color: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', WebkitTapHighlightColor: 'transparent' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes sold    { 0%{transform:scale(.5);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes tPulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes rowIn   { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:none} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:none} }
        @keyframes timerGlow { 0%,100%{box-shadow:0 0 8px #ef4444} 50%{box-shadow:0 0 18px #ef4444,0 0 30px #ef444440} }
        ::-webkit-scrollbar { width:2px } ::-webkit-scrollbar-thumb { background:#222 }
        .squad-scroller::-webkit-scrollbar { width: 6px; }
        .squad-scroller::-webkit-scrollbar-track { background: ${BG}; border-radius: 4px; }
        .squad-scroller::-webkit-scrollbar-thumb { background: ${GOLD}55; border-radius: 4px; }

        /* ── TOP BAR ── */
        .ac-top {
          display: flex; align-items: center;
          gap: 6px; padding: 0 10px; height: 48px; flex-shrink: 0;
          background: #09090c; border-bottom: 1px solid ${BORDER};
          position: relative; z-index: 50;
        }

        .ac-top-brand { font-family:'Bebas Neue',sans-serif; font-size: 16px; color:${GOLD}; letter-spacing:2px; white-space:nowrap; flex-shrink:0; }
        .ac-top-badge-sm { background:${GOLD}18; border:1px solid ${GOLD}30; padding:2px 6px; font-size:9px; color:${GOLD}; font-weight:600; letter-spacing:1px; white-space:nowrap; border-radius:3px; }
        .ac-top-live-sm  { background:#22D3EE18; border:1px solid #22D3EE30; padding:2px 5px; font-size:9px; color:#22D3EE; letter-spacing:1px; white-space:nowrap; border-radius:3px; }

        /* Responsive timer — big display */
        .ac-timer-box {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-width: 52px; height: 40px; border-radius: 8px;
          border: 1px solid ${BORDER}; background: #0f0f12; flex-shrink: 0;
          transition: border-color 0.3s, background 0.3s;
          font-family: 'Bebas Neue', sans-serif;
        }
        .ac-timer-box.low {
          border-color: #ef444488;
          background: #1a0505;
          animation: timerGlow 0.5s ease-in-out infinite;
        }

        .ac-top-me  { display:flex; align-items:center; gap:5px; flex-shrink:0; padding: 3px 7px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid #1a1a1a; }
        .ac-top-btn { background:rgba(34,211,238,.12); border:1px solid rgba(34,211,238,.3); color:#22D3EE;
          padding:5px 10px; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:11px;
          letter-spacing:.06em; cursor:pointer; white-space:nowrap; transition: background .2s; border-radius: 4px; }
        .ac-top-btn:hover { background: rgba(34,211,238,.22); }
        .ac-top-btn-gold { background:rgba(232,184,75,0.1); border:1px solid ${GOLD}44; color:${GOLD}; }
        .ac-top-btn-gold:hover { background: rgba(232,184,75,0.18); }
        .ac-top-actions { display:flex; gap:5px; flex-shrink:0; }

        /* ── BODY ── */
        .ac-body { display:flex; flex:1; overflow:hidden; }

        /* LEFT sidebar — hidden on mobile */
        .ac-left {
          width: clamp(180px,18vw,240px); padding: 14px 12px;
          border-right: 1px solid ${BORDER}; overflow-y: auto; flex-shrink: 0;
          background: linear-gradient(180deg,#0d0d10,transparent);
        }
        @media(max-width:860px) { .ac-left { display:none; } }

        /* CENTER */
        .ac-center {
          flex:1; display:flex; flex-direction:column;
          align-items:center; overflow:hidden; position:relative;
        }

        /* Player hero — scrollable area above bid strip */
        .ac-scroll {
          flex:1; overflow-y:auto; overflow-x:hidden;
          display:flex; flex-direction:column; align-items:center;
          padding:12px 14px 4px; width:100%;
        }

        /* Player compact pill on mobile */
        .ac-player-pill {
          width:100%; max-width:480px; display:flex; align-items:center; gap:10px;
          background:#0f0f12; border:1px solid ${BORDER}; padding:10px 12px; margin-bottom:8px;
          animation: fadeUp .3s ease both; border-radius: 10px;
        }
        .ac-player-avatar {
          width:48px; height:48px; border-radius:50%; overflow:hidden; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .ac-player-name { font-family:'Bebas Neue',sans-serif; font-size:clamp(17px,4vw,22px); color:#fff; letter-spacing:1px; line-height:1; }
        .ac-player-meta { font-size:11px; letter-spacing:1px; margin-top:2px; }

        /* Bid area */
        .ac-bid-area {
          width:100%; max-width:480px; text-align:center; padding:0 0 6px;
          animation: fadeUp .3s ease .05s both;
        }
        .ac-bid-label { font-size:9px; letter-spacing:4px; color:#333; text-transform:uppercase; margin-bottom:2px; }
        .ac-bid-amount {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(48px,12vw,80px);
          color:${GOLD}; letter-spacing:3px; line-height:1;
          text-shadow:0 0 40px ${GOLD}40;
        }
        .ac-leading-pill {
          display:inline-flex; align-items:center; gap:8px; margin-top:4px;
          border-radius:20px; padding:4px 12px;
        }

        /* Bid log */
        .ac-bid-log { width:100%; max-width:480px; }
        .ac-log-row { display:flex; justify-content:space-between; align-items:center;
          padding:5px 8px; border-radius:4px; margin-bottom:2px; }

        /* SOLD / UNSOLD overlay */
        .ac-phase-overlay {
          flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
          animation:sold .4s ease-out; width:100%;
        }
        .ac-sold-text { font-family:'Bebas Neue',sans-serif; font-size:clamp(56px,14vw,96px); letter-spacing:8px; line-height:.9; }

        /* ── INLINE BID ROW (replaces fixed strip) ── */
        .ac-bid-row {
          width:100%; max-width:480px;
          display:flex; align-items:center; gap:8px;
          margin:10px 0 8px;
        }
        .ac-purse-label {
          font-size:11px; color:#888; white-space:nowrap; flex-shrink:0;
          font-family:'Barlow Condensed',sans-serif; font-weight:600;
        }
        .ac-purse-val { color:#4ade80; font-weight:700; font-size:13px; }

        /* BID BUTTON — inline, full flex */
        .ac-bid-btn {
          flex:1; height:50px; border:none; cursor:pointer;
          font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:2px;
          display:flex; align-items:center; justify-content:center;
          flex-direction:column; gap:1px; transition:filter .12s, transform .1s;
          -webkit-tap-highlight-color:transparent; touch-action:manipulation;
          border-radius:10px;
        }
        .ac-bid-btn:active:not(:disabled) { filter:brightness(1.2); transform:scale(.97); }
        .ac-bid-btn:disabled { cursor:not-allowed; }
        .ac-bid-btn-sub { font-family:'Barlow Condensed',sans-serif; font-size:9px; letter-spacing:1px; opacity:.7; font-weight:600; }
        .ac-menu-btn {
          width:44px; height:50px; border-radius:10px; border:1px solid #222;
          background:#111; color:#666; font-size:18px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          transition:border-color .2s, color .2s;
        }
        .ac-menu-btn:hover { border-color:#444; color:#ccc; }

        /* DESKTOP BID AREA */
        .ac-desktop-bid-area { display:none; width:100%; max-width:480px; margin-top:24px; }
        @media(min-width:861px){ .ac-desktop-bid-area { display:block; } }

        /* Mobile player pill hidden on desktop */
        @media(min-width:861px){ .ac-player-pill { display:none !important; } }
        /* Bid row hidden on desktop (desktop uses ac-desktop-bid-area) */
        @media(min-width:861px){ .ac-bid-row { display:none !important; } }

        /* ── MOBILE TAB BAR ── */
        .ac-mob-tabs {
          width:100%; max-width:480px; display:flex;
          border-bottom:1px solid #1a1a1a; margin-bottom:4px;
        }
        @media(min-width:861px){ .ac-mob-tabs { display:none !important; } }
        .ac-mob-tab {
          flex:1; padding:9px 6px; text-align:center;
          font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:700;
          letter-spacing:.5px; cursor:pointer; border-bottom:2px solid transparent;
          transition:all .2s; color:#555;
        }
        .ac-mob-tab.active { color:#fff; border-bottom-color:${GOLD}; }

        /* Tab content area — scrollable */
        .ac-tab-content { width:100%; max-width:480px; padding:8px 0 20px; }
        @media(min-width:861px){ .ac-tab-content { display:none !important; } }

        /* Team row in tab */
        .ac-team-tab-row {
          background:#0f0f12; border:1px solid #1c1c1c; border-radius:10px;
          margin-bottom:8px; overflow:hidden;
        }
        .ac-team-tab-header {
          display:flex; align-items:center; gap:10px; padding:10px 12px;
          cursor:pointer; transition:background .15s;
        }
        .ac-team-tab-header:active { background:rgba(255,255,255,.04); }
        .ac-team-dropdown { padding:0 12px 10px; }
        .ac-player-bought-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:5px 0; border-bottom:1px solid #161616; font-size:13px;
        }
        .ac-player-bought-row:last-child { border-bottom:none; }

        /* RIGHT sidebar — hidden on mobile */
        .ac-right {
          width: clamp(160px,16vw,220px); border-left: 1px solid ${BORDER};
          display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
        }
        @media(max-width:860px) { .ac-right { display:none; } }
        .ac-right-row { display:flex; flex-direction:column; overflow-y:auto; flex:1; }
        .ac-team-row { padding:8px 12px; border-bottom:1px solid ${BORDER}; cursor:pointer; transition:background .15s; }
        .ac-team-row:active { background:rgba(255,255,255,.04); }

        /* ── HAMBURGER SHEET ── */
        .ac-sheet-bg { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:40; }
        .ac-sheet {
          position:fixed; bottom:0; left:0; right:0; max-height:80vh;
          background:#0c0c10; border-top:1px solid ${BORDER}; z-index:41;
          display:flex; flex-direction:column;
          padding-bottom:env(safe-area-inset-bottom);
          animation:sheetUp .25s ease;
        }
        .ac-sheet-header { flex-shrink:0; padding:10px 14px;
          display:flex; justify-content:space-between; align-items:center;
          border-bottom:1px solid ${BORDER}; }
        .ac-sheet-tabs { display:flex; border-bottom:1px solid #1a1a1a; flex-shrink:0; }
        .ac-sheet-tab {
          flex:1; padding:9px 4px; text-align:center; font-size:11px; font-weight:700;
          font-family:'Barlow Condensed',sans-serif; letter-spacing:.5px; cursor:pointer;
          border-bottom:2px solid transparent; color:#555; transition:all .2s;
        }
        .ac-sheet-tab.active { color:#fff; border-bottom-color:${GOLD}; }
        .ac-sheet-body { flex:1; overflow-y:auto; padding:12px 14px 16px; }

        /* ── BOTTOM TICKER ── */
        .ac-ticker { border-top:1px solid ${BORDER}; padding:6px 12px; display:flex;
          gap:14px; overflow-x:auto; flex-shrink:0; background:#060608; align-items:center;
          scrollbar-width:none; }
        .ac-ticker::-webkit-scrollbar { display:none; }
        .ac-ticker-item { flex-shrink:0; font-size:12px; color:#aaa; display:flex; gap:6px; align-items:center;
          background:#ffffff04; padding:3px 10px; border-radius:4px; border:1px solid ${BORDER}; }
        @media(max-width:860px){ .ac-ticker { display:none; } }

        /* Host icon buttons (always visible on mobile) */
        .ac-host-icon { background:transparent; border:1px solid #2a2a2a; color:#888;
          width:32px; height:32px; border-radius:6px; font-size:14px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          transition:all .18s; }
        .ac-host-icon:hover { border-color:#555; color:#fff; }
        .ac-host-icon.red { border-color:#ef444440; color:#ef4444; }
        /* Hamburger */
        .ac-hamburger { background:transparent; border:1px solid #2a2a2a; color:#888;
          width:32px; height:32px; border-radius:6px; font-size:16px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          transition:all .18s; }
        .ac-hamburger:hover { border-color:#555; color:#fff; }
        
        .ac-desktop-only { display: none !important; }
        @media(min-width: 861px) {
           .ac-desktop-only { display: inline-flex !important; }
           .ac-mobile-only { display: none !important; }
           .ac-hamburger { display: none !important; }

           /* Desktop Navbar Enhancements */
           .ac-top { padding: 0 24px; height: 56px; gap: 12px; }
           .ac-top-brand { font-size: 20px; letter-spacing: 3px; margin-right: 8px; }
           .ac-top-badge-sm { font-size: 13px; padding: 6px 12px; border-radius: 6px; letter-spacing: 2px; }
           .ac-top-live-sm { font-size: 13px; padding: 6px 12px; border-radius: 6px; letter-spacing: 2px; }
        }
      `}</style>

      <SquadModal 
        isOpen={showSquad} 
        onClose={() => { setShowSquad(false); setViewingTeam(null); }} 
        squads={gs.squads} 
        myTeamId={viewingTeam || effectiveMyTeamId} 
        TEAMS={TEAMS}
        maxSquad={maxSquadSize}
        maxOverseas={maxOverseas}
      />
      <StatsModal  isOpen={showStats} onClose={() => setShowStats(false)} gs={multiGS || g.current} TEAMS={TEAMS} myTeamId={myTeamId} />
      <UpcomingModal
        showUpcoming={showUpcoming}
        setShowUpcoming={setShowUpcoming}
        upcomingPlayers={upcomingPlayers}
        groupedUpcoming={groupedUpcoming}
      />

      {/* ── TIMER PROGRESS BAR (top, full width) ── */}
      <TimerBar timer={gs.timer} maxTimer={30} isPaused={gs.isPaused} />

      {/* ── TOP BAR ── */}
      <div className="ac-top">
        {/* Left: brand + badges */}
        <div style={{ display:'flex', alignItems:'center', gap:5, flex:1, minWidth:0, overflow:'hidden' }}>
          {isMulti && roomCode ? (
            <div className="ac-top-brand" onClick={() => {
              navigator.clipboard.writeText(roomCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} title="Click to copy room code">
              {copied ? <span style={{ color: '#22c55e', fontSize: 13, transform: 'translateY(1px)' }}>COPIED!</span> : roomCode}
            </div>
          ) : (
            <div className="ac-top-brand">IPL</div>
          )}
          <div className="ac-top-badge-sm">{gs.currentSetName}</div>
          {isMulti && <div className="ac-top-live-sm">LIVE</div>}
          
          {/* Desktop Connected Teams */}
          {isMulti && (
            <div className="ac-desktop-only" style={{ marginLeft: 6, background: '#111', border: `1px solid ${BORDER}`, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6 }}>
              <span style={{ fontSize: 8 }}>🟢</span>
              <span style={{ fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>
                {lobbyPlayers?.filter(p => !p.isSpectator && p.teamId).length || 0} / 10 TEAMS
              </span>
            </div>
          )}
          
          {/* Desktop Upcoming Button */}
          <button className="ac-top-btn ac-desktop-only" onClick={() => setShowUpcoming(true)} style={{ marginLeft: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>UPCOMING PLAYERS</span>
            <span style={{ background: 'rgba(34,211,238,0.2)', padding: '2px 6px', borderRadius: 4, fontSize: 9 }}>{upcomingPlayers.length}</span>
          </button>
        </div>

        {/* Host icons — always visible on mobile */}
        {isMulti && isHost && (
          <div style={{ display:'flex', gap:4, flexShrink:0 }}>
            <button className="ac-host-icon" title={gs.isPaused ? 'Resume' : 'Pause'}
              onClick={() => gs.isPaused ? emit('resume-game') : emit('pause-game')}>
              {gs.isPaused ? '▶' : '⏸'}
            </button>
            <button className="ac-host-icon red" title="End auction"
              onClick={() => { if(window.confirm('End auction early?')) emit('end-game'); }}>
              ⏹
            </button>
          </div>
        )}

        {/* Timer box */}
        <div className={`ac-timer-box${isTimerLow ? ' low' : ''}`}
          style={{ color: gs.isPaused ? '#555' : isTimerLow ? '#ef4444' : GOLD }}>
          <span style={{ fontSize:22, lineHeight:1, letterSpacing:1,
            animation: isTimerLow && !gs.isPaused ? 'tPulse .5s infinite' : 'none' }}>
            {gs.isPaused ? '⏸' : String(gs.timer).padStart(2,'0')}
          </span>
          <span style={{ fontSize:8, letterSpacing:2, color:'#555', fontFamily:"'Barlow Condensed'", fontWeight:700, marginTop:1 }}>SEC</span>
        </div>

        <button className="ac-hamburger" onClick={() => setShowHamburger(true)}>
          ☰
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="ac-body">
        {/* LEFT: player card */}
        <div className="ac-left">
          <div style={{ textAlign:'center', animation:'fadeUp .4s ease' }}>
            <div style={{ width:110, height:110, borderRadius:'50%', margin:'0 auto 10px', overflow:'hidden', border:`2px solid ${ROLE_C[player.role]}40`, background:`${ROLE_C[player.role]}12`, display:'flex',alignItems:'center',justifyContent:'center', boxShadow:`0 0 30px ${ROLE_C[player.role]}20` }}>
              {photoUrl ? (
                <img src={photoUrl} alt={player.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
              ) : (player.name.toLowerCase() === 'virat kohli'
                ? <img src={kohliImg} alt={player.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
                : <span style={{ fontSize:52 }}>{ROLE_EMOJI[player.role]}</span>)
              }
            </div>
            
            <div style={{ background: GOLD, color: '#000', fontSize: 13, fontWeight: 900, padding: '2px 8px', borderRadius: 12, display: 'inline-block', marginBottom: 8, letterSpacing: 1 }}>
               RATING: {rating}
            </div>

            <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, color:'#fff', letterSpacing:2, lineHeight:1.1, marginBottom:4 }}>{player.name.toUpperCase()}</div>
            <div style={{ color:ROLE_C[player.role], fontSize:11, fontWeight:700, letterSpacing:3, marginBottom:16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>{ROLE_L[player.role]} · {player.overseas ? 'OVERSEAS' : 'INDIAN'}</span>
            </div>

            {Object.keys(stats).length > 0 && (
              <div style={{ background:'rgba(255,255,255,.03)', border:`1px solid ${BORDER}`, borderRadius:8, padding:'10px 10px 6px', marginBottom:12 }}>
                <div style={{ color: GOLD, fontSize: 10, letterSpacing: 2, textAlign: 'center', borderBottom: `1px solid ${BORDER}`, paddingBottom: 6, marginBottom: 8 }}>RECENT IPL STATS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '4px 12px', textAlign: 'left' }}>
                  {stats.runs != null && <StatRow label="RUNS" val={stats.runs} />}
                  {stats.sr != null && <StatRow label="S.R" val={stats.sr} />}
                  {stats.avg != null && <StatRow label="AVG" val={stats.avg} />}
                  {stats.wickets != null && stats.wickets > 0 && <StatRow label="WKTS" val={stats.wickets} />}
                  {stats.bowl_avg != null && stats.bowl_avg > 0 && <StatRow label="B.AVG" val={stats.bowl_avg} />}
                  {stats.econ != null && stats.econ > 0 && <StatRow label="ECON" val={stats.econ} />}
                </div>
              </div>
            )}

            {[['BASE PRICE', fmt(player.base), GOLD], ['CATEGORY', player.setName.toUpperCase(), '#aaa']].map(([label,val,c]) => (
              <div key={label} style={{ background:'rgba(255,255,255,.03)', border:`1px solid ${BORDER}`, borderRadius:8, padding:'10px 8px', marginBottom:8 }}>
                <div style={{ color:'#444', fontSize:9, letterSpacing:2, marginBottom:4 }}>{label}</div>
                <div style={{ color:c, fontFamily:"'Bebas Neue'", fontSize:20 }}>{val}</div>
              </div>
            ))}

            {gs.bidLog.length > 0 && (
              <div style={{ marginTop:16, textAlign:'left' }}>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:13, color:'#444', letterSpacing:3, marginBottom:8 }}>BID LOG</div>
                {gs.bidLog.map((b,i) => {
                  const t = TEAMS.find(t => t.id === b.teamId);
                  return (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 8px', borderRadius:4, background:i===0?`${t?.color}18`:'transparent', marginBottom:2, border:i===0?`1px solid ${t?.color}30`:'none' }}>
                      <span style={{ color:t?.color, fontWeight:700, fontSize:12 }}>{t?.short}</span>
                      <span style={{ color:i===0?'#fff':'#666', fontSize:12, fontWeight:700 }}>{fmt(b.bid)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CENTER */}
        <div className="ac-center">
          {/* Phase: sold / unsold */}
          {(gs.phase === 'sold' || gs.phase === 'unsold') && (
            <div className="ac-phase-overlay">
              {gs.phase === 'sold' ? (
                <>
                  <div className="ac-sold-text" style={{ color:GOLD, textShadow:`0 0 60px ${GOLD}, 0 0 120px ${GOLD}44` }}>SOLD!</div>
                  <div style={{ color:bidderTeam?.color, fontSize:18, fontWeight:700, letterSpacing:2, marginTop:8 }}>{bidderTeam?.name}</div>
                  <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:32, letterSpacing:4, marginTop:4 }}>{fmt(gs.currentBid)}</div>
                </>
              ) : (
                <>
                  <div className="ac-sold-text" style={{ color:'#ef4444', textShadow:'0 0 60px #ef4444' }}>UNSOLD</div>
                  <div style={{ color:'#555', fontSize:13, marginTop:8, letterSpacing:3 }}>No bids received</div>
                </>
              )}
            </div>
          )}

          {/* Phase: bidding */}
          {gs.phase === 'bidding' && (
            <>
              <div className="ac-scroll">
                {/* Player pill — visible only on mobile */}
                <div className="ac-player-pill" style={{ borderColor:`${ROLE_C[player.role]}30` }}>
                  <div className="ac-player-avatar" style={{ border:`2px solid ${ROLE_C[player.role]}40`, background:`${ROLE_C[player.role]}12` }}>
                    {photoUrl ? (
                      <img src={photoUrl} alt={player.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} />
                    ) : (player.name.toLowerCase() === 'virat kohli'
                      ? <img src={kohliImg} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} />
                      : <span style={{ fontSize:26 }}>{ROLE_EMOJI[player.role]}</span>)
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div className="ac-player-name">{player.name.toUpperCase()}</div>
                      <div style={{ background: GOLD, color: '#000', fontSize: 9, fontWeight: 900, padding: '1px 5px', borderRadius: 6, letterSpacing: 1, flexShrink: 0, marginLeft: 6 }}>
                        {rating}
                      </div>
                    </div>
                    <div className="ac-player-meta" style={{ color:ROLE_C[player.role], display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: 10, background: `${ROLE_C[player.role]}20`, color: ROLE_C[player.role], padding: '1px 5px', borderRadius: 3, letterSpacing: 1, fontWeight: 700 }}>{ROLE_L[player.role]}</span>
                      {player.overseas && <span style={{ fontSize: 9, background: '#6366f120', color: '#818cf8', padding: '1px 5px', borderRadius: 3, letterSpacing: 1, fontWeight: 700 }}>OS</span>}
                    </div>
                    <div style={{ fontSize:10, color:'#444', letterSpacing:.5, marginTop:2 }}>Base: {fmt(player.base)} · #{gs.currentIdx + 1}/{gs.playerQueue.length}</div>
                  </div>
                </div>

                {/* Bid amount */}
                <div className="ac-bid-area">
                  <div className="ac-bid-label">CURRENT BID</div>
                  <div className="ac-bid-amount">{fmt(gs.currentBid)}</div>
                  {bidderTeam ? (
                    <div className="ac-leading-pill" style={{ background:`${bidderTeam.color}14`, border:`1px solid ${bidderTeam.color}40` }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:bidderTeam.color,boxShadow:`0 0 8px ${bidderTeam.color}` }} />
                      <span style={{ color:bidderTeam.color, fontWeight:700, fontSize:14 }}>{bidderTeam.name}</span>
                      <span style={{ color:'#555', fontSize:13 }}>leading</span>
                    </div>
                  ) : (
                    <div style={{ color:'#555', fontSize:13, marginTop:8, letterSpacing:2 }}>↑ BASE PRICE — No bids yet</div>
                  )}

                  {/* ── DESKTOP BID BUTTON ── */}
                  <div className="ac-desktop-bid-area">
                    {isSpectatorMode ? (
                      <div style={{ background:'rgba(129,196,248,0.08)', border:'1px solid rgba(129,196,248,0.25)', borderRadius:8, padding:'14px 30px', color:'#81C4F8', fontFamily:"'Bebas Neue'", fontSize:15, letterSpacing:2, textAlign:'center' }}>
                        👁 SPECTATOR VIEW — Watching Live
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 12 }}>
                        {iLeading ? (
                          <div style={{ flex: 1, background:`${myTeam?.color}20`, border:`2px solid ${myTeam?.color}80`, borderRadius:8, padding:'14px 30px', color:myTeam?.color, fontWeight:700, fontSize:15, letterSpacing:1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✓ YOU&apos;RE LEADING — {fmt(gs.currentBid)}
                          </div>
                        ) : (
                          <button
                            onClick={handleBid}
                            disabled={!canBid}
                            style={{
                              flex: 1, background: canBid ? `linear-gradient(135deg,${myTeam?.color}40,${myTeam?.color}20)` : '#0e0e0e',
                              border: `2px solid ${canBid ? myTeam?.color : '#2a2a2a'}`, borderRadius:8, padding:'15px 0',
                              color: canBid ? myTeam?.color : '#3a3a3a', cursor: canBid ? 'pointer' : 'not-allowed',
                              boxShadow: canBid ? `0 0 28px ${myTeam?.color}44` : 'none', transition:'all 0.2s',
                              display:'flex', flexDirection:'column', alignItems:'center', gap:2
                            }}
                          >
                            {canBid ? (
                              <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.8rem', letterSpacing:3 }}>BID {fmtIncrement(gs.currentBid, nextPrice)}</span>
                            ) : (
                              <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.5rem', letterSpacing:2 }}>{player.overseas && osCount >= 8 ? 'MAX 8 OVERSEAS' : 'INSUFFICIENT FUNDS'}</span>
                            )}
                          </button>
                        )}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 90, background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 16px' }}>
                           <span style={{ fontSize: 9, color: '#777', letterSpacing: 2, marginBottom: 2 }}>PURSE LEFT</span>
                           <span style={{ fontSize: 18, color: myTeam?.color || GOLD, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>{fmt(gs.purses[effectiveMyTeamId] || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bid log */}
                {gs.bidLog.length > 0 && (
                  <div className="ac-bid-log">
                    {gs.bidLog.slice(0,4).map((b,i) => {
                      const t = TEAMS.find(t => t.id === b.teamId);
                      return (
                        <div key={i} className="ac-log-row" style={{ background:i===0?`${t?.color}12`:'transparent', animation:i===0?'rowIn .2s ease':'none', opacity:Math.max(.1,1-i*.2) }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <div style={{ width:6,height:6,borderRadius:'50%',background:t?.color }} />
                            <span style={{ color:t?.color, fontWeight:700, fontSize:13 }}>{t?.short}</span>
                            {b.teamId === effectiveMyTeamId && <span style={{ fontSize:9, background:`${t?.color}33`, color:t?.color, padding:'1px 5px', borderRadius:6 }}>YOU</span>}
                          </div>
                          <span style={{ color:GOLD, fontWeight:700, fontSize:13 }}>{fmt(b.bid)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* end bid log (ac-scroll stays open here to wrap tabs and bid row) */}

              {/* ── INLINE BID ROW (mobile, not fixed) ── */}
              <div className="ac-bid-row">
                {/* Purse */}
                <div className="ac-purse-label">
                  Purse: <span className="ac-purse-val">₹{(gs.purses[effectiveMyTeamId]||0).toFixed(1)} Cr</span>
                </div>
                {/* BID BUTTON */}
                {isSpectatorMode ? (
                  <div className="ac-bid-btn" style={{ background:'rgba(129,196,248,0.08)', border:'1px solid rgba(129,196,248,0.2)', color:'#81C4F8' }}>
                    <span style={{ fontSize:'0.9rem' }}>👁 SPECTATOR</span>
                  </div>
                ) : iLeading ? (
                  <div className="ac-bid-btn" style={{ background:`${myTeam?.color}20`, border:`2px solid ${myTeam?.color}80`, color:myTeam?.color }}>
                    <span style={{ fontSize:'1.1rem', fontFamily:"'Bebas Neue'", letterSpacing:1 }}>✓ LEADING</span>
                    <span className="ac-bid-btn-sub">{fmt(gs.currentBid)}</span>
                  </div>
                ) : (
                  <button className="ac-bid-btn" onClick={handleBid} disabled={!canBid}
                    style={{
                      background: canBid ? `linear-gradient(135deg,${myTeam?.color}dd,${myTeam?.color}99)` : '#111',
                      border: `2px solid ${canBid ? myTeam?.color : '#1e1e1e'}`,
                      color: canBid ? '#000' : '#2a2a2a',
                      boxShadow: canBid ? `0 4px 24px ${myTeam?.color}50` : 'none',
                    }}>
                    {canBid ? (
                      <>
                        <span style={{ fontSize:'1.25rem', fontFamily:"'Bebas Neue'", letterSpacing:2, color:'#000', fontWeight:900 }}>
                          BID {fmt(nextPrice)}
                        </span>
                        <span className="ac-bid-btn-sub" style={{ color:'#00000088' }}>{fmtIncrement(gs.currentBid, nextPrice)}</span>
                      </>
                    ) : (
                      <span style={{ fontSize:'0.85rem', fontFamily:"'Bebas Neue'", letterSpacing:1 }}>
                        {player.overseas && osCount >= 8 ? 'MAX 8 OVERSEAS' : 'CANNOT BID'}
                      </span>
                    )}
                  </button>
                )}
                {/* Menu — opens hamburger */}
                <button className="ac-menu-btn" onClick={() => setShowHamburger(true)}>≡</button>
              </div>

              {/* ── MOBILE TABS ── */}
              <div className="ac-mob-tabs">
                {[['teams','Teams'],['settings','Settings'],['chat','Chat']].map(([id,label]) => (
                  <div key={id} className={`ac-mob-tab${mobileTab===id?' active':''}`}
                    onClick={() => setMobileTab(id)}>{label}</div>
                ))}
              </div>

              {/* ── TAB CONTENT ── */}
              <div className="ac-tab-content">

                {/* TEAMS TAB */}
                {mobileTab === 'teams' && sortedTeams.map(team => {
                  const isLead = team.id === gs.currentBidder;
                  const isMe   = team.id === effectiveMyTeamId;
                  const squad  = gs.squads[team.id] || [];
                  const spent  = 120 - (gs.purses[team.id] || 0);
                  const isOpen = expandedTeam === team.id;
                  const byRole = squad.reduce((a,p) => { (a[p.role]=a[p.role]||[]).push(p); return a; }, {});
                  return (
                    <div key={team.id} className="ac-team-tab-row"
                      style={{ borderColor: isLead ? `${team.color}40` : isMe ? `${team.color}25` : '#1c1c1c',
                               background: isLead ? `${team.color}0a` : isMe ? `${team.color}06` : '#0f0f12' }}>
                      <div className="ac-team-tab-header"
                        onClick={() => setExpandedTeam(isOpen ? null : team.id)}>
                        <img src={`/assets/${team.id}.png`} style={{ width:24, height:24, objectFit:'contain' }} alt="" />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontWeight:700, color: isMe ? team.color : '#ddd', fontSize:15, letterSpacing:.5 }}>{team.short}</span>
                            {isMe && <span style={{ fontSize:9, background:`${team.color}22`, color:team.color, padding:'1px 5px', borderRadius:3, letterSpacing:1 }}>YOU</span>}
                            {isLead && <span style={{ fontSize:9, background:'#ef444418', color:'#ef4444', padding:'1px 5px', borderRadius:3, letterSpacing:1 }}>LEADING</span>}
                          </div>
                          <div style={{ fontSize:10, color:'#555', marginTop:1 }}>{squad.length} players · Spent {fmt(spent)}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ color:team.color, fontFamily:"'Bebas Neue'", fontSize:17, letterSpacing:1 }}>{fmt(gs.purses[team.id])}</div>
                          <div style={{ fontSize:8, color:'#444', letterSpacing:1 }}>REMAINING</div>
                        </div>
                        <span style={{ color:'#555', fontSize:12, marginLeft:6 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div className="ac-team-dropdown">
                          {squad.length === 0 ? (
                            <div style={{ color:'#444', fontSize:12, textAlign:'center', padding:'8px 0' }}>No players bought yet</div>
                          ) : (
                            Object.entries(byRole).map(([role, players]) => (
                              <div key={role} style={{ marginBottom:8 }}>
                                <div style={{ fontSize:9, letterSpacing:2, color:ROLE_C[role], fontWeight:700, marginBottom:4 }}>{ROLE_L[role].toUpperCase()}</div>
                                {players.map((p,i) => (
                                  <div key={i} className="ac-player-bought-row">
                                    <span style={{ color:'#ccc' }}>{p.name}</span>
                                    <span style={{ color:GOLD, fontWeight:700 }}>{fmt(p.soldFor||p.base)}</span>
                                  </div>
                                ))}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* SETTINGS TAB */}
                {mobileTab === 'settings' && (
                  <div style={{ padding:'4px 0' }}>
                    <div style={{ fontSize:10, letterSpacing:3, color:'#555', textTransform:'uppercase', marginBottom:14 }}>ROOM SETTINGS</div>
                    {/* Bid Timer */}
                    <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:10, padding:'14px', marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <div>
                          <div style={{ color:'#ddd', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>⏱ Bid Timer</div>
                          <div style={{ color:'#555', fontSize:10, marginTop:2 }}>Time allowed for each bid round</div>
                        </div>
                        <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>{gs.timer}s</div>
                      </div>
                      {isHost && (
                        <div style={{ display:'flex', gap:6 }}>
                          {[5,10,15,20,25].map(t => (
                            <button key={t} onClick={() => emit('set-timer', { duration: t })}
                              style={{ flex:1, padding:'7px 0', background: gs.timerDuration===t ? GOLD : '#1a1a1a',
                                color: gs.timerDuration===t ? '#000' : '#888', border:'none', borderRadius:6,
                                fontFamily:"'Barlow Condensed'", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                              {t}s
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Auction Mode */}
                    <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:10, padding:'14px', marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ color:'#ddd', fontSize:14, fontWeight:700 }}>🏏 Auction Mode</div>
                          <div style={{ color:'#555', fontSize:10, marginTop:2 }}>Cannot be changed after room creation</div>
                        </div>
                        <span style={{ background:`${GOLD}18`, border:`1px solid ${GOLD}40`, color:GOLD, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:5, letterSpacing:.5 }}>
                          {(isMulti ? lobbyMode : auctionMode) === 'mega' ? 'Mega Auction' : 'Mini Auction'}
                        </span>
                      </div>
                    </div>
                    {/* Starting Purse */}
                    <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:10, padding:'14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ color:'#ddd', fontSize:14, fontWeight:700 }}>₹ Starting Purse</div>
                        <span style={{ color:'#22c55e', fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>₹120 Cr</span>
                      </div>
                    </div>
                    {/* Host Controls */}
                    {isHost && (
                      <div style={{ marginTop:14, display:'flex', gap:8 }}>
                        <button onClick={() => gs.isPaused ? emit('resume-game') : emit('pause-game')}
                          style={{ flex:1, padding:'13px', background:gs.isPaused?'#22c55e18':'#1a1a1a', border:`1px solid ${gs.isPaused?'#22c55e40':'#2a2a2a'}`,
                            color:gs.isPaused?'#22c55e':'#888', borderRadius:10, fontFamily:"'Bebas Neue'", fontSize:15, letterSpacing:1, cursor:'pointer' }}>
                          {gs.isPaused ? '▶ RESUME' : '⏸ PAUSE'}
                        </button>
                        <button onClick={() => { if(window.confirm('End auction early?')) emit('end-game'); }}
                          style={{ flex:1, padding:'13px', background:'#ef444414', border:'1px solid #ef444440',
                            color:'#ef4444', borderRadius:10, fontFamily:"'Bebas Neue'", fontSize:15, letterSpacing:1, cursor:'pointer' }}>
                          ⏹ END
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {mobileTab === 'chat' && (
                  <div style={{ height: 400 }}>
                    <ChatBox chatLog={chatLog} emit={emit} currentRoom={roomCode} isSpectator={isSpectatorMode} />
                  </div>
                )}
              </div>
            </div>{/* end ac-scroll */}
            </>
          )}
        </div>

        {/* RIGHT: teams */}
        <div className="ac-right">
          <div style={{ padding:'6px 12px', fontSize:9, letterSpacing:3, color:'#444', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>FRANCHISES</div>
          <div className="ac-right-row">
            {sortedTeams.map(team => {
              const isLead = team.id === gs.currentBidder, isMe = team.id === effectiveMyTeamId;
              const pct = ((gs.purses[team.id]||0) / 120) * 100;
              return (
                <div key={team.id} className="ac-team-row"
                  onClick={() => { setViewingTeam(team.id); setShowSquad(true); }}
                  style={{ background:isLead?`${team.color}18`:isMe?`${team.color}0a`:'transparent', borderLeft:`3px solid ${isLead||isMe?team.color:'transparent'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <img src={`/assets/${team.id}.png`} style={{ width: 18, height: 18, objectFit: 'contain' }} alt="" />
                      <span style={{ fontWeight:700, color:'#ddd', fontSize:13, letterSpacing:.5 }}>{team.short}</span>
                      {isMe && <span style={{ fontSize:9, color:team.color }}>YOU</span>}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:team.color, fontFamily:"'Bebas Neue'", fontSize:15, letterSpacing:1 }}>{fmt(gs.purses[team.id])}</div>
                      <div style={{ fontSize:8, color:'#555', letterSpacing:1 }}>{gs.squads[team.id]?.length} pl</div>
                    </div>
                  </div>
                  <div style={{ height:2, background:'#0e0e0e', marginTop:5, borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:team.color, width:`${pct}%`, transition:'width .3s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP CHAT AREA */}
          <div style={{ flex: 1, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', minHeight: '40%' }}>
            <div style={{ padding:'6px 12px', fontSize:9, letterSpacing:3, color:'#22D3EE', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>LIVE CHAT</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
               <ChatBox chatLog={chatLog} emit={emit} currentRoom={roomCode} isSpectator={isSpectatorMode} />
            </div>
          </div>
        </div>
      </div>

      {/* ── TICKER (desktop only) ── */}
      <div className="ac-ticker" style={{ position: 'relative' }}>
        <span style={{ fontSize:9, color:GOLD, letterSpacing:4, fontWeight:900, flexShrink:0 }}>SALES</span>
        <span style={{ fontSize:8, color:'#444', letterSpacing:1, marginLeft: 12, marginRight: 12, flexShrink:0, opacity: 0.8 }}>DATA: IPLT20.COM &amp; CRICAPI</span>
        {(gs.auctionLog||[]).slice(0,12).map((item,i) => {
          const t = TEAMS.find(t => t.id === item.bidder);
          return (
            <div key={i} className="ac-ticker-item">
              <span>{item.player.name}</span>
              {item.sold ? (<><span style={{ color:GOLD }}>→</span><span style={{ color:t?.color, fontWeight:900 }}>{item.bidder}</span><span style={{ color:'#ddd', fontWeight:700 }}>{fmt(item.price)}</span></>) : <span style={{ color:'#ef4444', fontWeight:700 }}>UNSOLD</span>}
            </div>
          );
        })}
        {(!gs.auctionLog || gs.auctionLog.length === 0) && <span style={{ color:'#333', fontSize:11 }}>Auction in progress…</span>}
      </div>

      {/* ── TEAMS BOTTOM SHEET (mobile) ── */}
      {showTeams && (
        <>
          <div className="ac-sheet-bg" onClick={() => setShowTeams(false)} />
          <div className="ac-sheet">
            <div className="ac-sheet-header">
              <span style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:'#ccc', letterSpacing:2 }}>FRANCHISES</span>
              <button onClick={() => setShowTeams(false)} style={{ background:'none', border:'none', color:'#666', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            {sortedTeams.map(team => {
              const isLead = team.id === gs.currentBidder, isMe = team.id === effectiveMyTeamId;
              const pct = ((gs.purses[team.id]||0) / 120) * 100;
              return (
                <div key={team.id} style={{ padding:'12px 16px', borderBottom:`1px solid ${BORDER}`, background:isLead?`${team.color}18`:isMe?`${team.color}0d`:'transparent', borderLeft:`4px solid ${isLead||isMe?team.color:'transparent'}`, cursor:'pointer' }}
                  onClick={() => { setViewingTeam(team.id); setShowSquad(true); setShowTeams(false); }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <img src={`/assets/${team.id}.png`} style={{ width: 22, height: 22, objectFit: 'contain' }} alt="" />
                      <span style={{ fontWeight:700, color:'#ddd', fontSize:16, letterSpacing:.5 }}>{team.short}</span>
                      <span style={{ fontSize:12, color:'#555' }}>{team.name}</span>
                      {isMe && <span style={{ fontSize:10, color:team.color }}>★ YOU</span>}
                      {isLead && <span style={{ fontSize:10, color:team.color, letterSpacing:2 }}>LEADING</span>}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:team.color, fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>{fmt(gs.purses[team.id])}</div>
                      <div style={{ fontSize:10, color:'#555' }}>{gs.squads[team.id]?.length} players</div>
                    </div>
                  </div>
                  <div style={{ height:2, background:'#111', marginTop:8, borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:team.color, width:`${pct}%`, transition:'width .3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── HAMBURGER BOTTOM SHEET (mobile) ── */}
      {showHamburger && (
        <>
          <div className="ac-sheet-bg" onClick={() => setShowHamburger(false)} />
          <div className="ac-sheet">
            {/* Header */}
            <div className="ac-sheet-header">
              <span style={{ fontFamily:"'Bebas Neue'", fontSize:17, color:'#ccc', letterSpacing:2 }}>MORE</span>
              <button onClick={() => setShowHamburger(false)} style={{ background:'none', border:'none', color:'#666', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            {/* Sub-tabs */}
            <div className="ac-sheet-tabs">
              {[['upcoming','Upcoming'],['sold','Sold'],['unsold','Unsold'],['leaderboard','Leaderboard']].map(([id,label]) => (
                <div key={id} className={`ac-sheet-tab${hamburgerTab===id?' active':''}`}
                  onClick={() => setHamburgerTab(id)}>{label}</div>
              ))}
            </div>
            {/* Tab body */}
            <div className="ac-sheet-body">

              {/* UPCOMING */}
              {hamburgerTab === 'upcoming' && (
                upcomingPlayers.length === 0
                  ? <div style={{ textAlign:'center', color:'#444', padding:32 }}>No players remaining</div>
                  : Object.entries(groupedUpcoming).map(([cat, players]) => (
                    <div key={cat} style={{ marginBottom:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <span style={{ fontFamily:"'Bebas Neue'", fontSize:14, color:'#fff', letterSpacing:2 }}>{cat.toUpperCase()}</span>
                        <span style={{ fontSize:10, color:CYAN, background:`${CYAN}15`, padding:'1px 6px', borderRadius:3, fontWeight:700 }}>{players.length}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                        {players.map((p,i) => (
                          <div key={i} style={{ background:'#0d0d10', border:'1px solid #1a1a1a', borderRadius:6, padding:'7px 9px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontSize:12, color:'#aaa' }}>{p.name}</span>
                            <span style={{ fontSize:10, color:ROLE_C[p.role] }}>{ROLE_EMOJI[p.role]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}

              {/* SOLD */}
              {hamburgerTab === 'sold' && (() => {
                const sold = (gs.auctionLog||[]).filter(x => x.sold);
                return sold.length === 0
                  ? <div style={{ textAlign:'center', color:'#444', padding:32 }}>No players sold yet</div>
                  : sold.map((item,i) => {
                    const t = TEAMS.find(t => t.id === item.bidder);
                    return (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #141414' }}>
                        <div>
                          <div style={{ color:'#ddd', fontWeight:700, fontSize:13 }}>{item.player.name}</div>
                          <div style={{ fontSize:10, color:ROLE_C[item.player.role], marginTop:2 }}>{ROLE_L[item.player.role]}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color:t?.color, fontWeight:700, fontSize:12 }}>{t?.short}</div>
                          <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:15 }}>{fmt(item.price)}</div>
                        </div>
                      </div>
                    );
                  });
              })()}

              {/* UNSOLD */}
              {hamburgerTab === 'unsold' && (() => {
                const unsold = (gs.auctionLog||[]).filter(x => !x.sold);
                return unsold.length === 0
                  ? <div style={{ textAlign:'center', color:'#444', padding:32 }}>No unsold players yet</div>
                  : unsold.map((item,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #141414' }}>
                      <div>
                        <div style={{ color:'#888', fontWeight:700, fontSize:13 }}>{item.player.name}</div>
                        <div style={{ fontSize:10, color:ROLE_C[item.player.role], marginTop:2 }}>{ROLE_L[item.player.role]}</div>
                      </div>
                      <span style={{ color:'#ef4444', fontWeight:700, fontSize:11, letterSpacing:1 }}>UNSOLD</span>
                    </div>
                  ));
              })()}

              {/* LEADERBOARD */}
              {hamburgerTab === 'leaderboard' && (() => {
                const board = [...TEAMS]
                  .map(t => ({ team:t, topBid: Math.max(...((gs.auctionLog||[]).filter(x=>x.sold&&x.bidder===t.id).map(x=>x.price)), 0), spent: 120-(gs.purses[t.id]||0) }))
                  .sort((a,b) => b.topBid - a.topBid);
                return (
                  <div>
                    <div style={{ fontSize:9, letterSpacing:3, color:'#555', marginBottom:12 }}>HIGHEST SINGLE BID · ALL TEAMS</div>
                    {board.map((row,i) => (
                      <div key={row.team.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid #141414' }}>
                        <span style={{ color:'#333', fontSize:12, fontFamily:"'Bebas Neue'", width:18 }}>#{i+1}</span>
                        <img src={`/assets/${row.team.id}.png`} style={{ width:20, height:20, objectFit:'contain' }} alt="" />
                        <span style={{ flex:1, color: row.team.id===effectiveMyTeamId ? row.team.color : '#ccc', fontWeight:700, fontSize:13 }}>{row.team.short}</span>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:16 }}>{row.topBid > 0 ? fmt(row.topBid) : '—'}</div>
                          <div style={{ fontSize:9, color:'#555' }}>Spent {fmt(row.spent)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Playing XI Selection ──────────────────────────────────────────────────────
function SelectionScreen({ mySquad, onSubmit, submitted, playersNeeded = 11 }) {
  const [selected, setSelected] = useState([]);
  const toggle = (p) => setSelected(prev =>
    prev.find(x => x.name === p.name)
      ? prev.filter(x => x.name !== p.name)
      : prev.length < playersNeeded ? [...prev, p] : prev
  );

  const getValidationErrors = () => {
    if (selected.length !== playersNeeded) return `Select ${playersNeeded} players.`;
    const batters = selected.filter(p => p.role.includes('BAT')).length;
    const bowlers = selected.filter(p => p.role.includes('BOWL')).length;
    const wks = selected.filter(p => p.role.includes('WK')).length;
    const ars = selected.filter(p => p.role.includes('AR')).length;

    if (batters < 2) return "Must have at least 2 Batsmen";
    if (bowlers < 2) return "Must have at least 2 Bowlers";
    if (wks < 1) return "Must have at least 1 Wicketkeeper";
    if (ars < 1) return "Must have at least 1 All-Rounder";

    return null;
  };

  const validationError = getValidationErrors();
  const canSubmit = validationError === null;
  if (submitted) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:48, color:GOLD, letterSpacing:6 }}>XI SUBMITTED!</div>
        <div style={{ color:'#555', fontSize:14, marginTop:12, letterSpacing:3 }}>WAITING FOR OTHER TEAMS…</div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight:'100vh', background:BG, padding:'24px 16px' }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(28px,6vw,48px)', color:GOLD, letterSpacing:4 }}>SELECT YOUR PLAYING XI</div>
        <div style={{ color:'#555', fontSize:12, letterSpacing:3, marginTop:6 }}>{selected.length}/{playersNeeded} selected</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, maxWidth:900, margin:'0 auto 24px' }}>
        {mySquad.map((p,i) => {
          const sel = !!selected.find(x => x.name === p.name);
          const rc = ROLE_C[p.role];
          return (
            <div key={i} onClick={() => toggle(p)} style={{ background:sel?`${rc}18`:CARD, border:`1px solid ${sel?rc:BORDER}`, borderRadius:8, padding:'12px', cursor:'pointer', transition:'all .2s', transform:sel?'translateY(-2px)':'none', boxShadow:sel?`0 0 18px ${rc}30`:'none' }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:15, color:sel?rc:'#ddd', letterSpacing:1 }}>{p.name}</div>
              <div style={{ fontSize:11, color:rc, marginTop:3, fontWeight:600 }}>{ROLE_L[p.role]}</div>
              <div style={{ fontSize:11, color:GOLD, marginTop:3 }}>{fmt(p.soldFor || p.base)}</div>
              {sel && <div style={{ fontSize:9, color:rc, marginTop:5, letterSpacing:2 }}>✓ SELECTED</div>}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign:'center' }}>
        {validationError && selected.length === playersNeeded && (
          <div style={{ color:'#ef4444', fontSize:14, marginBottom:16, letterSpacing:1, fontFamily:"'Barlow Condensed'", fontWeight:700 }}>
            ⚠️ {validationError.toUpperCase()}
          </div>
        )}
        <button onClick={() => canSubmit && onSubmit(selected)} disabled={!canSubmit}
          style={{ background:canSubmit?`linear-gradient(135deg,${GOLD},#9a7610)`:'#111', border:`1px solid ${canSubmit?GOLD:'#333'}`, borderRadius:6, padding:'14px 48px', color:canSubmit?'#000':'#555', fontWeight:900, fontSize:16, letterSpacing:4, cursor:canSubmit?'pointer':'not-allowed', fontFamily:"'Barlow Condensed'" }}>
          SUBMIT PLAYING XI
        </button>
      </div>
    </div>
  );
}

export default function AuctionPage() {
  return (
    <Suspense fallback={<div style={{ background: '#080808', height: '100vh' }} />}>
      <AuctionContent />
    </Suspense>
  );
}

// ── Chat Box Component ───────────────────────────────────────────────────────
function ChatBox({ chatLog, emit, currentRoom, isSpectator }) {
  const [msg, setMsg] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const send = (e) => {
    e.preventDefault();
    if (!msg.trim() || !currentRoom) return;
    const isGif = msg.trim().startsWith('http') && msg.trim().match(/\.(gif|jpg|jpeg|png)($|\?)/i);
    emit('send-chat', { text: msg.trim(), isGif: !!isGif });
    setMsg('');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0a0c', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto', padding:10, display:'flex', flexDirection:'column', gap:8 }}>
        {chatLog?.map(m => (
          <div key={m.id} style={{ fontSize:13, background: m.type === 'system' ? 'transparent' : '#1a1a20', padding: m.type === 'system' ? 0 : '8px 12px', borderRadius:8, alignSelf: m.type === 'system' ? 'center' : 'flex-start', border: m.type === 'system' ? 'none' : '1px solid #282830' }}>
            {m.type === 'system' ? (
               <span style={{ fontSize:10, color:'#888', fontStyle:'italic' }}>{m.text}</span>
            ) : m.type === 'gif' ? (
               <div>
                 <div style={{ fontSize:10, color:'#22D3EE', marginBottom:4, fontWeight:600 }}>{m.senderName}</div>
                 <img src={m.text} style={{ maxWidth:'100%', borderRadius:6 }} alt="GIF" />
               </div>
            ) : (
               <div>
                 <div style={{ fontSize:10, color:'#22D3EE', marginBottom:4, fontWeight:600 }}>{m.senderName}</div>
                 <span style={{ color:'#ececec', lineHeight:1.4 }}>{m.text}</span>
               </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} style={{ display:'flex', borderTop:'1px solid #1a1a1a', padding:8, gap:6, background:'#080808' }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Message..." 
          style={{ flex:1, background:'#111', border:'1px solid #222', color:'#fff', padding:'8px 10px', borderRadius:6, fontSize:13, outline:'none', minWidth:0 }} />
        <button type="submit" disabled={!msg.trim()} style={{ background:'#22D3EE', color:'#000', border:'none', padding:'0 14px', borderRadius:6, fontWeight:700, cursor:msg.trim()?'pointer':'not-allowed', opacity:msg.trim()?1:0.5 }}>✓</button>
      </form>
    </div>
  );
}
