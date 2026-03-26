'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, fmt, nextBid } from '../GameContext';
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import { StatsModal } from '../../src/StatsModal';
import { SquadModal } from '../../src/SquadModal';

const kohliImg = '/assets/Kohli.avif';

// Format the BID INCREMENT as +25L / +50L / +1Cr etc
function fmtIncrement(currentBid, nextPrice) {
  const diff = +(nextPrice - currentBid).toFixed(2);
  if (diff <= 0) return '';
  if (diff < 1) return `+${Math.round(diff * 100)}L`;
  return `+${diff.toFixed(diff % 1 === 0 ? 0 : 1)} Cr`;
}

// ── Touch sound (short click) ─────────────────────────────────────────────────
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

export default function AuctionPage() {
  const router = useRouter();
  const {
    gs, isMulti, effectiveMyTeamId, humanBid, submitXI,
    showSquad, setShowSquad, showStats, setShowStats,
    viewingTeam, setViewingTeam, emit, isHost, multiGS, g,
    lobbyPlayers, myName, myTeamId, roomCode
  } = useGame();

  const [showTeams, setShowTeams] = useState(false);

  const handleBid = useCallback(() => {
    playBidClick();
    humanBid();
  }, [humanBid]);

  if (!gs) return null;

  if (gs.phase === 'selection') {
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
  const myTeam      = TEAMS.find(t => t.id === effectiveMyTeamId);
  const bidderTeam  = gs.currentBidder ? TEAMS.find(t => t.id === gs.currentBidder) : null;
  const osCount     = (gs.squads[effectiveMyTeamId] || []).filter(p => p.overseas).length;
  const maxSquadSize= (gs.playerQueue?.length || 0) <= 200 ? 15 : 25;
  const canBid      = gs.phase === 'bidding'
    && gs.currentBidder !== effectiveMyTeamId
    && (gs.purses[effectiveMyTeamId] || 0) >= (gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid))
    && (gs.squads[effectiveMyTeamId]?.length || 0) < maxSquadSize
    && (!player.overseas || osCount < 8);
  const iLeading    = gs.currentBidder === effectiveMyTeamId;
  const nextPrice   = gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid);

  const sortedTeams = [...TEAMS].sort((a, b) => (gs.purses[b.id] || 0) - (gs.purses[a.id] || 0));

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", background: BG, color: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', WebkitTapHighlightColor: 'transparent' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes sold    { 0%{transform:scale(.5);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes tPulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes rowIn   { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:none} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:none} }
        ::-webkit-scrollbar { width:2px } ::-webkit-scrollbar-thumb { background:#222 }

        /* ── TOP BAR ── */
        .ac-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; padding: 8px 12px; flex-shrink: 0;
          background: #09090c; border-bottom: 1px solid ${BORDER};
          flex-wrap: nowrap; overflow-x: auto;
        }
        .ac-top-brand { font-family:'Bebas Neue',sans-serif; font-size:clamp(15px,3vw,20px); color:${GOLD}; letter-spacing:2px; white-space:nowrap; }
        .ac-top-badge { background:${GOLD}18; border:1px solid ${GOLD}30; padding:2px 8px; font-size:9px; color:${GOLD}; font-weight:600; letter-spacing:1px; white-space:nowrap; }
        .ac-top-live  { background:#22D3EE18; border:1px solid #22D3EE30; padding:2px 6px; font-size:9px; color:#22D3EE; letter-spacing:1px; white-space:nowrap; }
        .ac-top-timer {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(28px,5vw,44px);
          letter-spacing:1px; min-width:44px; text-align:center; line-height:1; flex-shrink:0;
        }
        .ac-top-me  { display:flex; align-items:center; gap:6px; flex-shrink:0; }
        .ac-top-btn { background:rgba(34,211,238,.15); border:1px solid rgba(34,211,238,.35); color:#22D3EE;
          padding:5px 12px; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px;
          letter-spacing:.08em; cursor:pointer; white-space:nowrap; }
        .ac-top-actions { display:flex; gap:6px; flex-shrink:0; }
        .ac-top-action-btn { background:transparent; border:1px solid #333; color:#888;
          padding:4px 10px; font-size:11px; font-weight:700; cursor:pointer; letter-spacing:1px; }
        .ac-top-action-btn.red { border-color:#ef444466; color:#ef4444; }

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
          padding:16px 16px 4px; width:100%;
        }

        /* Player compact pill on mobile */
        .ac-player-pill {
          width:100%; max-width:480px; display:flex; align-items:center; gap:12px;
          background:#0f0f12; border:1px solid ${BORDER}; padding:10px 14px; margin-bottom:10px;
          animation: fadeUp .3s ease both;
        }
        .ac-player-avatar {
          width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .ac-player-name { font-family:'Bebas Neue',sans-serif; font-size:clamp(18px,4vw,24px); color:#fff; letter-spacing:1px; line-height:1; }
        .ac-player-meta { font-size:11px; letter-spacing:2px; margin-top:2px; }

        /* Bid area */
        .ac-bid-area {
          width:100%; max-width:480px; text-align:center; padding:0 0 8px;
          animation: fadeUp .3s ease .05s both;
        }
        .ac-bid-label { font-size:10px; letter-spacing:4px; color:#333; text-transform:uppercase; margin-bottom:4px; }
        .ac-bid-amount {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(52px,12vw,84px);
          color:${GOLD}; letter-spacing:3px; line-height:1;
          text-shadow:0 0 40px ${GOLD}40;
        }
        .ac-leading-pill {
          display:inline-flex; align-items:center; gap:8px; margin-top:6px;
          border-radius:20px; padding:5px 14px;
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

        /* ── FIXED BID STRIP (Mobile Only) ── */
        .ac-bid-strip {
          flex-shrink:0; padding:10px 14px 12px;
          background:#09090c; border-top:1px solid ${BORDER};
          display:flex; flex-direction:column; gap:6px;
        }
        @media(min-width:861px){ .ac-bid-strip { display:none !important; } }

        /* BIG BID BUTTON */
        .ac-bid-btn {
          width:100%; height:60px; border:none; cursor:pointer;
          font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:2px;
          display:flex; align-items:center; justify-content:center;
          flex-direction:column; gap:1px; transition:filter .12s, transform .1s;
          -webkit-tap-highlight-color:transparent;
          touch-action:manipulation;
        }
        .ac-bid-btn:active:not(:disabled) { filter:brightness(1.25); transform:scale(.97); }
        .ac-bid-btn:disabled { cursor:not-allowed; }
        .ac-bid-btn-sub { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:2px; opacity:.7; }

        /* DESKTOP BID AREA */
        .ac-desktop-bid-area {
          display:none; width:100%; max-width:480px; margin-top:32px;
        }
        @media(min-width:861px){ .ac-desktop-bid-area { display:block; } }
        
        /* Mobile player pill hidden on desktop */
        @media(min-width:861px){ .ac-player-pill { display:none !important; } }

        /* My status bar */
        .ac-my-stat { display:flex; justify-content:space-between; align-items:center; }
        .ac-my-stat-item { font-size:11px; letter-spacing:1px; }

        /* RIGHT sidebar — hidden on mobile */
        .ac-right {
          width: clamp(160px,16vw,220px); border-left: 1px solid ${BORDER};
          display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
        }
        @media(max-width:860px) { .ac-right { display:none; } }
        .ac-right-row { display:flex; flex-direction:column; overflow-y:auto; flex:1; }
        .ac-team-row { padding:8px 12px; border-bottom:1px solid ${BORDER}; cursor:pointer; transition:background .15s; }
        .ac-team-row:active { background:rgba(255,255,255,.04); }

        /* ── TEAMS BOTTOM SHEET (mobile) ── */
        .ac-sheet-bg { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:40; }
        .ac-sheet {
          position:fixed; bottom:0; left:0; right:0; max-height:72vh;
          background:#0c0c10; border-top:1px solid ${BORDER}; z-index:41;
          overflow-y:auto; padding-bottom:env(safe-area-inset-bottom);
          animation:sheetUp .25s ease;
        }
        .ac-sheet-header { position:sticky; top:0; background:#0c0c10; padding:10px 14px;
          display:flex; justify-content:space-between; align-items:center;
          border-bottom:1px solid ${BORDER}; }

        /* ── BOTTOM TICKER ── */
        .ac-ticker { border-top:1px solid ${BORDER}; padding:6px 12px; display:flex;
          gap:14px; overflow-x:auto; flex-shrink:0; background:#060608; align-items:center;
          scrollbar-width:none; }
        .ac-ticker::-webkit-scrollbar { display:none; }
        .ac-ticker-item { flex-shrink:0; font-size:12px; color:#aaa; display:flex; gap:6px; align-items:center;
          background:#ffffff04; padding:3px 10px; border-radius:4px; border:1px solid ${BORDER}; }

        @media(max-width:860px){ .ac-ticker { display:none; } }
        .ac-teams-mobile-btn { display:none; }
        @media(max-width:860px){ .ac-teams-mobile-btn { display:flex; } }
      `}</style>

      <SquadModal isOpen={showSquad} onClose={() => { setShowSquad(false); setViewingTeam(null); }} squads={gs.squads} myTeamId={viewingTeam || effectiveMyTeamId} TEAMS={TEAMS} />
      <StatsModal  isOpen={showStats} onClose={() => setShowStats(false)} gs={multiGS || g.current} TEAMS={TEAMS} myTeamId={myTeamId} />

      {/* ── TOP BAR ── */}
      <div className="ac-top">
        {/* Left cluster */}
        <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
          <div className="ac-top-brand">IPL <span style={{ color:'#fff' }}>AUCTION</span></div>
          {isMulti && (
            <div className="ac-top-badge" style={{ background: '#333', border: '1px solid #444', letterSpacing: 2 }}>
              CODE: <span style={{ color: '#fff' }}>{roomCode}</span>
            </div>
          )}
          <div className="ac-top-badge">{gs.currentSetName}</div>
          {isMulti && <div className="ac-top-live">LIVE</div>}
          {/* Host controls — in topbar */}
          {isMulti && isHost && (
            <div style={{ display:'flex', gap:5, marginLeft:8, paddingLeft:10, borderLeft:`1px solid #1e1e1e` }}>
              <button className="ac-top-action-btn" onClick={() => gs.isPaused ? emit('resume-game') : emit('pause-game')}>{gs.isPaused?'RESUME':'PAUSE'}</button>
              <button className="ac-top-action-btn red" onClick={() => { if(window.confirm('End auction early?')) emit('end-game'); }}>END</button>
            </div>
          )}
        </div>

        {/* Timer (center) */}
        <div className="ac-top-timer" style={{
          color: gs.isPaused ? '#666' : (gs.timer <= 5 ? '#ef4444' : GOLD),
          textShadow: gs.isPaused ? 'none' : (gs.timer <= 5 ? '0 0 20px #ef4444' : `0 0 20px ${GOLD}66`),
          animation: !gs.isPaused && gs.timer <= 5 ? 'tPulse .5s infinite' : 'none',
        }}>
          {gs.isPaused ? 'PAUSE' : String(gs.timer).padStart(2, '0')}
        </div>

        {/* Right cluster */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <div className="ac-top-me">
            <div style={{ width:8, height:8, borderRadius:'50%', background:myTeam?.color, boxShadow:`0 0 10px ${myTeam?.color}`, flexShrink:0 }} />
            <span style={{ fontWeight:700, fontSize:14, color:myTeam?.color }}>{myTeam?.short}</span>
            <span style={{ color:GOLD, fontSize:13, fontWeight:700 }}>₹{(gs.purses[effectiveMyTeamId]||0).toFixed(1)} Cr</span>
          </div>
          <button className="ac-top-btn" onClick={() => { setViewingTeam(effectiveMyTeamId); setShowSquad(true); }}>
            SQUAD ({gs.squads[effectiveMyTeamId]?.length || 0})
          </button>
          <button className="ac-top-btn ac-teams-mobile-btn" onClick={() => setShowTeams(true)}>TEAMS</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ac-body">
        {/* LEFT: player card */}
        <div className="ac-left">
          <div style={{ textAlign:'center', animation:'fadeUp .4s ease' }}>
            {/* Avatar */}
            <div style={{ width:110, height:110, borderRadius:'50%', margin:'0 auto 14px', overflow:'hidden', border:`2px solid ${ROLE_C[player.role]}40`, background:`${ROLE_C[player.role]}12`, display:'flex',alignItems:'center',justifyContent:'center', boxShadow:`0 0 30px ${ROLE_C[player.role]}20` }}>
              {player.name.toLowerCase() === 'virat kohli'
                ? <img src={kohliImg} alt={player.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
                : <span style={{ fontSize:52 }}>{ROLE_EMOJI[player.role]}</span>
              }
            </div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, color:'#fff', letterSpacing:2, lineHeight:1.1, marginBottom:4 }}>{player.name.toUpperCase()}</div>
            <div style={{ color:ROLE_C[player.role], fontSize:11, fontWeight:700, letterSpacing:3, marginBottom:16 }}>{ROLE_L[player.role]} · {player.overseas ? 'OVERSEAS' : 'INDIAN'}</div>

            {/* Stats */}
            {[['BASE PRICE', fmt(player.base), GOLD], ['CATEGORY', player.setName.toUpperCase(), '#aaa']].map(([label,val,c]) => (
              <div key={label} style={{ background:'rgba(255,255,255,.03)', border:`1px solid ${BORDER}`, borderRadius:8, padding:'10px 8px', marginBottom:8 }}>
                <div style={{ color:'#444', fontSize:9, letterSpacing:2, marginBottom:4 }}>{label}</div>
                <div style={{ color:c, fontFamily:"'Bebas Neue'", fontSize:20 }}>{val}</div>
              </div>
            ))}

            {/* Bid history */}
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
                    {player.name.toLowerCase() === 'virat kohli'
                      ? <img src={kohliImg} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} />
                      : <span style={{ fontSize:28 }}>{ROLE_EMOJI[player.role]}</span>
                    }
                  </div>
                  <div>
                    <div className="ac-player-name">{player.name.toUpperCase()}</div>
                    <div className="ac-player-meta" style={{ color:ROLE_C[player.role] }}>{ROLE_L[player.role]} · {player.overseas?'OVERSEAS':'INDIAN'}</div>
                    <div style={{ fontSize:10, color:'#444', letterSpacing:1, marginTop:2 }}>Base: {fmt(player.base)} · #{gs.currentIdx + 1}/{gs.playerQueue.length}</div>
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
                    {iLeading ? (
                      <div style={{ background:`${myTeam?.color}20`, border:`2px solid ${myTeam?.color}80`, borderRadius:8, padding:'14px 30px', color:myTeam?.color, fontWeight:700, fontSize:15, letterSpacing:1, textAlign:'center' }}>
                        ✓ YOU&apos;RE LEADING — {fmt(gs.currentBid)}
                      </div>
                    ) : (
                      <button
                        onClick={handleBid}
                        disabled={!canBid}
                        style={{
                          width:'100%', background: canBid ? `linear-gradient(135deg,${myTeam?.color}40,${myTeam?.color}20)` : '#0e0e0e',
                          border: `2px solid ${canBid ? myTeam?.color : '#2a2a2a'}`, borderRadius:8, padding:'15px 0',
                          color: canBid ? myTeam?.color : '#3a3a3a', cursor: canBid ? 'pointer' : 'not-allowed',
                          boxShadow: canBid ? `0 0 28px ${myTeam?.color}44` : 'none', transition:'all 0.2s',
                          display:'flex', flexDirection:'column', alignItems:'center', gap:2
                        }}
                      >
                        {canBid ? (
                          <>
                            <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.8rem', letterSpacing:3 }}>BID {fmtIncrement(gs.currentBid, nextPrice)}</span>
                            <span style={{ fontFamily:"'Courier Prime'", fontSize:10, opacity:0.8, letterSpacing:2 }}>{fmt(nextPrice)} total</span>
                          </>
                        ) : (
                          <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.5rem', letterSpacing:2 }}>{player.overseas && osCount >= 8 ? 'MAX 8 OVERSEAS' : 'INSUFFICIENT FUNDS'}</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bid log */}
                {gs.bidLog.length > 0 && (
                  <div className="ac-bid-log">
                    {gs.bidLog.slice(0,5).map((b,i) => {
                      const t = TEAMS.find(t => t.id === b.teamId);
                      return (
                        <div key={i} className="ac-log-row" style={{ background:i===0?`${t?.color}12`:'transparent', animation:i===0?'rowIn .2s ease':'none', opacity:Math.max(.1,1-i*.18) }}>
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
              </div>

              {/* ── FIXED BID STRIP ── */}
              <div className="ac-bid-strip">
                {/* My status row */}
                <div className="ac-my-stat">
                  <span className="ac-my-stat-item" style={{ color:'#444' }}>
                    <span style={{ color:myTeam?.color, fontWeight:700 }}>{myTeam?.short}</span>
                    {' · '}₹{(gs.purses[effectiveMyTeamId]||0).toFixed(1)} Cr
                    {' · '}{gs.squads[effectiveMyTeamId]?.length||0} players
                  </span>
                  <span style={{ fontSize:10, color:'#333', letterSpacing:2 }}>#{gs.currentIdx+1}/{gs.playerQueue.length}</span>
                </div>

                {/* THE BID BUTTON — fixed height, never moves */}
                {iLeading ? (
                  <div className="ac-bid-btn" style={{ background:`${myTeam?.color}20`, border:`2px solid ${myTeam?.color}80`, color:myTeam?.color }}>
                    <span>✓ YOU&apos;RE LEADING</span>
                    <span className="ac-bid-btn-sub">{fmt(gs.currentBid)}</span>
                  </div>
                ) : (
                  <button
                    className="ac-bid-btn"
                    onClick={handleBid}
                    disabled={!canBid}
                    style={{
                      background: canBid ? `linear-gradient(135deg,${myTeam?.color}55,${myTeam?.color}25)` : '#111',
                      border: `2px solid ${canBid ? myTeam?.color : '#1e1e1e'}`,
                      color: canBid ? myTeam?.color : '#2a2a2a',
                      boxShadow: canBid ? `0 0 24px ${myTeam?.color}33` : 'none',
                    }}
                  >
                    {canBid ? (
                      <>
                        <span style={{ fontSize:'1.6rem' }}>{fmtIncrement(gs.currentBid, nextPrice)}</span>
                        <span className="ac-bid-btn-sub">{fmt(nextPrice)} total · tap to bid</span>
                      </>
                    ) : (
                      <span>{player.overseas && osCount >= 8 ? 'MAX 8 OVERSEAS' : 'CANNOT BID'}</span>
                    )}
                  </button>
                )}
              </div>
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
                      <div style={{ width:7,height:7,borderRadius:'50%',background:team.color,boxShadow:`0 0 8px ${team.color}` }} />
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
        </div>
      </div>

      {/* ── TICKER (desktop only) ── */}
      <div className="ac-ticker">
        <span style={{ fontSize:9, color:GOLD, letterSpacing:4, fontWeight:900, flexShrink:0 }}>SALES</span>
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
                      <div style={{ width:9,height:9,borderRadius:'50%',background:team.color,boxShadow:`0 0 10px ${team.color}` }} />
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
        <button onClick={() => selected.length === playersNeeded && onSubmit(selected)} disabled={selected.length !== playersNeeded}
          style={{ background:selected.length===playersNeeded?`linear-gradient(135deg,${GOLD},#9a7610)`:'#111', border:`1px solid ${selected.length===playersNeeded?GOLD:'#333'}`, borderRadius:6, padding:'14px 48px', color:selected.length===playersNeeded?'#000':'#555', fontWeight:900, fontSize:16, letterSpacing:4, cursor:selected.length===playersNeeded?'pointer':'not-allowed', fontFamily:"'Barlow Condensed'" }}>
          SUBMIT PLAYING XI
        </button>
      </div>
    </div>
  );
}
