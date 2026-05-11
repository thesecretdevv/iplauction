'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, fmt } from '../GameContext';
import BrandLink from '../components/BrandLink';
import { SUPPORT_URL } from '../components/ChaiSupport';
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

const SUPPORT_MODAL_SESSION_KEY = 'ipl_results_support_modal_dismissed';
const SUPPORT_UPI_ID = 'naga.tum@ptyes';
const SUPPORT_PAYEE_NAME = 'IPL Auction Simulator';
const SUPPORT_UPI_PARAMS = `pa=${encodeURIComponent(SUPPORT_UPI_ID)}&pn=${encodeURIComponent(SUPPORT_PAYEE_NAME)}&cu=INR`;
const GPAY_SUPPORT_URL = `tez://upi/pay?${SUPPORT_UPI_PARAMS}`;
const PHONEPE_SUPPORT_URL = `phonepe://pay?${SUPPORT_UPI_PARAMS}`;
const PAYTM_SUPPORT_URL = `paytmmp://pay?${SUPPORT_UPI_PARAMS}`;
const FAMPAY_SUPPORT_URL = `intent://pay?${SUPPORT_UPI_PARAMS}#Intent;scheme=upi;package=com.fampay.in;end`;
const GPAY_LOGO_URL = 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png';
const PHONEPE_LOGO_URL = 'https://i.pinimg.com/236x/88/0e/f6/880ef68e7e5551e4241b306fe0543ffa.jpg';
const FAMPAY_LOGO_URL = 'https://www.famapp.in/assets/localImages/fampayLogo.png';

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 760px), (pointer: coarse)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener?.('change', update);

    return () => {
      media.removeEventListener?.('change', update);
    };
  }, []);

  return isMobile;
}

function buildLeaderboardResults(gs, mode, teams) {
  const squadLimit = Number(gs?.squadLimit) || 15;
  const isRivals = gs?.roomType === 'rivals' || String(mode || '').toLowerCase() === 'rivals';
  const minimumSquadSize = isRivals ? 11 : squadLimit;
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
      squadLimit,
      minimumSquadSize,
      playingXI: xi,
    };
  });

  return calculateLeaderboard(teamsPayload, mode);
}

function normalizeRole(role) {
  const value = String(role || '').toUpperCase();
  if (value.includes('WK') || value.includes('KEEP')) return 'wicket_keeper';
  if (value.includes('BOWL')) return 'bowler';
  if (value.includes('AR')) return 'all_rounder';
  return 'batsman';
}

function getRoleFlags(role) {
  const value = String(role || '').toUpperCase();
  const isWicketkeeper = value.includes('WK') || value.includes('KEEP');
  return {
    wicketkeeper: isWicketkeeper,
    batter: isWicketkeeper || value.includes('BAT'),
    bowler: value.includes('BOWL'),
    allRounder: value.includes('AR') || value.includes('ROUND'),
  };
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
  const { gs, isMulti, effectiveMyTeamId, lobbyMode, auctionMode, lobbyPlayers } = useGame();
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
      <div style={{ minHeight: '100vh', background: BG }}>
        <div style={{ background: '#08090f', borderBottom: `1px solid ${BORDER}`, padding: 'clamp(14px,2vh,22px) clamp(16px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <BrandLink compact={true} />
          <button
            onClick={() => router.push('/room?action=browse')}
            style={{ background: `linear-gradient(135deg,${GOLD},#9a7610)`, border: 'none', borderRadius: 6, padding: '10px 20px', color: '#000', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}
          >
            BACK TO ROOMS
          </button>
        </div>
        <div style={{ minHeight: 'calc(100vh - 78px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
          <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 4 }}>RESULTS UNAVAILABLE</div>
          <div style={{ color: '#777', fontSize: 13, letterSpacing: 1 }}>{loadError || 'We could not load that result snapshot.'}</div>
          <button
            onClick={() => router.push('/room?action=browse')}
            style={{ background: `linear-gradient(135deg,${GOLD},#9a7610)`, border: 'none', borderRadius: 6, padding: '10px 20px', color: '#000', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}
          >
            BACK TO ROOMS
          </button>
        </div>
      </div>
    );
  }

  const mode = isArchivedView
    ? archivedMode || resolvedGs?.auctionMode || 'mega'
    : (isMulti ? lobbyMode : auctionMode) || resolvedGs?.auctionMode || 'mega';
  const restartHandler = () => router.push('/room?action=browse');
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
  const isMobileDevice = useIsMobileDevice();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportCloseCountdown, setSupportCloseCountdown] = useState(15);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SUPPORT_MODAL_SESSION_KEY) === 'true') return;

    setShowSupportModal(true);
    setSupportCloseCountdown(15);
  }, []);

  useEffect(() => {
    if (!showSupportModal || supportCloseCountdown <= 0) return;

    const timer = setTimeout(() => {
      setSupportCloseCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [showSupportModal, supportCloseCountdown]);

  const dismissSupportModal = useCallback(() => {
    if (supportCloseCountdown > 0) return;
    setShowSupportModal(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SUPPORT_MODAL_SESSION_KEY, 'true');
    }
  }, [supportCloseCountdown]);

  const soldCount   = (gs.auctionLog || []).filter(l =>  l.sold).length;
  const unsoldCount = (gs.auctionLog || []).filter(l => !l.sold).length;
  const rivalsWinner = isRivals ? rankings[0] : null;
  const rivalsRunner = isRivals ? rankings[1] : null;

  // For the active team: decide what to display
  const rawXI    = gs.playingXI?.[activeId] || [];
  const fullSquad = gs.squads?.[activeId] || [];
  const squadLimit = Number(gs?.squadLimit) || 15;
  const minimumSquadSize = isRivals ? 11 : squadLimit;

  // Edge-case: player may have submitted <11 or exactly 10 players.
  // If rawXI has ≥ 1 and ≤ 11 players, respect it; otherwise fall back to selectPlayingXI.
  const playingXI = rawXI.length > 0 && rawXI.length <= 11
    ? rawXI
    : fullSquad.length > 0
      ? selectPlayingXI(fullSquad, mode)
      : [];

  const displayList     = playingXI;
  const initialPurse    = gs.initialPurse || 120;
  const spent           = +(initialPurse - (gs.purses?.[activeId] || 0)).toFixed(2);
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
  const batCount = normalizedXI.filter(p => getRoleFlags(p.role).batter).length;
  const bowlCount = normalizedXI.filter(p => getRoleFlags(p.role).bowler).length;
  const wkCount = normalizedXI.filter(p => getRoleFlags(p.role).wicketkeeper).length;
  const squadShortfall = fullSquad.length < minimumSquadSize;
  const isDisqualified = squadShortfall || playingXI.length < 11 || batCount < 2 || bowlCount < 2 || wkCount < 1;
  const disqualificationReason = squadShortfall
    ? `Only ${fullSquad.length}/${minimumSquadSize} players bought`
    : playingXI.length < 11
      ? 'Fewer than 11 players in XI'
      : batCount < 2
        ? 'Needs at least 2 batters'
        : bowlCount < 2
          ? 'Needs at least 2 bowlers'
          : wkCount < 1
            ? 'Needs at least 1 wicketkeeper'
            : '';

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Rajdhani',sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .res-card{animation:fadeUp .35s ease-out both}
        .res-tab-btn{transition:all .2s;border-radius:0;font-family:'Barlow Condensed';font-size:13px;letter-spacing:2px;font-weight:700;cursor:pointer;border:none;padding:12px 18px}
        .res-team-pill{transition:all .2s;border-radius:999px;padding:8px 14px;cursor:pointer;font-weight:700;font-size:13px;font-family:'Rajdhani';white-space:nowrap}
        .res-action-btn{transition:background-color .2s,border-color .2s,color .2s}
        .res-action-btn:hover { background:#141922; border-color:#4b5563; color:#fff; }
        .res-shell{max-width:1480px;margin:0 auto}
        .res-panel{background:#0d1117;border:1px solid #1b2430;border-radius:18px}
        .res-panel-muted{background:#0b0f14;border:1px solid #18202b;border-radius:16px}
        .res-summary-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:start}
        .res-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .res-metric{background:#0a0e13;border:1px solid #18202b;border-radius:14px;padding:14px 16px}
        .res-metric-label{color:#6b7280;font-size:10px;letter-spacing:2px;text-transform:uppercase}
        .res-metric-value{margin-top:8px;color:#fff;font-family:'Bebas Neue';font-size:28px;letter-spacing:1px;line-height:1}
        .res-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.95fr);gap:18px;align-items:start}
        .res-players-card{padding:18px}
        .res-side-card{padding:18px}
        .res-player-list{display:grid;gap:10px}
        .res-player-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;background:#0a0e13;border:1px solid #18202b;border-radius:14px;padding:12px 14px}
        .res-player-index{width:34px;height:34px;border-radius:999px;border:1px solid #202938;display:flex;align-items:center;justify-content:center;color:#8b95a7;font-family:'Bebas Neue';font-size:16px;flex-shrink:0}
        .res-player-main{display:flex;align-items:center;gap:12px;min-width:0}
        .res-player-avatar{width:48px;height:48px;border-radius:14px;background:#080b10;border:1px solid #202938;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
        .res-player-name{color:#f3f4f6;font-size:16px;font-weight:700;line-height:1.2}
        .res-player-sub{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:5px}
        .res-role-chip{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;border:1px solid currentColor}
        .res-player-meta{color:#7c8799;font-size:11px;letter-spacing:1px}
        .res-player-stats{text-align:right;min-width:86px}
        .res-player-price{color:#f3f4f6;font-size:15px;font-weight:700}
        .res-player-rating{margin-top:4px;font-size:11px;letter-spacing:1px}
        .res-section-label{color:#7c8799;font-size:10px;letter-spacing:2.4px;text-transform:uppercase}
        .res-section-title{margin-top:8px;color:#fff;font-family:'Bebas Neue';font-size:34px;letter-spacing:1px;line-height:.95}
        .res-section-copy{margin-top:10px;color:#98a3b3;font-size:14px;line-height:1.7}
        .res-checklist{display:grid;gap:10px;margin-top:14px}
        .res-check-item{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 14px;border:1px solid #18202b;border-radius:12px;background:#0a0e13}
        .res-check-name{color:#d1d5db;font-size:13px;font-weight:600}
        .res-check-value{font-size:12px;font-weight:700;letter-spacing:1px}
        .res-actions-grid{display:grid;gap:10px;margin-top:14px}
        .res-actions-grid .res-action-btn{width:100%;justify-content:center}
        .res-desktop-support-btn{display:inline-flex;align-items:center;justify-content:center;background:rgba(232,184,75,.1);border:1px solid rgba(232,184,75,.36);border-radius:10px;padding:10px 18px;color:${GOLD};font-weight:900;font-size:13px;letter-spacing:1.5px;font-family:'Barlow Condensed';text-decoration:none}
        .support-modal-backdrop{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,6,12,.76);backdrop-filter:blur(10px);animation:modalFade .22s ease-out both}
        .support-modal{width:min(540px,100%);border:1px solid rgba(232,184,75,.35);border-radius:26px;background:radial-gradient(circle at 20% 0%,rgba(232,184,75,.22),transparent 34%),linear-gradient(145deg,#111723 0%,#070a10 58%,#0c1018 100%);box-shadow:0 26px 80px rgba(0,0,0,.56),0 0 50px rgba(232,184,75,.12);padding:clamp(22px,4vw,34px);text-align:center;animation:modalRise .28s ease-out both}
        .support-modal-kicker{color:${GOLD};font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase}
        .support-modal-title{margin-top:8px;color:#fff;font-family:'Bebas Neue';font-size:clamp(36px,8vw,56px);line-height:.9;letter-spacing:2px}
        .support-modal-copy{margin:18px auto 0;max-width:440px;color:#d5dde8;font-size:16px;line-height:1.75}
        .support-modal-actions{display:grid;gap:12px;margin-top:24px}
        .support-modal-support-btn,.support-modal-pay-btn,.support-modal-close-btn{min-height:52px;border-radius:16px;font-family:'Barlow Condensed';font-size:16px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
        .support-modal-support-btn{border:0;background:linear-gradient(135deg,${GOLD},#f6d36e);color:#05070b;box-shadow:0 12px 28px rgba(232,184,75,.2)}
        .support-modal-support-btn:hover,.support-modal-pay-btn:hover,.support-modal-close-btn:hover{transform:translateY(-1px)}
        .support-modal-mobile-payments{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .support-modal-pay-btn{border:1px solid #263344;background:#0b1018;color:#eef4fb}
        .support-modal-pay-logo{width:28px;height:28px;object-fit:contain;display:block;flex-shrink:0}
        .support-modal-paytm-mark{color:#00baf2;font-weight:900;letter-spacing:-.02em;text-transform:none}
        .support-modal-paytm-mark span{color:#002970}
        .support-modal-upi-copy{margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.04);padding:12px 14px;width:100%;color:#eef4fb;font-family:'Rajdhani';cursor:pointer}
        .support-modal-upi-label{display:block;color:#8b95a7;font-size:11px;letter-spacing:1.8px;text-transform:uppercase}
        .support-modal-upi-value{display:block;margin-top:6px;font-size:18px;font-weight:700;letter-spacing:.5px}
        .support-modal-upi-hint{display:block;margin-top:6px;color:${GOLD};font-size:12px;letter-spacing:1.1px}
        .support-modal-countdown{margin-top:16px;color:#8b95a7;font-size:13px;letter-spacing:1.1px}
        .support-modal-close-btn{margin-top:16px;width:100%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#f8fafc}
        @keyframes modalFade{from{opacity:0}to{opacity:1}}
        @keyframes modalRise{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
        @media (max-width: 1100px){
          .res-summary-grid{grid-template-columns:1fr}
          .res-layout{grid-template-columns:1fr}
        }
        @media (max-width: 780px){
          .res-desktop-support-btn{display:none}
          .res-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
          .res-player-row{grid-template-columns:minmax(0,1fr);text-align:left}
          .res-player-main{align-items:flex-start}
          .res-player-stats{min-width:0;text-align:left;padding-left:46px}
        }
        @media (max-width: 640px){
          .res-tab-btn{font-size:12px;padding:12px 10px}
          .res-player-name{font-size:15px}
          .res-section-title{font-size:28px}
          .res-metric-value{font-size:24px}
          .support-modal-mobile-payments{grid-template-columns:1fr}
        }
      `}</style>

      {showSupportModal && (
        <SupportResultsModal
          canClose={supportCloseCountdown <= 0}
          countdown={supportCloseCountdown}
          isMobile={isMobileDevice}
          onClose={dismissSupportModal}
        />
      )}

      {/* ── Header ── */}
      <div style={{ background: '#08090f', borderBottom: `1px solid ${BORDER}`, padding: 'clamp(14px,2vh,22px) clamp(16px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ marginBottom: 14 }}>
            <BrandLink compact={true} />
          </div>
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
            style={{ background:'#0f141b', border:'1px solid #233041', borderRadius: 10, padding: '10px 18px', color:'#d7dee8', fontWeight: 900, fontSize: 13, letterSpacing: 1.5, fontFamily: "'Barlow Condensed'", textDecoration: 'none' }}
          >
            JOIN WHATSAPP
          </a>
          <a className="res-desktop-support-btn" href={SUPPORT_URL} target="_blank" rel="noreferrer">
            SUPPORT
          </a>
          <button
            onClick={onRestart}
            style={{ background: '#f3c547', border: '1px solid #f3c547', borderRadius: 10, padding: '10px 24px', color: '#05070b', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}
          >{isArchived ? 'BACK TO ROOMS' : 'PLAY AGAIN'}</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#0a0b12', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: 0, padding: '0 clamp(16px,4vw,48px)', overflowX: 'auto' }}>
        {[['squad', 'SQUADS'], ['leaderboard', 'LEADERBOARD']].map(([key, label]) => (
          <button key={key} className="res-tab-btn" onClick={() => setTab(key)}
            style={{ background: tab === key ? '#0d1117' : 'transparent', color: tab === key ? GOLD : '#70798a', borderBottom: tab === key ? `2px solid ${GOLD}` : '2px solid transparent', flexShrink: 0 }}>
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
            disqualificationReason={disqualificationReason}
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

function SupportResultsModal({ canClose, countdown, isMobile, onClose }) {
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(SUPPORT_UPI_ID)
      .then(() => {
        setCopiedUpi(true);
        window.setTimeout(() => setCopiedUpi(false), 1600);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="support-modal-backdrop" role="presentation">
      <section className="support-modal" role="dialog" aria-modal="true" aria-labelledby="support-modal-title">
        <div className="support-modal-kicker">One tiny timeout</div>
        <div id="support-modal-title" className="support-modal-title">Support The Servers</div>
        <p className="support-modal-copy">
          Maintaining servers is hard, this platform is completely ad-free and requires no login.
          If you enjoyed it, please consider supporting us, even a small amount helps a lot! Thank you!!
        </p>

        <div className="support-modal-actions">
          {isMobile ? (
            <div className="support-modal-mobile-payments" aria-label="UPI payment options">
              <a className="support-modal-pay-btn" href={GPAY_SUPPORT_URL}>
                <img className="support-modal-pay-logo" src={GPAY_LOGO_URL} alt="GPay logo" />
                GPay
              </a>
              <a className="support-modal-pay-btn" href={PHONEPE_SUPPORT_URL}>
                <img className="support-modal-pay-logo" src={PHONEPE_LOGO_URL} alt="PhonePe logo" />
                PhonePe
              </a>
              <a className="support-modal-pay-btn" href={PAYTM_SUPPORT_URL}>
                <span className="support-modal-paytm-mark" aria-label="Paytm logo">Pay<span>tm</span></span>
                Paytm
              </a>
              <a className="support-modal-pay-btn" href={FAMPAY_SUPPORT_URL}>
                <img className="support-modal-pay-logo" src={FAMPAY_LOGO_URL} alt="FamPay logo" />
                FamPay
              </a>
            </div>
          ) : (
            <a className="support-modal-support-btn" href={SUPPORT_URL} target="_blank" rel="noreferrer">
              Support
            </a>
          )}

          {isMobile ? (
            <button type="button" className="support-modal-upi-copy" onClick={handleCopyUpi}>
              <span className="support-modal-upi-label">UPI ID</span>
              <span className="support-modal-upi-value">{SUPPORT_UPI_ID}</span>
              <span className="support-modal-upi-hint">{copiedUpi ? 'Copied' : 'Tap to copy'}</span>
            </button>
          ) : null}
        </div>

        {canClose ? (
          <button type="button" className="support-modal-close-btn" onClick={onClose}>
            Close and View Results
          </button>
        ) : (
          <div className="support-modal-countdown" aria-live="polite">
            You can close in {countdown} seconds...
          </div>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Squad Tab
// ─────────────────────────────────────────────────────────────────────────────
function SquadTab({ gs, mti, mode, teams, activeId, setActiveId, team, displayList, playingXI, fullSquad, spent, soldCount, unsoldCount, teamTotalRating, teamAvgRating, isDisqualified, disqualificationReason, shareText, shareWhatsApp, downloadSheet, getTeamLabel }) {
  const normalizedXI = playingXI.map((player) => ({ ...player, role: normalizeRole(player?.role) }));
  const roleBreakdown = {
    batters: normalizedXI.filter((p) => getRoleFlags(p.role).batter).length,
    bowlers: normalizedXI.filter((p) => getRoleFlags(p.role).bowler).length,
    wicketkeepers: normalizedXI.filter((p) => getRoleFlags(p.role).wicketkeeper).length,
    allRounders: normalizedXI.filter((p) => getRoleFlags(p.role).allRounder).length,
  };

  return (
    <div className="res-shell">
      {/* Disqualified Alert */}
      {isDisqualified && (
        <div style={{ background: '#1a1113', border: '1px solid #4b1f26', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: 28 }}>🚨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#ef4444', letterSpacing: 1 }}>SQUAD DISQUALIFIED</div>
            <div style={{ color: '#ef4444aa', fontSize: 13, letterSpacing: 1, marginTop: 2 }}>
              {disqualificationReason || 'This team fails the minimum required criteria: 2 Batters, 2 Bowlers, 1 Wicketkeeper.'}
            </div>
          </div>
        </div>
      )}
      {/* ── Team selector ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
        {teams.map(t => (
          <button key={t.id} className="res-team-pill"
            onClick={() => setActiveId(t.id)}
            style={{ background: activeId === t.id ? t.color : '#0d1117', border: `1px solid ${activeId === t.id ? t.color : '#243041'}`, color: activeId === t.id ? '#000' : '#d6dde8' }}>
            {getTeamLabel(t, { short: true })}{t.id === mti ? ' (YOU)' : ''}
          </button>
        ))}
      </div>

      <div className="res-summary-grid" style={{ marginBottom: 18 }}>
        <div className="res-panel res-card" style={{ padding: 20 }}>
          <div className="res-section-label">{team ? getTeamLabel(team) : ''}</div>
          <div className="res-section-title">
            {playingXI.length > 0
              ? playingXI.length === 11 ? 'Current Playing XI' : `Playing XI (${playingXI.length}/11)`
              : 'No Players Acquired'}
          </div>
          <div className="res-section-copy">
            {playingXI.length > 0
              ? 'A cleaner view of your best available lineup with role balance, rating value, and spend in one place.'
              : 'This franchise did not complete a usable lineup in this auction snapshot.'}
          </div>
          {fullSquad.length > 0 && playingXI.length !== fullSquad.length && (
            <div style={{ marginTop: 12, color: '#7c8799', fontSize: 12, letterSpacing: 1.2 }}>
              {fullSquad.length} players in squad • {playingXI.length} selected in XI
            </div>
          )}
        </div>
        <div className="res-metric-grid">
          <ResultMetric label="Total Rating" value={`${teamTotalRating} pts`} accent={GOLD} />
          <ResultMetric label="Average Rating" value={`${teamAvgRating} pts`} accent="#22D3EE" />
          <ResultMetric label="Purse Used" value={fmt(spent)} accent="#d7dee8" />
          <ResultMetric label="Purse Left" value={fmt(gs.purses?.[activeId] || 0)} accent="#4ade80" />
        </div>
      </div>

      <div className="res-layout">
        <div className="res-panel res-players-card">
          {playingXI.length < 11 && playingXI.length > 0 && (
            <div style={{ background: '#15110a', border: '1px solid #4a3920', borderRadius: 12, padding: '12px 14px', marginBottom: 16, color: '#f3c547', fontSize: 12, letterSpacing: 1.2 }}>
              Only {playingXI.length} players are available in this XI. A full Playing XI needs 11 players.
            </div>
          )}
          {playingXI.length === 0 ? (
            <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#7c8799', fontSize: 14, lineHeight: 1.8 }}>
              No players were acquired by {team ? getTeamLabel(team) : 'this team'}.
              <br />
              Remaining purse: {fmt(gs.purses?.[activeId] || initialPurse)}
            </div>
          ) : (
            <div className="res-player-list">
              {displayList.map((p, i) => {
                const pName = p.name || p;
                const normalizedRole = normalizeRole(p?.role);
                const rating = getPlayerRating(pName, mode);
                const pRec = ALL_PLAYERS.find((ap) => ap.name === pName);
                const photoUrl = pRec?.photo_url;
                return (
                  <div key={i} className="res-player-row">
                    <div className="res-player-index">{String(i + 1).padStart(2, '0')}</div>
                    <div className="res-player-main">
                      <div className="res-player-avatar" style={{ borderColor: `${ROLE_C[normalizedRole]}55` }}>
                        {photoUrl ? (
                          <img src={photoUrl} alt={pName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ fontSize: 22 }}>{ROLE_EMOJI[normalizedRole]}</div>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="res-player-name">{pName}</div>
                        <div className="res-player-sub">
                          <span className="res-role-chip" style={{ color: ROLE_C[normalizedRole] }}>{ROLE_L[normalizedRole] || normalizedRole}</span>
                          <span className="res-player-meta">{p.overseas ? 'Overseas' : 'Indian'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="res-player-stats">
                      <div className="res-player-price">{p.soldFor ? fmt(p.soldFor) : (p.base ? fmt(p.base) : '—')}</div>
                      <div className="res-player-rating" style={{ color: rating >= 85 ? GOLD : rating >= 70 ? '#4ade80' : '#8b95a7' }}>{rating} rating</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <div className="res-panel-muted res-side-card">
            <div className="res-section-label">Lineup Check</div>
            <div className="res-section-title" style={{ fontSize: 28 }}>Squad Balance</div>
            <div className="res-checklist">
              <CheckItem label="Players in XI" value={`${playingXI.length}/11`} tone={playingXI.length === 11 ? '#4ade80' : '#f3c547'} />
              <CheckItem label="Batters" value={String(roleBreakdown.batters)} tone={roleBreakdown.batters >= 2 ? '#4ade80' : '#ef4444'} />
              <CheckItem label="Bowlers" value={String(roleBreakdown.bowlers)} tone={roleBreakdown.bowlers >= 2 ? '#4ade80' : '#ef4444'} />
              <CheckItem label="Wicketkeepers" value={String(roleBreakdown.wicketkeepers)} tone={roleBreakdown.wicketkeepers >= 1 ? '#4ade80' : '#ef4444'} />
              <CheckItem label="All-rounders" value={String(roleBreakdown.allRounders)} tone="#8b95a7" />
            </div>
          </div>

          <div className="res-panel-muted res-side-card">
            <div className="res-section-label">Auction Snapshot</div>
            <div className="res-section-title" style={{ fontSize: 28 }}>Room Summary</div>
            <div className="res-checklist">
              <CheckItem label="Players bought" value={String(fullSquad.length)} tone="#d7dee8" />
              <CheckItem label="Players sold" value={String(soldCount)} tone="#d7dee8" />
              <CheckItem label="Players unsold" value={String(unsoldCount)} tone="#d7dee8" />
              <CheckItem label="Mode" value={String(mode || '').toUpperCase()} tone={GOLD} />
            </div>
          </div>

          <div className="res-panel-muted res-side-card">
            <div className="res-section-label">Actions</div>
            <div className="res-section-title" style={{ fontSize: 28 }}>Share or Save</div>
            <div className="res-actions-grid">
              <ActionBtn onClick={downloadSheet} bg="#d7dee8" label="DOWNLOAD TXT" />
              <ActionBtn onClick={shareWhatsApp} bg="#d7dee8" label="SHARE ON WHATSAPP" />
              <ActionBtn onClick={shareText} bg="#d7dee8" label="COPY / SHARE" />
            </div>
          </div>
        </div>
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
          <span style={{ color: '#777' }}>Minimum criteria: full configured squad size, 2 Batters, 2 Bowlers, 1 Wicketkeeper. Teams failing this are <span style={{ color: '#ef4444' }}>DISQUALIFIED</span>.</span>
        ) : isRivals ? (
          <span style={{ color: '#777' }}>Rivals rules: build a valid 11-player XI with at least 2 Batters, 2 Bowlers, and 1 Wicketkeeper.</span>
        ) : (
          <span style={{ color: '#777' }}>Selection rules: full configured squad size, best-rated 11 players, at least 1 wicket-keeper.</span>
        )}
        <br />
        {isRivals ? 'Teams that fail to field a valid Playing XI are disqualified.' : 'Teams that bought fewer than the selected squad limit are disqualified.'}
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
                    {r.squadLimit ? ` · Squad ${r.squadSize}/${r.squadLimit}` : ''}
                    {r.disqualificationReason ? ` · ${r.disqualificationReason}` : ''}
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

function ResultMetric({ label, value, accent }) {
  return (
    <div className="res-metric">
      <div className="res-metric-label">{label}</div>
      <div className="res-metric-value" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function CheckItem({ label, value, tone }) {
  return (
    <div className="res-check-item">
      <span className="res-check-name">{label}</span>
      <span className="res-check-value" style={{ color: tone }}>{value}</span>
    </div>
  );
}

function ActionBtn({ onClick, bg, label }) {
  return (
    <button className="res-action-btn" onClick={onClick} style={{ 
      background: '#0a0e13', 
      border: '1px solid #202938', 
      borderRadius: 12, 
      padding: '12px 28px', 
      color: bg, 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: 13, 
      letterSpacing: 2, 
      fontFamily: "'Barlow Condensed'",
      transition: 'all 0.2s ease-out',
      display: 'inline-flex',
      alignItems: 'center'
    }}>
      {label}
    </button>
  );
}
