'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, fmt, nextBid } from '../GameContext';
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import { StatsModal } from '../../src/StatsModal';
import { SquadModal } from '../../src/SquadModal';

const kohliImg = '/assets/Kohli.avif';

export default function AuctionPage() {
  const router = useRouter();
  const {
    gs, isMulti, effectiveMyTeamId, humanBid, submitXI,
    showSquad, setShowSquad, showStats, setShowStats,
    viewingTeam, setViewingTeam, emit, isHost, multiGS, g,
    lobbyPlayers, myName, myTeamId
  } = useGame();

  if (!gs) {
    return null;
  }

  // Selection Phase
  if (gs.phase === "selection") {
    return <SelectionScreen
      mySquad={gs.squads[effectiveMyTeamId] || []}
      onSubmit={submitXI}
      submitted={isMulti ? gs.selections[effectiveMyTeamId] : false}
      playersNeeded={11}
    />;
  }

  // Finished Phase → go to results
  if (gs.phase === "finished") {
    router.push("/results");
    return null;
  }

  const player = gs.playerQueue[gs.currentIdx];
  const myTeam = TEAMS.find(t => t.id === effectiveMyTeamId);
  const bidderTeam = gs.currentBidder ? TEAMS.find(t => t.id === gs.currentBidder) : null;
  const osCount = (gs.squads[effectiveMyTeamId] || []).filter(p => p.overseas).length;
  const maxSquadSize = (gs.playerQueue?.length || 0) <= 200 ? 15 : 25;
  const canBid = gs.phase === "bidding" && gs.currentBidder !== effectiveMyTeamId
    && (gs.purses[effectiveMyTeamId] || 0) >= (gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid))
    && (gs.squads[effectiveMyTeamId]?.length || 0) < maxSquadSize && (!player.overseas || osCount < 8);
  const iLeading = gs.currentBidder === effectiveMyTeamId;

  const progresses = {};
  const maxPurse = 120;
  TEAMS.forEach(team => {
    progresses[team.id] = (gs?.purses?.[team.id] || 0) / maxPurse;
  });

  return (
    <div style={{ fontFamily: "'Rajdhani',sans-serif", background: BG, color: "#fff", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @keyframes sold{0%{transform:scale(0.4);opacity:0}65%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes rowIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;background:transparent}
        ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
        button{transition:filter .15s,transform .15s!important}
        button:hover:not(:disabled){filter:brightness(1.18)!important;transform:translateY(-1px)!important}
        .ipl-topbar{padding:6px 14px!important}
        .ipl-topbar-title{font-size:clamp(14px,1.5vw,22px)!important}
        .ipl-topbar-timer{font-size:clamp(26px,3vw,40px)!important;min-width:40px!important}
        .ipl-left{width:clamp(180px,18vw,264px)!important;padding:10px!important}
        .ipl-right{width:clamp(150px,16vw,240px)!important}
        .ipl-center{padding:12px 10px!important}
        .ipl-sold-text{font-size:clamp(48px,7vw,86px)!important}
        .ipl-bid-amount{font-size:clamp(40px,6vw,72px)!important}
        .ipl-bid-btn{padding:12px 24px!important;font-size:clamp(13px,1.4vw,19px)!important}
        .ipl-ticker{padding:5px 12px!important}
        @media(max-width:900px){.ipl-left,.ipl-right{display:none!important}.ipl-center{padding:10px 8px!important}.ipl-topbar{flex-wrap:wrap;gap:4px}}
      `}</style>

      <SquadModal isOpen={showSquad} onClose={() => { setShowSquad(false); setViewingTeam(null); }} squads={gs.squads} myTeamId={viewingTeam || effectiveMyTeamId} TEAMS={TEAMS} />
      <StatsModal isOpen={showStats} gs={gs} onClose={() => setShowStats(false)} />

      {/* TOP BAR */}
      <div className="ipl-topbar" style={{ background: "linear-gradient(90deg,#0B0D16 0%,#141008 50%,#0B0D16 100%)", borderBottom: `1px solid ${BORDER}`, padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="ipl-topbar-title" style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: GOLD, letterSpacing: 3 }}>BIDWICKET IPL AUCTION</div>
          <div style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30`, borderRadius: 4, padding: "2px 10px", fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 1 }}>{gs.currentSetName}</div>
          {isMulti && <div style={{ background: "#22D3EE18", border: "1px solid #22D3EE30", borderRadius: 4, padding: "2px 8px", fontSize: 9, color: "#22D3EE", letterSpacing: 1 }}>LIVE</div>}
          <button onClick={() => setShowStats(true)} style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}40`, color: GOLD, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer", marginLeft: 8 }}>STATS</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#444", fontSize: 11, letterSpacing: 3 }}>PLAYER</span>
          <span style={{ color: "#aaa", fontWeight: 700, fontSize: 14 }}>{gs.currentIdx + 1} / {gs.playerQueue.length}</span>
          {isMulti && isHost && (
            <div style={{ display: "flex", gap: 6, marginLeft: 16, borderLeft: `1px solid ${BORDER}`, paddingLeft: 16 }}>
              <button onClick={() => gs.isPaused ? emit("resume-game") : emit("pause-game")} style={{ background: "transparent", border: "1px solid #FFCA28", borderRadius: 4, color: "#FFCA28", padding: "4px 12px", cursor: "pointer", fontWeight: "bold" }}>
                {gs.isPaused ? "RESUME" : "PAUSE"}
              </button>
              <button onClick={() => { if (window.confirm("Are you sure you want to end the auction early?")) { emit("end-game"); } }} style={{ background: "transparent", border: "1px solid #ef4444", borderRadius: 4, color: "#ef4444", padding: "4px 12px", cursor: "pointer", fontWeight: "bold" }}>
                END
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setViewingTeam(effectiveMyTeamId); setShowSquad(true); }} style={{ background: "#22D3EE22", color: "#22D3EE", border: "1px solid #22D3EE55", borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontWeight: "bold", fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 1 }}>
            MY SQUAD
          </button>
          <button onClick={() => setShowStats(true)} style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}40`, color: GOLD, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>📊 STATS</button>
        </div>
        <div className="ipl-topbar-timer" style={{
          fontFamily: "'Bebas Neue'", fontSize: 40, letterSpacing: 2, minWidth: 56, textAlign: "center", lineHeight: 1,
          color: gs.isPaused ? "#888" : (gs.timer <= 5 ? "#ef4444" : GOLD),
          textShadow: gs.isPaused ? "none" : (gs.timer <= 5 ? "0 0 24px #ef4444" : `0 0 24px ${GOLD}66`),
          animation: !gs.isPaused && gs.timer <= 5 ? "timerPulse .5s infinite" : "none",
        }}>
          {gs.isPaused ? "PAUSE" : String(gs.timer).padStart(2, "0")}
          {isHost && isMulti && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <button onClick={() => { const curr = gs.timerDuration || 10; const val = prompt("Set new bid timer duration (5 to 60 seconds):", curr); if (val && !isNaN(val)) emit("set-timer-duration", { duration: parseInt(val) }); }} style={{ background: "#111", border: `1px solid #333`, color: "#888", fontSize: 10, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }} title="Edit Timer Length">
                EDIT TIMER ⏱
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: myTeam?.color, boxShadow: `0 0 12px ${myTeam?.color}` }} />
          <span style={{ color: "#fff", fontWeight: 900, letterSpacing: 1, fontSize: 16 }}>{myTeam?.short} ★</span>
          <span style={{ color: GOLD, fontSize: 14, fontWeight: 800, textShadow: `0 0 10px ${GOLD}33` }}>₹{(gs.purses[effectiveMyTeamId] || 0).toFixed(1)} Cr <span style={{ color: "#555", fontSize: 11, fontWeight: 400 }}>· {gs.squads[effectiveMyTeamId]?.length || 0} pl</span></span>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="ipl-left" style={{ width: 300, padding: "20px 14px", borderRight: `1px solid ${BORDER}`, overflowY: "auto", flexShrink: 0, background: `linear-gradient(180deg, ${CARD}, transparent)` }}>
          <div style={{ textAlign: "center", animation: "fadeUp .4s ease-out" }}>
            <div style={{ background: `${ROLE_C[player.role]}15`, width: 140, height: 140, borderRadius: "50%", margin: "0 auto 24px", overflow: "hidden", border: `2px solid ${ROLE_C[player.role]}40`, boxShadow: `0 0 40px ${ROLE_C[player.role]}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {player.name.toLowerCase() === "virat kohli" ? (
                <img src={kohliImg} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
              ) : (
                <span style={{ fontSize: 72 }}>{ROLE_EMOJI[player.role]}</span>
              )}
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#fff", letterSpacing: 2, marginBottom: 8, lineHeight: 1.1 }}>{player.name.toUpperCase()}</div>
            <div style={{ color: ROLE_C[player.role], fontSize: 13, fontWeight: 700, letterSpacing: 3, marginBottom: 24 }}>{ROLE_L[player.role]} · {player.overseas ? "OVERSEAS" : "INDIAN"}</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 10px" }}>
                <div style={{ color: "#555", fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>BASE PRICE</div>
                <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 28 }}>{fmt(player.base)}</div>
              </div>
              <div style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 10px" }}>
                <div style={{ color: "#555", fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>CATEGORY</div>
                <div style={{ color: "#fff", fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1 }}>{player.setName.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ marginTop: 30, padding: 16, background: `${GOLD}08`, borderRadius: 12, border: `1px dashed ${GOLD}30` }}>
              <div style={{ fontSize: 11, color: GOLD, opacity: 0.7, fontStyle: "italic" }}>&quot;A key player to watch in this set. Expected to command a high premium.&quot;</div>
            </div>
            {gs.bidLog.length > 0 && (
              <div style={{ marginTop: 30, textAlign: "left" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: "#555", letterSpacing: 3, marginBottom: 12 }}>BID HISTORY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {gs.bidLog.map((b, i) => {
                    const t = TEAMS.find(team => team.id === b.teamId);
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: i === 0 ? `${t?.color}15` : "transparent", padding: i === 0 ? "6px 10px" : "2px 0", borderRadius: 6, border: i === 0 ? `1px solid ${t?.color}30` : "none" }}>
                        <span style={{ color: t?.color, fontWeight: 800, fontSize: 13 }}>{t?.short}</span>
                        <span style={{ color: i === 0 ? "#fff" : "#999", fontWeight: 700, fontSize: i === 0 ? 14 : 12 }}>{fmt(b.bid)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ipl-center" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
          {[260, 400, 540].map(s => <div key={s} style={{ position: "absolute", width: s, height: s, border: "1px solid rgba(212,175,55,0.025)", borderRadius: "50%", pointerEvents: "none" }} />)}

          {gs.phase === "sold" && (
            <div style={{ textAlign: "center", animation: "sold .4s ease-out", zIndex: 2 }}>
              <div className="ipl-sold-text" style={{ fontFamily: "'Bebas Neue'", fontSize: 86, color: GOLD, letterSpacing: 10, textShadow: `0 0 60px ${GOLD}, 0 0 120px ${GOLD}44`, lineHeight: 0.9 }}>SOLD!</div>
              <div style={{ color: bidderTeam?.color, fontSize: 20, fontWeight: 700, letterSpacing: 2, marginTop: 10 }}>{bidderTeam?.name}</div>
              <div style={{ color: GOLD, fontSize: 30, fontFamily: "'Bebas Neue'", letterSpacing: 4, marginTop: 4 }}>{fmt(gs.currentBid)}</div>
            </div>
          )}
          {gs.phase === "unsold" && (
            <div style={{ textAlign: "center", animation: "sold .4s ease-out", zIndex: 2 }}>
              <div className="ipl-sold-text" style={{ fontFamily: "'Bebas Neue'", fontSize: 86, color: "#ef4444", letterSpacing: 10, textShadow: "0 0 60px #ef4444", lineHeight: 0.9 }}>UNSOLD</div>
              <div style={{ color: "#555", fontSize: 15, marginTop: 10, letterSpacing: 3 }}>No bids received</div>
            </div>
          )}

          {gs.phase === "bidding" && (<>
            <div style={{ color: "#444", fontSize: 10, letterSpacing: 5, marginBottom: 6 }}>CURRENT BID</div>
            <div className="ipl-bid-amount" style={{ fontFamily: "'Bebas Neue'", fontSize: 72, color: GOLD, letterSpacing: 5, lineHeight: 1, textShadow: `0 0 40px ${GOLD}44` }}>{fmt(gs.currentBid)}</div>
            {bidderTeam ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: `${bidderTeam.color}16`, border: `1px solid ${bidderTeam.color}40`, borderRadius: 20, padding: "6px 18px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: bidderTeam.color, boxShadow: `0 0 8px ${bidderTeam.color}` }} />
                <span style={{ color: bidderTeam.color, fontWeight: 700, fontSize: 14 }}>{bidderTeam.name}</span>
                <span style={{ color: "#555", fontSize: 13 }}>is leading</span>
              </div>
            ) : <div style={{ color: "#444", fontSize: 14, marginTop: 10, letterSpacing: 2 }}>↑ BASE PRICE — No bids yet</div>}
            <div style={{ marginTop: 30 }}>
              {iLeading ? (
                <div style={{ background: `${myTeam?.color}20`, border: `2px solid ${myTeam?.color}80`, borderRadius: 8, padding: "14px 30px", color: myTeam?.color, fontWeight: 700, fontSize: 15, letterSpacing: 1, textAlign: "center" }}>✓ YOU&apos;RE LEADING — {fmt(gs.currentBid)}</div>
              ) : (
                <button className="ipl-bid-btn" onClick={humanBid} disabled={!canBid}
                  style={{ background: canBid ? `linear-gradient(135deg,${myTeam?.color}40,${myTeam?.color}20)` : "#0e0e0e", border: `2px solid ${canBid ? myTeam?.color : "#2a2a2a"}`, borderRadius: 8, padding: "15px 44px", color: canBid ? myTeam?.color : "#3a3a3a", fontSize: 19, fontWeight: 900, cursor: canBid ? "pointer" : "not-allowed", letterSpacing: 2, fontFamily: "'Barlow Condensed'", boxShadow: canBid ? `0 0 28px ${myTeam?.color}44` : "none" }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 2 }}>
                    {canBid ? `BID ${fmt(gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid))}` :
                      (player.overseas && osCount >= 8 ? "MAX 8 OS" : "INSUFFICIENT")}
                  </div>
                </button>
              )}
            </div>
            <div style={{ marginTop: 22, width: "100%", maxWidth: 380 }}>
              {gs.bidLog.map((b, i) => {
                const t = TEAMS.find(t => t.id === b.teamId);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 12px", borderRadius: 5, marginBottom: 3, background: i === 0 ? `${t?.color}12` : "transparent", animation: i === 0 ? "rowIn .2s ease-out" : "none", opacity: Math.max(0.12, 1 - i * 0.14) }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: t?.color }} />
                      <span style={{ color: t?.color, fontWeight: 700, fontSize: 13 }}>{t?.short}</span>
                      {b.teamId === effectiveMyTeamId && <span style={{ fontSize: 10, background: `${t?.color}33`, color: t?.color, padding: "1px 6px", borderRadius: 8 }}>YOU</span>}
                      {b.playerName && <span style={{ fontSize: 10, color: "#888" }}>{b.playerName}</span>}
                    </div>
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>{fmt(b.bid)}</span>
                  </div>
                );
              })}
            </div>
          </>)}
        </div>

        {/* RIGHT: Teams */}
        <div className="ipl-right" style={{ width: 240, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "8px 14px", fontSize: 10, letterSpacing: 3, color: "#444", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>FRANCHISES</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {[...TEAMS].sort((a, b) => (gs.purses[b.id] || 0) - (gs.purses[a.id] || 0)).map(team => {
              const isLead = team.id === gs.currentBidder, isMe = team.id === effectiveMyTeamId;
              return (
                <div key={team.id} onClick={() => { setViewingTeam(team.id); setShowSquad(true); }} style={{
                  cursor: "pointer", padding: "10px 14px", borderLeft: `4px solid ${isLead ? team.color : "transparent"}`,
                  background: isLead ? `${team.color}20` : isMe ? `${team.color}10` : "transparent",
                  borderBottom: `1px solid ${BORDER}`, transition: "all .2s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: team.color, boxShadow: `0 0 10px ${team.color}` }} />
                      <span style={{ fontWeight: 800, color: progresses[team.id] < 0.2 ? "#ef4444" : "#fff", fontSize: 15, letterSpacing: 1 }}>{team.short}</span>
                      {isMe && <span style={{ fontSize: 10, color: team.color }}>YOU</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: team.color, fontWeight: 900, fontSize: 16, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>{fmt(gs.purses[team.id])}</div>
                      <div style={{ fontSize: 9, color: "#666", letterSpacing: 1, fontWeight: 600 }}>{gs.squads[team.id]?.length} PLAYS</div>
                    </div>
                  </div>
                  <div style={{ height: 2, background: "#111", marginTop: 6, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: team.color, width: `${progresses[team.id] * 100}%`, transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM TICKER */}
      <div className="ipl-ticker" style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 20px", display: "flex", gap: 28, overflowX: "auto", flexShrink: 0, background: "#05070A", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: GOLD, letterSpacing: 4, fontWeight: 900, flexShrink: 0 }}>RECENT HISTORY</span>
        {(gs.auctionLog || []).slice(0, 15).map((item, i) => {
          const t = TEAMS.find(t => t.id === item.bidder);
          return (
            <div key={i} style={{ flexShrink: 0, fontSize: 14, color: "#ddd", display: "flex", gap: 8, alignItems: "center", background: "#ffffff05", padding: "4px 12px", borderRadius: 6, border: `1px solid ${BORDER}` }}>
              <span style={{ fontWeight: 600 }}>{item.player.name}</span>
              {item.sold ? (<><span style={{ color: GOLD }}>→</span><span style={{ color: t?.color, fontWeight: 900 }}>{item.bidder}</span><span style={{ color: "#fff", fontWeight: 800 }}>{fmt(item.price)}</span></>) : <span style={{ color: "#ef4444", fontWeight: 800 }}>UNSOLD</span>}
            </div>
          );
        })}
        {(!gs.auctionLog || gs.auctionLog.length === 0) && <span style={{ color: "#555", fontSize: 12 }}>Auction in progress...</span>}
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} gs={multiGS || g.current} TEAMS={TEAMS} myTeamId={myTeamId} />
      <SquadModal isOpen={showSquad} onClose={() => { setShowSquad(false); setViewingTeam(null); }} squads={(multiGS || g.current)?.squads || {}} myTeamId={viewingTeam || effectiveMyTeamId} TEAMS={TEAMS} />
    </div>
  );
}

// ── Selection Screen (inline) ──
function SelectionScreen({ mySquad, onSubmit, submitted, playersNeeded = 11 }) {
  const [selected, setSelected] = useState([]);
  const toggle = (p) => {
    setSelected(prev =>
      prev.find(x => x.name === p.name)
        ? prev.filter(x => x.name !== p.name)
        : prev.length < playersNeeded ? [...prev, p] : prev
    );
  };
  if (submitted) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, color: GOLD, letterSpacing: 6 }}>XI SUBMITTED!</div>
        <div style={{ color: "#555", fontSize: 14, marginTop: 12, letterSpacing: 3 }}>WAITING FOR OTHER TEAMS...</div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", padding: "24px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(28px,4vw,48px)", color: GOLD, letterSpacing: 6 }}>SELECT YOUR PLAYING XI</div>
        <div style={{ color: "#555", fontSize: 12, letterSpacing: 3, marginTop: 6 }}>
          {selected.length}/{playersNeeded} selected — {playersNeeded - selected.length} more needed
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, maxWidth: 1000, margin: "0 auto 28px" }}>
        {mySquad.map((p, i) => {
          const sel = !!selected.find(x => x.name === p.name);
          const rc = ROLE_C[p.role];
          return (
            <div key={i} onClick={() => toggle(p)}
              style={{ background: sel ? `${rc}18` : CARD, border: `1px solid ${sel ? rc : BORDER}`, borderRadius: 10, padding: "12px", cursor: "pointer", transition: "all .2s", transform: sel ? "translateY(-3px)" : "none", boxShadow: sel ? `0 0 20px ${rc}33` : "none" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: sel ? rc : "#ddd", letterSpacing: 1 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: rc, marginTop: 4, fontWeight: 600 }}>{ROLE_L[p.role]}</div>
              <div style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>₹{p.soldFor?.toFixed(2) || p.base?.toFixed(2)} Cr</div>
              {sel && <div style={{ fontSize: 9, color: rc, marginTop: 6, letterSpacing: 2, fontWeight: 700 }}>✓ SELECTED</div>}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => selected.length === playersNeeded && onSubmit(selected)}
          disabled={selected.length !== playersNeeded}
          style={{ background: selected.length === playersNeeded ? `linear-gradient(135deg, ${GOLD}, #9a7610)` : "#1a1a1a", border: `1px solid ${selected.length === playersNeeded ? GOLD : "#333"}`, borderRadius: 6, padding: "14px 50px", color: selected.length === playersNeeded ? "#000" : "#555", fontWeight: 900, fontSize: 16, letterSpacing: 4, cursor: selected.length === playersNeeded ? "pointer" : "not-allowed", fontFamily: "'Barlow Condensed'" }}>
          SUBMIT PLAYING XI
        </button>
      </div>
    </div>
  );
}
