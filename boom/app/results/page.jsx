'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, fmt } from '../GameContext';
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import { calculateLeaderboard, selectPlayingXI, getPlayerRating } from '../data/playerRatings';
import ALL_PLAYERS from '../data/Players.json';
import { getBackendUrl } from '../lib/backendUrl';

// ── Medal helpers ──────────────────────────────────────────────────────────
const MEDAL = ['Gold', 'Silver', 'Bronze'];
const medalColor = (idx) =>
  idx === 0 ? GOLD : idx === 1 ? '#aaa' : idx === 2 ? '#CD7F32' : '#444';

// ── Team logos (from /public/assets) ────────────────────────────────────────
const TEAM_LOGOS = {
  CSK:  '/assets/CSK.png',
  MI:   '/assets/MI.png',
  RCB:  '/assets/RCB.png',
  KKR:  '/assets/KKR.png',
  SRH:  '/assets/SRH.png',
  DC:   '/assets/DC.png',
  PBKS: '/assets/PBKS.png',
  RR:   '/assets/RR.png',
  GT:   '/assets/GT.png',
  LSG:  '/assets/LSG.png',
};

function buildLeaderboardResults(gs, mode, teams) {
  const teamsPayload = teams.map((team) => {
    const squad = gs.squads?.[team.id] || [];
    const rawXI = gs.playingXI?.[team.id] || [];

    let xi;
    if (rawXI.length > 0 && rawXI.length <= 11) {
      xi = rawXI;
    } else if (squad.length > 0) {
      xi = selectPlayingXI(squad, mode);
    } else {
      xi = [];
    }

    return {
      teamId: team.id,
      teamName: team.name,
      squad,
      playingXI: xi,
    };
  });

  return calculateLeaderboard(teamsPayload, mode);
}

function normalizeRole(role) {
  const value = String(role || '').toUpperCase();
  if (value.includes('WK')) return 'wicket_keeper';
  if (value.includes('BOWL')) return 'bowler';
  if (value.includes('AR')) return 'all_rounder';
  return 'batsman';
}

function getResolvedTeamIds(gs, mode) {
  if (Array.isArray(gs?.activeTeamIds) && gs.activeTeamIds.length > 0) {
    return gs.activeTeamIds;
  }

  const isRivals = gs?.roomType === 'rivals' || String(mode || '').toLowerCase() === 'rivals';
  if (isRivals) {
    const participantTeamIds = Array.from(new Set(
      (gs?.participants || [])
        .map((player) => player?.teamId)
        .filter(Boolean)
    ));

    if (participantTeamIds.length > 0) {
      return participantTeamIds;
    }

    const teamsWithSquads = TEAMS
      .map((team) => team.id)
      .filter((teamId) => {
        const squadSize = gs?.squads?.[teamId]?.length || 0;
        const xiSize = gs?.playingXI?.[teamId]?.length || 0;
        return squadSize > 0 || xiSize > 0;
      });

    if (teamsWithSquads.length > 0) {
      return teamsWithSquads;
    }
  }

  return TEAMS.map((team) => team.id);
}

export default function ResultsPage() {
  const router = useRouter();
  const { gs, isMulti, effectiveMyTeamId, handleRestart, lobbyMode, auctionMode, lobbyPlayers } = useGame();
  const [showLoading, setShowLoading] = useState(true);
  const [archivedGs, setArchivedGs] = useState(null);
  const [archivedMode, setArchivedMode] = useState(null);
  const [archivedRoomCode, setArchivedRoomCode] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (gs || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    const mode = params.get('mode');
    if (!room) {
      setLoadError('Results not found.');
      setShowLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${getBackendUrl()}/api/completed-rooms/${encodeURIComponent(room)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Completed room not found');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setArchivedGs(data.gameState ? {
          ...data.gameState,
          auctionMode: data.mode || data.gameState?.auctionMode || mode || null,
          roomType: data.roomType || data.gameState?.roomType || null,
          activeTeamIds: data.activeTeamIds || data.gameState?.activeTeamIds || null,
          rivalsMatch: data.rivalsMatch || data.gameState?.rivalsMatch || null,
          participants: data.participants || data.gameState?.participants || [],
          squadLimit: data.squadLimit || data.gameState?.squadLimit || null,
          roomCode: data.code || data.gameState?.roomCode || room,
          roomName: data.name || data.gameState?.roomName || null,
        } : null);
        setArchivedMode(data.mode || mode || null);
        setArchivedRoomCode(data.code || room);
        setLoadError('');
        setShowLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError('This completed room is no longer available.');
        setShowLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gs]);

  useEffect(() => {
    if (gs) {
      const timer = setTimeout(() => setShowLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [gs]);

  const resolvedGs = gs || archivedGs;
  const isArchivedView = !gs && !!archivedGs;

  if (showLoading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div className="loading-spinner" style={{ width: 60, height: 60, border: `4px solid ${GOLD}22`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 6, textAlign: 'center' }}>
          {resolvedGs ? 'CALCULATING FINAL SQUADS...' : 'LOADING RESULTS...'}
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!resolvedGs) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
        <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 4 }}>RESULTS UNAVAILABLE</div>
        <div style={{ color: '#777', fontSize: 13, letterSpacing: 1 }}>{loadError || 'We could not load that result snapshot.'}</div>
        <button
          onClick={() => router.push('/room?action=browse')}
          style={{ background: `linear-gradient(135deg,${GOLD},#9a7610)`, border: 'none', borderRadius: 6, padding: '10px 20px', color: '#000', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}
        >
          BACK TO ROOMS
        </button>
      </div>
    );
  }

  const mode = isArchivedView
    ? archivedMode || resolvedGs?.auctionMode || 'mega'
    : (isMulti ? lobbyMode : auctionMode) || resolvedGs?.auctionMode || 'mega';
  const isRivalsReplay = (resolvedGs?.roomType === 'rivals' || String(mode || '').toLowerCase() === 'rivals') && !isArchivedView;
  const restartHandler = isArchivedView
    ? () => router.push('/room?action=browse')
    : isRivalsReplay
      ? () => handleRestart('/room?action=rivals&autoFind=1')
      : handleRestart;
  return <Results gs={resolvedGs} myTeamId={effectiveMyTeamId} onRestart={restartHandler} mode={mode} isArchived={isArchivedView} archivedRoomCode={archivedRoomCode} lobbyPlayers={lobbyPlayers} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
function Results({ gs, myTeamId: mti, onRestart, mode, isArchived = false, archivedRoomCode = null, lobbyPlayers = [] }) {
  const activeTeamIds = getResolvedTeamIds(gs, mode);
  const displayTeams = TEAMS.filter((team) => activeTeamIds.includes(team.id));
  const isRivals = gs?.roomType === 'rivals' || String(mode || '').toLowerCase() === 'rivals';
  const rankings = buildLeaderboardResults(gs, mode, displayTeams);
  const teamOwnerMap = useMemo(() => {
    const source = Array.isArray(gs?.participants) && gs.participants.length > 0 ? gs.participants : lobbyPlayers;
    return new Map(
      (source || [])
        .filter((entry) => !entry?.isSpectator && entry?.teamId && entry?.name)
        .map((entry) => [entry.teamId, entry.name])
    );
  }, [gs?.participants, lobbyPlayers]);
  const getTeamOwnerName = useCallback((teamId) => teamOwnerMap.get(teamId) || '', [teamOwnerMap]);
  const getTeamLabel = useCallback((teamOrId, { short = false } = {}) => {
    const team = typeof teamOrId === 'string'
      ? displayTeams.find((entry) => entry.id === teamOrId) || TEAMS.find((entry) => entry.id === teamOrId)
      : teamOrId;
    if (!team) return '';
    const base = short ? team.short : team.name;
    const owner = getTeamOwnerName(team.id);
    return owner ? `${base} (${owner})` : base;
  }, [displayTeams, getTeamOwnerName]);
  const [activeId, setActiveId] = useState(() => (mti && activeTeamIds.includes(mti) ? mti : displayTeams[0]?.id || TEAMS[0].id));
  const [tab, setTab] = useState('squad');   // 'squad' | 'leaderboard'
  const team = displayTeams.find(t => t.id === activeId) || displayTeams[0];

  useEffect(() => {
    if (activeTeamIds.includes(activeId)) return;
    setActiveId((mti && activeTeamIds.includes(mti) ? mti : displayTeams[0]?.id) || TEAMS[0].id);
  }, [activeId, activeTeamIds, displayTeams, mti]);

  const soldCount   = (gs.auctionLog || []).filter(l =>  l.sold).length;
  const unsoldCount = (gs.auctionLog || []).filter(l => !l.sold).length;
  const rivalsWinner = isRivals ? rankings[0] : null;
  const rivalsRunner = isRivals ? rankings[1] : null;

  // For the active team: decide what to display
  const rawXI    = gs.playingXI?.[activeId] || [];
  const fullSquad = gs.squads?.[activeId] || [];

  // Edge-case: player may have submitted <11 or exactly 10 players.
  // If rawXI has ≥ 1 and ≤ 11 players, respect it; otherwise fall back to selectPlayingXI.
  const playingXI = rawXI.length > 0 && rawXI.length <= 11
    ? rawXI
    : fullSquad.length > 0
      ? selectPlayingXI(fullSquad, mode)
      : [];

  const displayList     = playingXI;
  const spent           = +(120 - (gs.purses?.[activeId] || 0)).toFixed(2);
  const teamTotalRating = playingXI.reduce((s, p) => s + getPlayerRating(p.name || p, mode), 0);
  const teamAvgRating   = playingXI.length ? Math.round(teamTotalRating / playingXI.length) : 0;

  // ── Clipboard share ──
  const shareText = useCallback(() => {
    const lines = displayList.map((p, i) => `${i + 1}. [${p.role}] ${p.name || p}`).join('\n');
    const text  = `IPL Auction — ${team?.name} Playing XI\n\n${lines}\n\nTotal Rating: ${teamTotalRating} pts | Avg: ${teamAvgRating} pts/player\n\nGenerated by www.iplauction.fun`;
    if (navigator.share) {
      navigator.share({ title: 'My IPL XI', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!')).catch(() => {});
    }
  }, [displayList, team, teamTotalRating, teamAvgRating]);

  // ── WhatsApp share ──
  const shareWhatsApp = useCallback(() => {
    const lines = displayList.map((p, i) => `${i + 1}. [${p.role}] ${p.name || p}`).join('\n');
    const text  = `*IPL Auction* — *${team?.name}* Playing XI\n\n${lines}\n\nTotal Rating: *${teamTotalRating} pts*\nGenerated by www.iplauction.fun`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [displayList, team, teamTotalRating]);

  // ── Download as plain text file ──
  const downloadSheet = useCallback(() => {
    const lines = displayList.map((p, i) => `${i + 1}. [${(p.role || '??').toUpperCase()}] ${p.name || p}  —  ${fmt(p.soldFor || p.base || 0)}`).join('\n');
    const header = `IPL AUCTION RESULTS\n${'═'.repeat(40)}\nTeam: ${team?.name}\nAuction Mode: ${(mode || 'N/A').toUpperCase()}\nPlaying XI (${playingXI.length} players)\n${'─'.repeat(40)}\n`;
    const footer = `\n${'─'.repeat(40)}\nTotal Rating : ${teamTotalRating} pts\nAvg Rating   : ${teamAvgRating} pts/player\nPurse Spent  : ${fmt(spent)}\nPurse Left   : ${fmt(gs.purses?.[activeId] || 0)}\n\nAuction Stats\n${'─'.repeat(40)}\nPlayers Sold  : ${soldCount}\nPlayers Unsold: ${unsoldCount}\n\n[Generated by www.iplauction.fun]`;
    const blob = new Blob([header + lines + footer], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${team?.short || 'IPL'}-Playing-XI.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [displayList, team, mode, playingXI, teamTotalRating, teamAvgRating, spent, soldCount, unsoldCount, gs, activeId]);

  // ── Audio playback ──
  useEffect(() => {
    const audio = new Audio('/assets/Ipl.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio playback prevented', e));
    
    const stopTimer = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 30000); // 30 seconds

    return () => {
      clearTimeout(stopTimer);
      audio.pause();
    };
  }, []);

  // ── Calculation ──
  const normalizedXI = playingXI.map((player) => ({ ...player, role: normalizeRole(player?.role) }));
  const batCount = normalizedXI.filter(p => p.role === 'batsman').length;
  const bowlCount = normalizedXI.filter(p => p.role === 'bowler').length;
  const wkCount = normalizedXI.filter(p => p.role === 'wicket_keeper').length;
  const isDisqualified = playingXI.length < 11 || batCount < 2 || bowlCount < 2 || wkCount < 1;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Rajdhani',sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .res-card{animation:fadeUp .35s ease-out both}
        .res-tab-btn{transition:all .2s;border-radius:6px 6px 0 0;font-family:'Barlow Condensed';font-size:13px;letter-spacing:2px;font-weight:700;cursor:pointer;border:none;padding:10px 28px}
        .res-team-pill{transition:all .2s;border-radius:4px;padding:6px 14px;cursor:pointer;font-weight:700;font-size:13px;font-family:'Rajdhani'}
        .res-action-btn:hover { filter: brightness(1.3); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: '#08090f', borderBottom: `1px solid ${BORDER}`, padding: 'clamp(14px,2vh,22px) clamp(16px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(24px,4vw,42px)', color: GOLD, letterSpacing: 6, lineHeight: 1 }}>IPL AUCTION COMPLETE</div>
          <div style={{ color: '#555', fontSize: 11, letterSpacing: 3, marginTop: 3 }}>
            {soldCount} SOLD · {unsoldCount} UNSOLD · {(mode || 'N/A').toUpperCase()} AUCTION{isArchived && archivedRoomCode ? ` · ROOM ${archivedRoomCode}` : ''}
          </div>
          {isRivals && rivalsWinner && (
            <div style={{ color: '#cbd5e1', fontSize: 12, letterSpacing: 1.5, marginTop: 8 }}>
              WINNER: <span style={{ color: TEAM_LOGOS[rivalsWinner.teamId] ? (displayTeams.find(t => t.id === rivalsWinner.teamId)?.color || GOLD) : GOLD, fontWeight: 700 }}>{getTeamLabel(rivalsWinner.teamId)}</span>
              {rivalsRunner ? <span style={{ color: '#64748b' }}> over {getTeamLabel(rivalsRunner.teamId)}</span> : null}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="https://whatsapp.com/channel/0029VbCeqwJ90x2z9PRli10E"
            target="_blank"
            rel="noreferrer"
            style={{ background:'#25D36615', border:'1px solid #25D36655', borderRadius: 6, padding: '10px 18px', color:'#25D366', fontWeight: 900, fontSize: 13, letterSpacing: 1.5, fontFamily: "'Barlow Condensed'", textDecoration: 'none' }}
          >
            JOIN WHATSAPP
          </a>
          <button
            onClick={onRestart}
            style={{ background: `linear-gradient(135deg,${GOLD},#9a7610)`, border: 'none', borderRadius: 6, padding: '10px 24px', color: '#000', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}
          >{isArchived ? 'BACK TO ROOMS' : 'PLAY AGAIN'}</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#0a0b12', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: 0, padding: '0 clamp(16px,4vw,48px)' }}>
        {[['squad', 'SQUADS'], ['leaderboard', 'LEADERBOARD']].map(([key, label]) => (
          <button key={key} className="res-tab-btn" onClick={() => setTab(key)}
            style={{ background: tab === key ? CARD : 'transparent', color: tab === key ? GOLD : '#555', borderBottom: tab === key ? `2px solid ${GOLD}` : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 'clamp(14px,2vh,24px) clamp(12px,4vw,40px)' }}>
        {tab === 'squad' && (
          <SquadTab
            gs={gs} mti={mti} mode={mode}
            teams={displayTeams}
            activeId={activeId} setActiveId={setActiveId}
            team={team} displayList={displayList} playingXI={playingXI} fullSquad={fullSquad}
            spent={spent} soldCount={soldCount} unsoldCount={unsoldCount}
            teamTotalRating={teamTotalRating} teamAvgRating={teamAvgRating}
            isDisqualified={isDisqualified}
            shareText={shareText} shareWhatsApp={shareWhatsApp} downloadSheet={downloadSheet}
            getTeamLabel={getTeamLabel}
          />
        )}
        {tab === 'leaderboard' && <LeaderboardTab gs={gs} mode={mode} mti={mti} teams={displayTeams} isRivals={isRivals} getTeamLabel={getTeamLabel} />}
      </div>

      <div style={{ padding: '0 40px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: '#333', letterSpacing: '1px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          IPL Auction Online is a fan-made simulator. 
          Data and ratings are attributed to <a href="https://www.iplt20.com" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>iplt20.com</a> & <a href="https://cricapi.com" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>CricAPI</a>.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Squad Tab
// ─────────────────────────────────────────────────────────────────────────────
function SquadTab({ gs, mti, mode, teams, activeId, setActiveId, team, displayList, playingXI, fullSquad, spent, soldCount, unsoldCount, teamTotalRating, teamAvgRating, isDisqualified, shareText, shareWhatsApp, downloadSheet, getTeamLabel }) {
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      {/* Disqualified Alert */}
      {isDisqualified && playingXI.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef444444', borderRadius: 12, padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: 28 }}>🚨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#ef4444', letterSpacing: 1 }}>SQUAD DISQUALIFIED</div>
            <div style={{ color: '#ef4444aa', fontSize: 13, letterSpacing: 1, marginTop: 2 }}>This team fails the minimum required criteria: 2 Batters, 2 Bowlers, 1 Wicketkeeper.</div>
          </div>
        </div>
      )}
      {/* ── Team selector ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {teams.map(t => (
          <button key={t.id} className="res-team-pill"
            onClick={() => setActiveId(t.id)}
            style={{ background: activeId === t.id ? t.color : 'transparent', border: `1px solid ${t.color}`, color: activeId === t.id ? '#000' : t.color }}>
            {getTeamLabel(t, { short: true })}{t.id === mti ? ' (YOU)' : ''}
          </button>
        ))}
      </div>

      {/* ── Team summary card ── */}
      <div className="res-card" style={{ background: `linear-gradient(135deg,${CARD},#0a0d15)`, border: `1px solid ${GOLD}30`, borderRadius: 14, padding: 20, marginBottom: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: 3, fontWeight: 700 }}>{team ? getTeamLabel(team) : ''}</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, color: '#fff', letterSpacing: 2 }}>
            {playingXI.length > 0
              ? playingXI.length === 11 ? 'FINAL PLAYING XI' : `PLAYING XI (${playingXI.length}/11)`
              : 'NO PLAYERS ACQUIRED'}
          </div>
          {fullSquad.length > 0 && playingXI.length !== fullSquad.length && (
            <div style={{ color: '#555', fontSize: 11, letterSpacing: 2 }}>{fullSquad.length} IN SQUAD · {playingXI.length} IN XI</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatBubble label="TOTAL RATING" val={`${teamTotalRating} PTS`} color={GOLD} />
          <StatBubble label="AVG RATING" val={`${teamAvgRating} PTS`} color="#22D3EE" />
          <StatBubble label="PURSE USED" val={fmt(spent)} color="#a78bfa" />
          <StatBubble label="PURSE LEFT" val={fmt(gs.purses?.[activeId] || 0)} color="#4ade80" />
        </div>
      </div>

      {/* ── Role breakdown warning if < 11 ── */}
      {playingXI.length < 11 && playingXI.length > 0 && (
        <div style={{ background: '#1a0e00', border: '1px solid #f59e0b50', borderRadius: 8, padding: '10px 16px', marginBottom: 14, color: '#f59e0b', fontSize: 12, letterSpacing: 2 }}>
          Only {playingXI.length} players selected — a full XI requires 11. The best available players from this squad are shown.
        </div>
      )}
      {playingXI.length === 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, textAlign: 'center', color: '#555', fontSize: 14, letterSpacing: 2, marginBottom: 18 }}>
          No players were acquired by {team ? getTeamLabel(team) : 'this team'} — they had ₹{gs.purses?.[activeId] || 120} Cr remaining.
        </div>
      )}

      {/* ── Player grid ── */}
      {displayList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8, marginBottom: 24 }}>
          {displayList.map((p, i) => {
            const pName = p.name || p;
            const rating = getPlayerRating(pName, mode);
            const pRec = ALL_PLAYERS.find(ap => ap.name === pName);
            const photoUrl = pRec?.photo_url;
            return (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: "transform 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ROLE_C[p.role]}
                onMouseOut={e => e.currentTarget.style.borderColor = BORDER}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {photoUrl ? (
                    <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: '#080808', border: `1px solid ${ROLE_C[p.role]}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={photoUrl} alt={pName} style={{ height: '95%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: ROLE_C[p.role] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: `1px solid ${ROLE_C[p.role]}50`, flexShrink: 0 }}>
                      {ROLE_EMOJI[p.role]}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#eee' }}>{pName}</div>
                    <div style={{ fontSize: 11, color: ROLE_C[p.role], marginTop: 2 }}>
                      {ROLE_L[p.role] || p.role}{p.overseas ? ' · ✈ OS' : ''}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}>{p.soldFor ? fmt(p.soldFor) : (p.base ? fmt(p.base) : '—')}</div>
                  <div style={{ color: '#444', fontSize: 10, letterSpacing: 1 }}>{rating} PTS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
        <ActionBtn onClick={downloadSheet} bg="#22D3EE" label="⬇ DOWNLOAD (TXT)" />
        <ActionBtn onClick={shareWhatsApp} bg="#25D366" label="💬 SHARE ON WHATSAPP" />
        <ActionBtn onClick={shareText} bg="#a78bfa" label="🔗 COPY / SHARE" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Tab
// ─────────────────────────────────────────────────────────────────────────────
function LeaderboardTab({ gs, mode, mti, teams, isRivals, getTeamLabel }) {
  const [rankings, setRankings] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const results = buildLeaderboardResults(gs, mode, teams);
    setRankings(results);
    // Auto-expand top 3
    if (results.length > 0) {
      const top3 = Object.fromEntries(results.slice(0, 3).map(r => [r.teamId, true]));
      setExpanded(top3);
    }
  }, [gs, mode, teams]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const tc     = (id) => teams.find(t => t.id === id)?.color || '#888';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Formula explanation */}
      <div style={{ background: '#0a0d15', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: 12, color: '#555', letterSpacing: 1, lineHeight: 1.8 }}>
        <span style={{ color: GOLD, fontWeight: 700 }}>HOW SCORES ARE CALCULATED</span>
        <br />
        Each team's <strong style={{ color: '#aaa' }}>Playing XI</strong> is evaluated: every player has a pre-set rating (out of 100) based on IPL 2025 performance &amp; expert analysis.
        The <strong style={{ color: '#aaa' }}>Total Score</strong> is the sum of all 11 player ratings. The <strong style={{ color: '#aaa' }}>Average Score</strong> is Total ÷ XI size.
        {mode?.toLowerCase() === 'mini' ? (
          <span style={{ color: '#777' }}>Minimum criteria: 2 Batters, 2 Bowlers, 1 Wicketkeeper. Teams failing this are <span style={{ color: '#ef4444' }}>DISQUALIFIED</span>.</span>
        ) : (
          <span style={{ color: '#777' }}>Selection rules: Best-rated 11 players, max 4 overseas, at least 1 wicket-keeper.</span>
        )}
        <br />
        Teams that submitted fewer than 11 players are scored on their submitted XI size.
        <br />
        <span style={{ color: '#333' }}>Rating scale: 90–100 Elite · 80–89 Excellent · 70–79 Good · 60–69 Average · 50–59 Below Avg · &lt;50 Reserve</span>
      </div>

      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, color: '#333', letterSpacing: 4, marginBottom: 10 }}>{isRivals ? 'RIVALS SHOWDOWN — CLICK TO EXPAND XI' : 'ALL TEAM RANKINGS — CLICK TO EXPAND XI'}</div>

      {rankings.length === 0 && (
        <div style={{ color: '#555', textAlign: 'center', padding: 40, fontSize: 14, letterSpacing: 2 }}>Calculating leaderboard…</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rankings.map((r, idx) => {
          const isOpen = !!expanded[r.teamId];
          const color  = tc(r.teamId);
          const borderC = medalColor(idx);
          const isMyTeam = r.teamId === mti;
          const logo = TEAM_LOGOS[r.teamId];

          return (
            <div key={r.teamId}
              onClick={() => toggle(r.teamId)}
              style={{ background: CARD, border: `1px solid ${isMyTeam ? color : borderC}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s', boxShadow: isMyTeam ? `0 0 20px ${color}20` : 'none' }}>
              {/* Row header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: idx === 0 ? `${GOLD}06` : 'transparent' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, minWidth: 40, textAlign: 'center', color: medalColor(idx), lineHeight: 1 }}>
                  {idx < 3 ? MEDAL[idx] : `#${idx + 1}`}
                </div>
                {/* Team logo */}
                {logo ? (
                  <img
                    src={logo}
                    alt={r.teamId}
                    style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.7))' }}
                    onError={e => { e.target.style.display='none'; e.target.previousSibling && (e.target.previousSibling.style.display='block'); }}
                  />
                ) : (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color, letterSpacing: 2, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getTeamLabel(r.teamId)}{isMyTeam ? ' (YOU)' : ''}
                    {r.isDisqualified && (
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, letterSpacing: 1 }}>DISQUALIFIED</span>
                    )}
                  </div>
                  <div style={{ color: '#444', fontSize: 11, marginTop: 2, letterSpacing: 1 }}>
                    Avg: <strong style={{ color: '#777' }}>{r.averageScore}</strong> pts · {r.playingXI.length} players in XI
                  </div>
                </div>
                {/* Score */}
                <div style={{ textAlign: 'center', minWidth: 70, flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: medalColor(idx), lineHeight: 1 }}>{r.totalScore}</div>
                  <div style={{ fontSize: 8, color: '#333', letterSpacing: 2 }}>TOTAL PTS</div>
                </div>
                {/* Rating bar */}
                <div style={{ minWidth: 80, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ height: 4, borderRadius: 2, background: '#111', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (r.averageScore / 100) * 100)}%`, background: color, borderRadius: 2, transition: 'width .5s' }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#333', letterSpacing: 1 }}>TEAM STRENGTH</div>
                </div>
                <div style={{ color: '#444', fontSize: 14, marginLeft: 4 }}>{isOpen ? '▲' : '▼'}</div>
              </div>

              {/* Expanded XI scorecard */}
              {isOpen && (
                <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ margin: '14px 0 10px', background: '#ffffff04', borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid ${color}` }}>
                    <div style={{ fontSize: 10, color, letterSpacing: 3, fontWeight: 700, marginBottom: 10 }}>PLAYING XI SCORECARD</div>
                    {r.playerScores.length === 0 ? (
                      <div style={{ color: '#555', fontSize: 12 }}>No players acquired by this team.</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
                        {r.playerScores.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', paddingBottom: 4 }}>
                            <div>
                              <span style={{ color: '#bbb', fontSize: 13 }}>{p.name}</span>
                              {p.rating >= 85 && <span style={{ fontSize: 9, color: GOLD, marginLeft: 6, letterSpacing: 1 }}>ELITE</span>}
                            </div>
                            <span style={{ color: p.rating >= 85 ? GOLD : p.rating >= 70 ? '#4ade80' : '#888', fontSize: 13, fontFamily: "'Bebas Neue'", letterSpacing: 1, flexShrink: 0 }}>
                              {p.rating} PTS
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#444', fontSize: 11, letterSpacing: 2 }}>TEAM TOTAL</span>
                      <span style={{ color: idx === 0 ? GOLD : '#888', fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 2 }}>{r.totalScore} PTS</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full leaderboard download */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <ActionBtn
          onClick={() => {
            const lines = rankings.map((r, i) => {
              const medal = i < 3 ? ['GOLD', 'SILVER', 'BRONZE'][i] : `#${i + 1}  `;
              return `${medal.padEnd(8)} ${getTeamLabel(r.teamId).padEnd(35)} ${r.totalScore} pts (avg ${r.averageScore})`;
            }).join('\n');
            const text = `IPL AUCTION LEADERBOARD\n${'═'.repeat(60)}\n${lines}\n\n[Generated by www.iplauction.fun]`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = 'IPL-Auction-Leaderboard.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}
          bg="#22D3EE" label="⬇ DOWNLOAD FULL LEADERBOARD" />
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────
function StatBubble({ label, val, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color, fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{val}</div>
      <div style={{ color: '#444', fontSize: 9, letterSpacing: 3 }}>{label}</div>
    </div>
  );
}

function ActionBtn({ onClick, bg, label }) {
  return (
    <button className="res-action-btn" onClick={onClick} style={{ 
      background: `${bg}15`, 
      border: `1px solid ${bg}50`, 
      borderRadius: 8, 
      padding: '12px 28px', 
      color: bg, 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: 14, 
      letterSpacing: 2, 
      fontFamily: "'Barlow Condensed'",
      transition: 'all 0.2s ease-out'
    }}>
      {label}
    </button>
  );
}
