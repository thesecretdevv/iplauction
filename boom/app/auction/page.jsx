'use client';

import { useState, useRef, useCallback, useMemo, Suspense, memo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame, fmt, nextBid, getOverseasLimitForSquad } from '../GameContext';
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import { StatsModal } from '../../src/StatsModal';
import { SquadModal } from '../../src/SquadModal';
import { getPlayerRating, getPlayerRecord, selectPlayingXI } from '../data/playerRatings';
import AppDialog from '../components/AppDialog';
import { isAudioMuted, setAudioMuted } from '../../src/useSocket';

const kohliImg = '/assets/Kohli.avif';
const CYAN = '#22D3EE';
const RIVALS_MAX_SQUAD_SIZE = 13;
const RIVALS_MAX_OVERSEAS = 5;
const DEFAULT_PURSE = 120;
const GIPHY_API_KEY = 'uBg7NTfB0PiHDgwH9F6t0t0uDoFLFXqC';
const WHATSAPP_COMMUNITY_URL = 'https://whatsapp.com/channel/0029VbCeqwJ90x2z9PRli10E';

function getPlayerPhoto(name) {
  const record = getPlayerRecord(name);
  return record?.photo_url || record?.image_url || null;
}

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
    if (isAudioMuted()) return;
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

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.8 11.8 0 0 0 12.08 0C5.5 0 .16 5.34.16 11.92c0 2.1.55 4.14 1.58 5.93L0 24l6.31-1.65a11.92 11.92 0 0 0 5.77 1.48h.01c6.57 0 11.91-5.34 11.92-11.92a11.82 11.82 0 0 0-3.49-8.43Zm-8.44 18.34h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.75.98 1-3.65-.24-.38a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.91A9.88 9.88 0 0 1 22 11.91c0 5.48-4.45 9.92-9.92 9.92Zm5.44-7.39c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.08-.3-.15-1.26-.47-2.4-1.49-.88-.78-1.48-1.76-1.66-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.21 5.08 4.5.71.31 1.26.5 1.7.64.71.22 1.37.19 1.89.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.04 15.52 8.66 20.9c.54 0 .78-.23 1.06-.5l2.54-2.43 5.27 3.86c.97.53 1.65.25 1.91-.9L22.9 4.7c.34-1.4-.5-1.95-1.43-1.6L1.98 10.6c-1.33.52-1.31 1.26-.23 1.59l4.98 1.55L18.3 6.47c.55-.36 1.05-.16.63.2" />
    </svg>
  );
}

function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 'Live now';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
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

const UpcomingModal = memo(function UpcomingModal({ isOpen, onClose, upcomingPlayers, groupedUpcoming }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 900, background: "#0a0a0c", border: `1px solid ${GOLD}44`, borderRadius: 16, display: "flex", flexDirection: "column", maxHeight: "92vh", boxShadow: "0 0 50px rgba(0,0,0,1)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: GOLD, letterSpacing: 2 }}>UPCOMING PLAYERS</div>
            <div style={{ color: "#555", fontSize: 11, letterSpacing: 1, marginTop: 2 }}>POOLED BY CATEGORY · {upcomingPlayers.length} LEFT</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#666", fontSize: 24, cursor: "pointer", padding: 4 }}>✕</button>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  {players.map((player, i) => {
                    const photoUrl = getPlayerPhoto(player.name);
                    return (
                      <div
                        key={`${cat}-${player.name}-${i}`}
                        style={{ background: "#0d0d10", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1px solid ${ROLE_C[player.role]}55`, background: `${ROLE_C[player.role]}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {photoUrl ? (
                            <img src={photoUrl} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                          ) : (
                            <span style={{ fontSize: 16 }}>{ROLE_EMOJI[player.role]}</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={player.name}>
                            {player.name}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: ROLE_C[player.role], letterSpacing: 1, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>
                              {player.role.toUpperCase()}
                            </span>
                            {player.overseas && (
                              <span style={{ fontSize: 9, background: "#6366f120", color: "#818cf8", padding: "1px 5px", borderRadius: 999, letterSpacing: 1, fontWeight: 700 }}>
                                OS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
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

function AuctionContent() {
  const router = useRouter();
  const {
    gs, isMulti, effectiveMyTeamId, humanBid, submitXI,
    showSquad, setShowSquad, showStats, setShowStats,
    viewingTeam, setViewingTeam, emit, isHost, multiGS, g,
    lobbyPlayers, myName, myTeamId, roomCode,
    lobbyMode, auctionMode, isSpectator, chatLog,
    playerId, setRoomCode, setLobbyPlayers, setIsHost, setMyName,
    setPlayMode, setMultiGS, setLobbyMode, setIsSpectator, setRoomMeta, roomMeta,
    handleRestart
  } = useGame();

  const searchParams = useSearchParams();
  const isSpectatorMode = isSpectator || searchParams.get('spectator') === '1';
  const roomFromQuery = searchParams.get('room');
  const recoveryAttemptedRef = useRef(false);

  const [showTeams, setShowTeams]       = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [mobileTab, setMobileTab]       = useState('chat');    // 'chat' | 'teams' | 'settings'
  const [copied, setCopied]             = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [hamburgerTab, setHamburgerTab] = useState('upcoming'); // 'upcoming'|'sold'|'unsold'|'leaderboard'
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [showDesktopSettings, setShowDesktopSettings] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [audioMuted, setAudioMutedState] = useState(false);
  const playerQueue = gs?.playerQueue ?? [];
  const currentIdx = gs?.currentIdx ?? -1;
  const currentMode = (isMulti ? lobbyMode : auctionMode) || gs?.auctionMode || 'mega';
  const isRivals = gs?.roomType === 'rivals' || currentMode?.toLowerCase() === 'rivals';
  const showPlayerRatings = isMulti ? (gs?.showPlayerRatings ?? roomMeta?.showPlayerRatings ?? false) : true;

  useEffect(() => {
    setAudioMutedState(isAudioMuted());
  }, []);

  const handleBid = useCallback(() => {
    humanBid();
  }, [humanBid]);
  const closeUpcomingModal = useCallback(() => setShowUpcoming(false), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const closeDesktopSettings = useCallback(() => setShowDesktopSettings(false), []);
  const openEndAuctionDialog = useCallback(() => {
    setDialog({
      title: 'End Auction?',
      message: 'This will end the auction for everyone in the room and take all players to the results screen.',
      tone: 'danger',
      actions: [
        { label: 'Cancel', variant: 'secondary', onClick: closeDialog },
        {
          label: 'End Auction',
          variant: 'danger',
          onClick: () => {
            closeDialog();
            emit('end-game');
          },
        },
      ],
    });
  }, [closeDialog, emit]);
  const openLeaveAuctionDialog = useCallback(() => {
    setDialog({
      title: 'Leave Auction?',
      message: 'You will leave this live auction room and return to the lobby browser.',
      tone: 'info',
      actions: [
        { label: 'Stay', variant: 'secondary', onClick: closeDialog },
        {
          label: 'Leave',
          variant: 'danger',
          onClick: () => {
            closeDialog();
            handleRestart('/room?action=browse');
          },
        },
      ],
    });
  }, [closeDialog, handleRestart]);
  const handleTimerDurationChange = useCallback((duration) => {
    emit('set-timer-duration', { duration });
  }, [emit]);
  const openRulesDialog = useCallback(() => {
    const currentSquadLimit = gs?.squadLimit || (isRivals ? RIVALS_MAX_SQUAD_SIZE : 15);
    const overseasLimit = isRivals ? RIVALS_MAX_OVERSEAS : getOverseasLimitForSquad(currentSquadLimit);
    setDialog({
      title: 'Auction Rules',
      message: [
        `Squad limit: each team can buy up to ${currentSquadLimit} players.`,
        'Final XI: every team must submit exactly 11 players after the auction ends.',
        'Minimum XI rules: at least 2 batters, 2 bowlers, and 1 wicketkeeper are required.',
        `Overseas buying rule: ${currentSquadLimit}-player squads can buy up to ${overseasLimit} overseas players.`,
        'If the host finalizes results before everyone submits, the game auto-picks the best available XI from each remaining squad.',
        'Teams that fail the XI rules will be marked disqualified in results.',
      ].join('\n\n'),
      tone: 'info',
      actions: [{ label: 'OK', onClick: closeDialog }],
    });
  }, [closeDialog, gs?.squadLimit, isRivals]);
  const handleSquadLimitChange = useCallback((limit) => {
    emit('set-squad-limit', { squadLimit: limit });
  }, [emit]);
  const handleAudioMuteToggle = useCallback(() => {
    const nextMuted = !audioMuted;
    setAudioMuted(nextMuted);
    setAudioMutedState(nextMuted);
  }, [audioMuted]);
  const handlePlayerRatingsVisibilityChange = useCallback((shouldShow) => {
    emit('set-player-ratings-visibility', { showPlayerRatings: shouldShow });
    setRoomMeta(prev => ({ ...(prev || {}), showPlayerRatings: shouldShow }));
    setMultiGS(prev => prev ? { ...prev, showPlayerRatings: shouldShow } : prev);
  }, [emit, setMultiGS, setRoomMeta]);
  const handleFinalizeSelection = useCallback(() => {
    emit('finalize-selection', {}, (res) => {
      if (!res?.ok) {
        setDialog({
          title: 'Cannot Finalize Results',
          message: res?.error || 'Something went wrong while finalizing the selection phase.',
          tone: 'info',
          actions: [{ label: 'OK', onClick: closeDialog }],
        });
      }
    });
  }, [closeDialog, emit]);
  const handleKickPlayer = useCallback((player) => {
    if (!player?.id) return;
    setDialog({
      title: `Kick ${player.name}?`,
      message: player.teamId
        ? `${player.name} will be removed from this room and their franchise slot will open for someone else to take over.`
        : `${player.name} will be removed from this room immediately.`,
      tone: 'danger',
      actions: [
        { label: 'Cancel', variant: 'secondary', onClick: closeDialog },
        {
          label: 'Kick Player',
          variant: 'danger',
          onClick: () => {
            closeDialog();
            emit('kick-player', { targetPlayerId: player.id }, (res) => {
              if (!res?.ok) {
                setDialog({
                  title: 'Could Not Kick Player',
                  message: res?.error || 'Something went wrong while removing this player.',
                  tone: 'info',
                  actions: [{ label: 'OK', onClick: closeDialog }],
                });
              }
            });
          },
        },
      ],
    });
  }, [closeDialog, emit]);
  const handleHostPauseToggle = useCallback(() => {
    emit(gs?.isPaused ? 'resume-game' : 'pause-game');
  }, [emit, gs?.isPaused]);
  const timerOptions = [5, 10, 15, 20, 25];
  const squadLimitOptions = [15, 20, 25];

  const upcomingPlayers = useMemo(
    () => playerQueue.slice(currentIdx + 1),
    [playerQueue, currentIdx]
  );
  const resultsQuery = new URLSearchParams();
  if (currentMode) resultsQuery.set('mode', String(currentMode).toUpperCase());
  if (isMulti && (roomCode || gs?.roomCode)) resultsQuery.set('room', roomCode || gs?.roomCode);
  if (!isMulti && effectiveMyTeamId) resultsQuery.set('team', effectiveMyTeamId);
  const resultsHref = resultsQuery.toString() ? `/results?${resultsQuery.toString()}` : '/results';
  const groupedUpcoming = useMemo(() => {
    const groups = upcomingPlayers.reduce((acc, player) => {
      const setName = player.setName || "Other";
      if (!acc[setName]) acc[setName] = [];
      acc[setName].push(player);
      return acc;
    }, {});

    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [upcomingPlayers]);

  const teamOwnerMap = useMemo(() => new Map(
    (lobbyPlayers || [])
      .filter((entry) => !entry.isSpectator && entry.teamId && entry.name)
      .map((entry) => [entry.teamId, entry.name])
  ), [lobbyPlayers]);
  const getTeamOwnerName = useCallback((teamId) => teamOwnerMap.get(teamId) || '', [teamOwnerMap]);
  const getTeamLabel = useCallback((team, { short = false } = {}) => {
    if (!team) return '';
    const base = short ? team.short : team.name;
    const owner = getTeamOwnerName(team.id);
    return owner ? `${base} (${owner})` : base;
  }, [getTeamOwnerName]);
  const lastBidSignatureRef = useRef(null);
  const manageablePlayers = useMemo(
    () => (lobbyPlayers || []).filter((player) => !player.isHost),
    [lobbyPlayers]
  );

  useEffect(() => {
    const latestBid = gs?.bidLog?.[0];
    const queueIdx = gs?.currentIdx ?? -1;
    const signature = latestBid ? `${queueIdx}:${latestBid.teamId}:${latestBid.bid}` : `${queueIdx}:none`;
    if (lastBidSignatureRef.current === null) {
      lastBidSignatureRef.current = signature;
      return;
    }
    if (latestBid && signature !== lastBidSignatureRef.current) {
      playBidClick();
    }
    lastBidSignatureRef.current = signature;
  }, [gs?.currentIdx, gs?.bidLog]);

  useEffect(() => {
    if (gs?.phase !== 'finished') return;
    router.replace(resultsHref);
  }, [gs?.phase, resultsHref, router]);

  useEffect(() => {
    if (gs || !roomFromQuery || recoveryAttemptedRef.current) return;
    if (typeof window === 'undefined') return;

    const savedName = localStorage.getItem('ipl_player_name');
    if (!savedName || !playerId) return;

    recoveryAttemptedRef.current = true;
    setPlayMode('multi');

    emit('join-room', { code: roomFromQuery, playerName: savedName, playerId }, (res) => {
      if (!res?.ok) {
        recoveryAttemptedRef.current = false;
        return;
      }

      setRoomCode(res.code || roomFromQuery);
      setMyName(savedName);
      setLobbyPlayers(res.players || []);
      setIsHost(res.hostId === playerId);
      setIsSpectator(!!res.isSpectator);
      if (res.auctionMode) setLobbyMode(res.auctionMode);
      setRoomMeta({
        roomType: res.roomType || 'standard',
        activeTeamIds: res.activeTeamIds || null,
        rivalsMatch: res.rivalsMatch || null,
        roomName: res.roomName || null,
      });

      if (res.roomStatus === 'active' && res.gameState) {
        const me = (res.players || []).find((player) => player.id === playerId);
        if (res.isSpectator || me?.teamId) {
          setMultiGS(res.gameState);
        } else {
          router.replace(`/room?action=lobby&room=${res.code || roomFromQuery}${res.auctionMode ? `&mode=${res.auctionMode}` : ''}`);
        }
      } else if (res.roomStatus === 'finished') {
        setMultiGS(res.gameState);
        router.replace(`/results?room=${res.code || roomFromQuery}${res.auctionMode ? `&mode=${res.auctionMode}` : ''}`);
      } else {
        router.replace(`/room?room=${res.code || roomFromQuery}`);
      }
    });
  }, [
    emit,
    gs,
    playerId,
    roomFromQuery,
    router,
    setIsHost,
    setIsSpectator,
    setLobbyMode,
    setLobbyPlayers,
    setMultiGS,
    setMyName,
    setPlayMode,
    setRoomCode,
    setRoomMeta,
  ]);

  // ── Derived memos that MUST come before any early returns (Rules of Hooks) ──
  // These depend on gs but safely handle null via optional chaining.
  const claimedTeamIds = useMemo(() => new Set(
    (lobbyPlayers || [])
      .filter((entry) => !entry.isSpectator && entry.teamId)
      .map((entry) => entry.teamId)
  ), [lobbyPlayers]);
  const teamsWithAuctionState = useMemo(() => new Set(
    TEAMS
      .filter((team) => {
        const squadCount = gs?.squads?.[team.id]?.length || 0;
        const purseLeft = gs?.purses?.[team.id];
        const hasSpent = typeof purseLeft === 'number' ? purseLeft < DEFAULT_PURSE : false;
        const hasSelection = !!gs?.selections?.[team.id];
        const hasBidHistory = (gs?.bidLog || []).some((bid) => bid.teamId === team.id);
        const hasSaleHistory = (gs?.auctionLog || []).some((item) => item.bidder === team.id);
        const isCurrentBidder = gs?.currentBidder === team.id;
        return squadCount > 0 || hasSpent || hasSelection || hasBidHistory || hasSaleHistory || isCurrentBidder;
      })
      .map((team) => team.id)
  ), [gs?.auctionLog, gs?.bidLog, gs?.currentBidder, gs?.purses, gs?.selections, gs?.squads]);
  const displayTeamIds = useMemo(() => {
    if (!isMulti) return TEAMS.map((team) => team.id);
    const ids = new Set([
      ...claimedTeamIds,
      ...teamsWithAuctionState,
      ...(effectiveMyTeamId ? [effectiveMyTeamId] : []),
    ]);
    return ids.size > 0 ? Array.from(ids) : (gs?.activeTeamIds?.length ? gs.activeTeamIds : []);
  }, [claimedTeamIds, effectiveMyTeamId, gs?.activeTeamIds, isMulti, teamsWithAuctionState]);

  if (!gs) {
    return (
      <div style={{ height: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${GOLD}20`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: GOLD, letterSpacing: 3 }}>SYNCING AUCTION ARENA...</div>
        <div style={{ color: '#666', fontSize: 12, letterSpacing: 1.5 }}>
          {roomFromQuery ? `Room ${roomFromQuery}` : 'Rebuilding live auction state'}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (gs.phase === 'selection') {
    return (
      <SelectionScreen
        mySquad={gs.squads[effectiveMyTeamId] || []}
        onSubmit={submitXI}
        submitted={isMulti ? gs.selections[effectiveMyTeamId] : false}
        playersNeeded={11}
        mode={currentMode}
        isHost={isHost}
        emit={emit}
        chatLog={chatLog}
        roomCode={roomCode}
        myName={myName}
        myTeamId={effectiveMyTeamId}
        gs={gs}
        isSpectator={isSpectatorMode}
        activeTeams={(lobbyPlayers || []).filter(player => !player.isSpectator && player.teamId)}
        selections={gs.selections || {}}
        onFinalizeSelection={handleFinalizeSelection}
        squadLimit={gs.squadLimit || 15}
      />
    );
  }

  if (gs.phase === 'finished') { return null; }

  const player      = gs.playerQueue[gs.currentIdx];
  const livePlayerRating = getPlayerRating(player.name, currentMode);
  const pRecord     = getPlayerRecord(player.name);
  const photoUrl    = pRecord?.photo_url || null;
  const stats       = pRecord?.stats || {};

  const displayTeams = TEAMS.filter((team) => displayTeamIds.includes(team.id));
  const rivalsMatch = gs?.rivalsMatch || null;
  const rivalsCountdown = rivalsMatch?.startAt ? formatCountdown(new Date(rivalsMatch.startAt).getTime() - Date.now()) : null;
  const myTeam      = TEAMS.find(t => t.id === effectiveMyTeamId);
  const bidderTeam  = gs.currentBidder ? TEAMS.find(t => t.id === gs.currentBidder) : null;
  const mySquad     = gs.squads[effectiveMyTeamId] || [];
  const osCount     = mySquad.filter(p => p.overseas).length;
  const mySpent     = DEFAULT_PURSE - (gs.purses[effectiveMyTeamId] || 0);
  const squadRoleOrder = ['BAT', 'WK', 'AR', 'BOWL'];
  const mySquadByRole = squadRoleOrder
    .map((role) => [role, mySquad.filter((squadPlayer) => squadPlayer.role === role)])
    .filter(([, players]) => players.length > 0);
  
  // Dynamic limits based on mode
  const maxSquadSize= isRivals ? RIVALS_MAX_SQUAD_SIZE : (gs.squadLimit || 15);
  const maxOverseas = isRivals ? RIVALS_MAX_OVERSEAS : getOverseasLimitForSquad(maxSquadSize);

  const canBid      = gs.phase === 'bidding'
    && gs.currentBidder !== effectiveMyTeamId
    && (gs.purses[effectiveMyTeamId] || 0) >= (gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid))
    && (gs.squads[effectiveMyTeamId]?.length || 0) < maxSquadSize
    && (!player.overseas || osCount < maxOverseas);
  const iLeading    = gs.currentBidder === effectiveMyTeamId;
  const nextPrice   = gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid);
  const isTimerLow  = !gs.isPaused && gs.timer <= 5;
  const configuredTimer = gs.timerDuration || 10;

  const activeOwnedTeamIds = new Set(
    (lobbyPlayers || [])
      .filter((player) => !player.isSpectator && !player.offline && player.teamId)
      .map((player) => player.teamId)
  );
  const sortedTeams = [...displayTeams].sort((a, b) => {
    const aActive = activeOwnedTeamIds.has(a.id) ? 1 : 0;
    const bActive = activeOwnedTeamIds.has(b.id) ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    return (gs.purses[b.id] || 0) - (gs.purses[a.id] || 0);
  });

  return (
    <div className="ac-app-root" style={{ fontFamily: "'Barlow Condensed', sans-serif", background: BG, color: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', overscrollBehavior: 'none', WebkitTapHighlightColor: 'transparent' }}>
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
          background: #09090c;
          border-bottom: 1px solid ${BORDER};
          position: relative;
          z-index: 50;
          flex-shrink: 0;
        }
        .ac-top-main {
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 48px;
          padding: 0 10px;
        }
        .ac-top-left {
          display: flex;
          align-items: center;
          gap: 5px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        .ac-top-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .ac-top-brand { font-family:'Bebas Neue',sans-serif; font-size: 16px; color:${GOLD}; letter-spacing:2px; white-space:nowrap; flex-shrink:0; }
        .ac-top-badge-sm { background:${GOLD}18; border:1px solid ${GOLD}30; padding:2px 6px; font-size:9px; color:${GOLD}; font-weight:600; letter-spacing:1px; white-space:nowrap; border-radius:3px; }
        .ac-top-live-sm  { background:#22D3EE18; border:1px solid #22D3EE30; padding:2px 5px; font-size:9px; color:#22D3EE; letter-spacing:1px; white-space:nowrap; border-radius:3px; }
        .ac-mobile-host-bar { display: none; }

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
          align-items:center; overflow:hidden; position:relative; min-height:0;
        }

        /* Player hero — scrollable area above bid strip */
        .ac-scroll {
          flex:1; overflow-y:auto; overflow-x:hidden;
          display:flex; flex-direction:column; align-items:center;
          padding:12px 14px 4px; width:100%;
          overscroll-behavior: contain;
          overflow-anchor: none;
          min-height:0;
        }

        /* Player compact pill on mobile */
        .ac-player-pill {
          width:100%; max-width:480px; display:flex; align-items:center; gap:10px;
          background:#0f0f12; border:1px solid ${BORDER}; padding:10px 12px; margin-bottom:8px;
          animation: fadeUp .3s ease both; border-radius: 10px;
          min-height: 72px;
          flex-shrink: 0;
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
          min-height: 146px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          flex-shrink:0;
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
          min-height: 30px;
        }

        /* Bid log */
        .ac-bid-log {
          width:100%;
          max-width:480px;
          min-height: 118px;
          display:flex;
          flex-direction:column;
          justify-content:flex-start;
          flex-shrink:0;
        }
        .ac-log-row { display:flex; justify-content:space-between; align-items:center;
          padding:5px 8px; border-radius:4px; margin-bottom:2px; }

        .ac-desktop-squad {
          display:none;
          width:100%;
          max-width:960px;
          margin-top:18px;
          background:linear-gradient(180deg, rgba(15,15,18,0.96), rgba(9,9,12,0.96));
          border:1px solid ${BORDER};
          border-radius:16px;
          overflow:hidden;
          box-shadow:0 18px 48px rgba(0,0,0,0.35);
          flex-shrink:0;
        }
        .ac-desktop-squad-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          padding:16px 18px 12px;
          border-bottom:1px solid ${BORDER};
        }
        .ac-desktop-squad-meta {
          display:grid;
          grid-template-columns:repeat(3, minmax(116px, 1fr));
          gap:10px;
          min-width:378px;
        }
        .ac-desktop-squad-stat {
          background:#101216;
          border:1px solid #1f2430;
          border-radius:10px;
          padding:10px 12px;
          text-align:center;
        }
        .ac-desktop-squad-body {
          padding:14px 18px 18px;
          max-height:280px;
          overflow-y:auto;
        }
        .ac-desktop-squad-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        .ac-desktop-squad-col {
          background:#0d0f14;
          border:1px solid #181d26;
          border-radius:12px;
          padding:12px;
        }
        .ac-desktop-squad-player {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:8px 0;
          border-bottom:1px solid #171b22;
        }
        .ac-desktop-squad-player:last-child { border-bottom:none; }
        .ac-desktop-squad-player-main {
          display:flex;
          align-items:center;
          gap:10px;
          min-width:0;
          flex:1;
        }
        .ac-desktop-squad-avatar {
          width:34px;
          height:34px;
          border-radius:999px;
          overflow:hidden;
          flex-shrink:0;
          border:1px solid #2a3342;
          background:#12161d;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .ac-desktop-squad-empty {
          color:#4b5563;
          text-align:center;
          padding:26px 12px;
          font-size:13px;
          letter-spacing:.5px;
        }

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
          flex-shrink:0;
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
          flex-shrink:0;
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
        .ac-mobile-dock {
          display:none;
        }
        .ac-tab-content {
          width:100%;
          max-width:480px;
          padding:8px 0 0;
          overscroll-behavior: contain;
          flex:1;
          min-height:0;
          overflow:hidden;
          display:flex;
          flex-direction:column;
        }
        .ac-mobile-panel-scroll {
          flex:1;
          min-height:0;
          overflow-y:auto;
          overscroll-behavior:contain;
          padding-bottom:8px;
        }
        .ac-mobile-footer {
          width:100%;
          max-width:480px;
          min-height:34px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          padding:8px 12px calc(8px + env(safe-area-inset-bottom));
          color:#6b7280;
          font-size:10px;
          letter-spacing:1.2px;
          border-top:1px solid #171a22;
          background:linear-gradient(180deg, rgba(8,8,8,0.96), rgba(8,8,8,1));
          flex-shrink:0;
        }
        .ac-mobile-social {
          width:22px;
          height:22px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border:1px solid #242a36;
          color:#cbd5e1;
          background:#10131a;
          flex-shrink:0;
        }
        @media(min-width:861px){ .ac-tab-content { display:none !important; } }
        @media(min-width:861px){ .ac-mobile-dock, .ac-mobile-footer { display:none !important; } }

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
        .ac-player-bought-main {
          display:flex;
          align-items:center;
          gap:8px;
          min-width:0;
          flex:1;
        }

        /* RIGHT sidebar — hidden on mobile */
        .ac-right {
          width: clamp(160px,16vw,220px); border-left: 1px solid ${BORDER};
          display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
        }
        @media(max-width:860px) { .ac-right { display:none; } }
        .ac-right-row { display:flex; flex-direction:column; overflow-y:auto; flex:1; overscroll-behavior: contain; }
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
        .ac-sheet-close {
          width:34px;
          height:34px;
          border-radius:10px;
          border:1px solid #3a3a3a;
          background:#171717;
          color:#f1f5f9;
          font-size:16px;
          font-weight:900;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          box-shadow:0 0 0 1px rgba(255,255,255,0.03);
        }
        .ac-sheet-tabs { display:flex; align-items:stretch; border-bottom:1px solid #1a1a1a; flex-shrink:0; }
        .ac-sheet-tab {
          flex:1; padding:9px 4px; text-align:center; font-size:11px; font-weight:700;
          font-family:'Barlow Condensed',sans-serif; letter-spacing:.5px; cursor:pointer;
          border-bottom:2px solid transparent; color:#555; transition:all .2s;
          display:flex; align-items:center; justify-content:center;
        }
        .ac-sheet-tab.active { color:#fff; border-bottom-color:${GOLD}; }
        .ac-sheet-tab-close {
          width:44px;
          border:0;
          border-left:1px solid #222;
          border-bottom:2px solid transparent;
          background:#111;
          color:#f1f5f9;
          font-size:15px;
          font-weight:900;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
        }
        .ac-sheet-body { flex:1; overflow-y:auto; padding:12px 14px 16px; overscroll-behavior: contain; }
        .ac-os-badge {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-width:24px;
          height:18px;
          padding:0 7px;
          border-radius:999px;
          border:1px solid rgba(147,197,253,0.55);
          background:rgba(37,99,235,0.28);
          color:#dbeafe;
          font-size:9px;
          line-height:1;
          letter-spacing:1px;
          font-weight:900;
          flex-shrink:0;
          box-shadow:0 0 14px rgba(96,165,250,0.18);
        }

        /* ── BOTTOM TICKER ── */
        .ac-ticker { border-top:1px solid ${BORDER}; padding:6px 12px; display:flex;
          gap:14px; overflow-x:auto; flex-shrink:0; background:#060608; align-items:center;
          scrollbar-width:none; }
        .ac-ticker::-webkit-scrollbar { display:none; }
        .ac-ticker-item { flex-shrink:0; font-size:12px; color:#aaa; display:flex; gap:6px; align-items:center;
          background:#ffffff04; padding:3px 10px; border-radius:4px; border:1px solid ${BORDER}; }
        @media(max-width:860px){ .ac-ticker { display:none; } }

        .ac-host-controls { display:none; }
        .ac-host-action {
          height:36px;
          padding:0 14px;
          border-radius:10px;
          border:1px solid #2a2a2a;
          background:#111318;
          color:#d1d5db;
          font-family:'Bebas Neue',sans-serif;
          font-size:14px;
          letter-spacing:1.5px;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          white-space:nowrap;
          transition:all .18s;
        }
        .ac-host-action:hover { border-color:#555; color:#fff; }
        .ac-host-action.active {
          border-color:#22c55e55;
          color:#22c55e;
          background:rgba(34,197,94,0.08);
        }
        .ac-host-action.danger {
          border-color:#ef444440;
          color:#ef4444;
          background:rgba(239,68,68,0.08);
        }
        .ac-host-action.danger:hover { border-color:#ef4444; }
        .ac-settings-btn {
          width:36px;
          height:36px;
          border-radius:10px;
          border:1px solid #2a2a2a;
          background:#111318;
          color:#aaa;
          font-size:16px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          transition:all .18s;
        }
        .ac-settings-btn:hover,
        .ac-settings-btn.active {
          border-color:${GOLD}55;
          color:${GOLD};
          background:${GOLD}14;
        }
        .ac-desktop-settings-backdrop {
          position:fixed;
          inset:0;
          background:transparent;
          z-index:55;
        }
        .ac-desktop-settings {
          position:absolute;
          top:calc(100% + 10px);
          right:12px;
          width:min(320px, calc(100vw - 24px));
          padding:16px;
          background:#0b0c10;
          border:1px solid ${BORDER};
          border-radius:16px;
          box-shadow:0 24px 60px rgba(0,0,0,0.55);
          z-index:60;
        }
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
           .ac-host-controls { display:flex; align-items:center; gap:8px; }
           .ac-top-main { padding: 0 24px; min-height: 56px; gap: 12px; }
           .ac-desktop-settings { right: 24px; }
           .ac-desktop-squad { display:block; }
           .ac-sheet-bg { z-index:58; backdrop-filter:blur(10px); }
           .ac-sheet {
             z-index:59;
             top:76px;
             bottom:auto;
             left:50%;
             right:auto;
             width:min(980px, calc(100vw - 48px));
             max-height:min(78vh, 760px);
             border:1px solid ${BORDER};
             border-radius:20px;
             transform:translateX(-50%);
             box-shadow:0 28px 80px rgba(0,0,0,0.55);
           }
           .ac-sheet-header { padding:14px 18px; }
           .ac-sheet-body { padding:16px 18px 20px; }

           /* Desktop Navbar Enhancements */
           .ac-top-brand { font-size: 20px; letter-spacing: 3px; margin-right: 8px; }
           .ac-top-badge-sm { font-size: 13px; padding: 6px 12px; border-radius: 6px; letter-spacing: 2px; }
           .ac-top-live-sm { font-size: 13px; padding: 6px 12px; border-radius: 6px; letter-spacing: 2px; }
        }
        @media(max-width: 860px) {
          .ac-top-main {
            padding: 8px 10px;
          }
          .ac-mobile-host-bar {
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            padding:0 10px 10px;
          }
          .ac-host-action {
            flex:1;
            min-width:0;
            height:34px;
            padding:0 12px;
            border-radius:999px;
            font-size:12px;
            letter-spacing:1.2px;
          }
          .ac-scroll {
            padding: 10px 12px 8px;
          }
          .ac-bid-area {
            min-height: 154px;
          }
          .ac-bid-log {
            min-height: 110px;
          }
          .ac-desktop-squad-grid {
            grid-template-columns:1fr;
          }
          .ac-mobile-dock {
            display:flex;
            flex-direction:column;
            width:100%;
            max-width:100%;
            padding:0 12px 0;
            gap:0;
            flex:1;
            min-height:0;
            overflow:hidden;
            background:${BG};
          }
          .ac-tab-content {
            max-width:none;
          }
          .ac-bid-row {
            max-width:none;
            padding-top: 8px;
            margin:0 0 4px;
          }
          .ac-mob-tabs {
            max-width:none;
            padding-top: 2px;
            margin-bottom:0;
          }
        }
      `}</style>

      <SquadModal 
        isOpen={showSquad} 
        onClose={() => { setShowSquad(false); setViewingTeam(null); }} 
        squads={gs.squads} 
        myTeamId={viewingTeam || effectiveMyTeamId} 
        TEAMS={displayTeams}
        maxSquad={maxSquadSize}
        maxOverseas={maxOverseas}
      />
      <StatsModal  isOpen={showStats} onClose={() => setShowStats(false)} gs={multiGS || g.current} TEAMS={displayTeams} myTeamId={myTeamId} />
      <UpcomingModal
        isOpen={showUpcoming}
        onClose={closeUpcomingModal}
        upcomingPlayers={upcomingPlayers}
        groupedUpcoming={groupedUpcoming}
      />
      <AppDialog
        isOpen={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        tone={dialog?.tone}
        actions={dialog?.actions || []}
        onClose={closeDialog}
      />

      {/* ── TIMER PROGRESS BAR (top, full width) ── */}
      <TimerBar timer={gs.timer} maxTimer={configuredTimer} isPaused={gs.isPaused} />

      {/* ── TOP BAR ── */}
      <div className="ac-top">
        <div className="ac-top-main">
          <div className="ac-top-left">
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
            
            {isMulti && (
              <div className="ac-desktop-only" style={{ marginLeft: 6, background: '#111', border: `1px solid ${BORDER}`, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6 }}>
                <span style={{ fontSize: 8 }}>🟢</span>
                <span style={{ fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>
                  {lobbyPlayers?.filter(p => !p.isSpectator && p.teamId).length || 0} / {displayTeams.length} {isRivals ? 'RIVALS' : 'TEAMS'}
                </span>
              </div>
            )}

            <button className="ac-top-btn ac-desktop-only" onClick={openRulesDialog} style={{ marginLeft: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>RULES</span>
              <span style={{ background: `${GOLD}22`, color: GOLD, padding: '2px 6px', borderRadius: 999, fontSize: 9 }}>(i)</span>
            </button>

            <button className="ac-top-btn ac-desktop-only" onClick={handleAudioMuteToggle} style={{ marginLeft: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{audioMuted ? 'UNMUTE' : 'MUTE'}</span>
              <span style={{ fontSize: 12, lineHeight: 1 }}>{audioMuted ? '🔇' : '🔊'}</span>
            </button>
            
            <button className="ac-top-btn ac-desktop-only" onClick={() => setShowUpcoming(true)} style={{ marginLeft: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>UPCOMING PLAYERS</span>
              <span style={{ background: 'rgba(34,211,238,0.2)', padding: '2px 6px', borderRadius: 4, fontSize: 9 }}>{upcomingPlayers.length}</span>
            </button>

            <button
              className="ac-top-btn ac-top-btn-gold ac-desktop-only"
              onClick={() => {
                setHamburgerTab('upcoming');
                setShowHamburger(true);
              }}
              style={{ marginLeft: 6, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>☰</span>
              <span>MARKET TABS</span>
            </button>
          </div>

          <div className="ac-top-right">
            {isMulti && isHost && (
              <>
                <button
                  className={`ac-settings-btn ac-desktop-only${showDesktopSettings ? ' active' : ''}`}
                  title="Auction settings"
                  onClick={() => setShowDesktopSettings(prev => !prev)}
                >
                  ⚙
                </button>
                <div className="ac-host-controls">
                  <button
                    className={`ac-host-action${gs.isPaused ? ' active' : ''}`}
                    onClick={handleHostPauseToggle}
                  >
                    {gs.isPaused ? 'RESUME' : 'PAUSE'}
                  </button>
                  <button className="ac-host-action danger" onClick={openEndAuctionDialog}>
                    END AUCTION
                  </button>
                </div>
              </>
            )}
            {isMulti && !isHost && (
              <button
                className="ac-host-action ac-desktop-only danger"
                onClick={openLeaveAuctionDialog}
                style={{ height: 36 }}
              >
                LEAVE
              </button>
            )}

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
        </div>

        <div className="ac-mobile-host-bar" style={{ paddingTop: 0 }}>
          <button className="ac-host-action" onClick={openRulesDialog}>
            RULES
          </button>
          <button className={`ac-host-action${audioMuted ? ' active' : ''}`} onClick={handleAudioMuteToggle}>
            {audioMuted ? 'UNMUTE' : 'MUTE'}
          </button>
          {isMulti && isHost && (
            <button
              className={`ac-host-action${showPlayerRatings ? ' active' : ''}`}
              onClick={() => handlePlayerRatingsVisibilityChange(!showPlayerRatings)}
            >
              RATINGS {showPlayerRatings ? 'ON' : 'OFF'}
            </button>
          )}
        </div>

        {isRivals && rivalsMatch && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 12px 10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={`/assets/${rivalsMatch.homeTeam}.png`} style={{ width: 26, height: 26, objectFit: 'contain' }} alt="" />
              <span style={{ color: '#cbd5e1', fontSize: 12, letterSpacing: 1.5, fontWeight: 700 }}>
                {rivalsMatch.homeTeam} VS {rivalsMatch.awayTeam}
              </span>
              <img src={`/assets/${rivalsMatch.awayTeam}.png`} style={{ width: 26, height: 26, objectFit: 'contain' }} alt="" />
              {rivalsMatch.isHighProfile && (
                <span style={{ background: 'rgba(232,184,75,0.14)', border: `1px solid ${GOLD}40`, color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, padding: '3px 8px', borderRadius: 999 }}>
                  MARQUEE FIXTURE
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 11, letterSpacing: 1 }}>
              <span>{rivalsMatch.venue}</span>
              <span style={{ color: '#334155' }}>•</span>
              <span style={{ color: CYAN, fontWeight: 700 }}>MATCH START {rivalsCountdown}</span>
            </div>
          </div>
        )}

        {isMulti && isHost && (
          <div className="ac-mobile-host-bar">
            <button
              className={`ac-host-action${gs.isPaused ? ' active' : ''}`}
              onClick={handleHostPauseToggle}
            >
              {gs.isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <button className="ac-host-action danger" onClick={openEndAuctionDialog}>
              END AUCTION
            </button>
          </div>
        )}
        {isMulti && !isHost && (
          <div className="ac-mobile-host-bar">
            <button className="ac-host-action danger" onClick={openLeaveAuctionDialog}>
              LEAVE AUCTION
            </button>
          </div>
        )}

        {showDesktopSettings && isMulti && isHost && (
          <>
            <div className="ac-desktop-settings-backdrop" onClick={closeDesktopSettings} />
            <div className="ac-desktop-settings">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, color:GOLD, letterSpacing:2 }}>AUCTION SETTINGS</div>
                  <div style={{ color:'#666', fontSize:11, letterSpacing:1.2, marginTop:2 }}>Host controls for the live room</div>
                </div>
                <button
                  onClick={closeDesktopSettings}
                  style={{ background:'transparent', border:'none', color:'#666', fontSize:20, cursor:'pointer', lineHeight:1 }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:12, padding:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div>
                    <div style={{ color:'#ddd', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>⏱ Bid Timer</div>
                    <div style={{ color:'#555', fontSize:11, marginTop:3 }}>Change the default countdown for every bid round.</div>
                  </div>
                  <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:1 }}>{configuredTimer}s</div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap:8 }}>
                  {timerOptions.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        handleTimerDurationChange(t);
                        closeDesktopSettings();
                      }}
                      style={{
                        padding:'10px 0',
                        background: configuredTimer === t ? GOLD : '#18181b',
                        color: configuredTimer === t ? '#000' : '#bbb',
                        border:`1px solid ${configuredTimer === t ? GOLD : '#2a2a2a'}`,
                        borderRadius:8,
                        fontFamily:"'Barlow Condensed'",
                        fontWeight:700,
                        fontSize:14,
                        cursor:'pointer',
                      }}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:12, padding:'14px', marginTop:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div>
                    <div style={{ color:'#ddd', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>👥 Squad Limit</div>
                    <div style={{ color:'#555', fontSize:11, marginTop:3 }}>Change how many players each franchise can buy before the auction ends.</div>
                  </div>
                  <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:1 }}>{gs.squadLimit || maxSquadSize}</div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:8 }}>
                  {squadLimitOptions.map((limit) => (
                    <button
                      key={limit}
                      onClick={() => {
                        handleSquadLimitChange(limit);
                        closeDesktopSettings();
                      }}
                      style={{
                        padding:'10px 0',
                        background: (gs.squadLimit || maxSquadSize) === limit ? GOLD : '#18181b',
                        color: (gs.squadLimit || maxSquadSize) === limit ? '#000' : '#bbb',
                        border:`1px solid ${(gs.squadLimit || maxSquadSize) === limit ? GOLD : '#2a2a2a'}`,
                        borderRadius:8,
                        fontFamily:"'Barlow Condensed'",
                        fontWeight:700,
                        fontSize:14,
                        cursor:'pointer',
                      }}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:12, padding:'14px', marginTop:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div>
                    <div style={{ color:'#ddd', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>📊 Player Ratings</div>
                    <div style={{ color:'#555', fontSize:11, marginTop:3 }}>Choose whether live bidders can see player ratings during the auction.</div>
                  </div>
                  <div style={{ color:showPlayerRatings ? GOLD : '#94A3B8', fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>
                    {showPlayerRatings ? 'SHOWN' : 'HIDDEN'}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:8 }}>
                  {[
                    { label: 'HIDDEN', value: false, color: '#94A3B8' },
                    { label: 'SHOWN', value: true, color: GOLD },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        handlePlayerRatingsVisibilityChange(option.value);
                        closeDesktopSettings();
                      }}
                      style={{
                        padding:'10px 0',
                        background: showPlayerRatings === option.value ? option.color : '#18181b',
                        color: showPlayerRatings === option.value ? '#000' : '#bbb',
                        border:`1px solid ${showPlayerRatings === option.value ? option.color : '#2a2a2a'}`,
                        borderRadius:8,
                        fontFamily:"'Barlow Condensed'",
                        fontWeight:700,
                        fontSize:14,
                        cursor:'pointer',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:12, padding:'14px', marginTop:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div>
                    <div style={{ color:'#ddd', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>🚫 Player Control</div>
                    <div style={{ color:'#555', fontSize:11, marginTop:3 }}>Remove unknown players and free their room slot.</div>
                  </div>
                  <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:1 }}>{manageablePlayers.length}</div>
                </div>
                <div style={{ display:'grid', gap:8, maxHeight:220, overflowY:'auto' }}>
                  {manageablePlayers.length === 0 ? (
                    <div style={{ color:'#666', fontSize:12, textAlign:'center', padding:'10px 0' }}>No kickable players right now.</div>
                  ) : manageablePlayers.map((player) => {
                    const team = player.teamId ? TEAMS.find((entry) => entry.id === player.teamId) : null;
                    return (
                      <div key={player.id} style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'space-between', border:'1px solid #1f2937', borderRadius:10, padding:'10px 12px', background:'rgba(255,255,255,0.02)' }}>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ color:'#e5e7eb', fontSize:13, fontWeight:700 }}>{player.name}</div>
                          <div style={{ color:team?.color || '#64748b', fontSize:10, letterSpacing:1.1, marginTop:4 }}>
                            {player.isSpectator ? 'SPECTATOR' : team ? `${team.short} PLAYER` : 'WAITING FOR TEAM'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleKickPlayer(player)}
                          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #7f1d1d', background:'#2a0d0d', color:'#fca5a5', fontWeight:800, fontSize:11, letterSpacing:1, cursor:'pointer' }}
                        >
                          KICK
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
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
            
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, color:'#fff', letterSpacing:2, lineHeight:1.1, marginBottom:4 }}>{player.name.toUpperCase()}</div>
            <div style={{ color:ROLE_C[player.role], fontSize:11, fontWeight:700, letterSpacing:3, marginBottom:16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>{ROLE_L[player.role]} · {player.overseas ? 'OVERSEAS' : 'INDIAN'}</span>
            </div>

            <div style={{ background:'rgba(255,255,255,.03)', border:`1px solid ${showPlayerRatings ? `${GOLD}33` : BORDER}`, borderRadius:8, padding:'10px 8px', marginBottom:8 }}>
              <div style={{ color:'#444', fontSize:9, letterSpacing:2, marginBottom:4 }}>PLAYER RATING</div>
              <div style={{ color:showPlayerRatings ? GOLD : '#6b7280', fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>
                {showPlayerRatings ? `${livePlayerRating}/100` : 'HIDDEN'}
              </div>
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
                  const t = displayTeams.find(t => t.id === b.teamId) || TEAMS.find(t => t.id === b.teamId);
                  return (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 8px', borderRadius:4, background:i===0?`${t?.color}18`:'transparent', marginBottom:2, border:i===0?`1px solid ${t?.color}30`:'none' }}>
                      <span style={{ color:t?.color, fontWeight:700, fontSize:12 }}>{t ? getTeamLabel(t, { short: true }) : b.teamId}</span>
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
                  <div style={{ color:bidderTeam?.color, fontSize:18, fontWeight:700, letterSpacing:2, marginTop:8 }}>{bidderTeam ? getTeamLabel(bidderTeam) : ''}</div>
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
                    <div className="ac-player-name">{player.name.toUpperCase()}</div>
                    <div className="ac-player-meta" style={{ color:ROLE_C[player.role], display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: 10, background: `${ROLE_C[player.role]}20`, color: ROLE_C[player.role], padding: '1px 5px', borderRadius: 3, letterSpacing: 1, fontWeight: 700 }}>{ROLE_L[player.role]}</span>
                      {player.overseas && <span className="ac-os-badge">OS</span>}
                      {player.isWildcard && <span style={{ fontSize: 9, background: `${GOLD}18`, color: GOLD, padding: '1px 5px', borderRadius: 3, letterSpacing: 1, fontWeight: 700 }}>WILDCARD</span>}
                    </div>
                    <div style={{ fontSize:10, color:'#444', letterSpacing:.5, marginTop:2 }}>
                      Base: {fmt(player.base)} · #{gs.currentIdx + 1}/{gs.playerQueue.length}
                      <span style={{ color: showPlayerRatings ? GOLD : '#6b7280', marginLeft: 6 }}>
                        · RTG {showPlayerRatings ? livePlayerRating : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bid amount */}
                <div className="ac-bid-area">
                  <div className="ac-bid-label">CURRENT BID</div>
                  <div className="ac-bid-amount">{fmt(gs.currentBid)}</div>
                  {bidderTeam ? (
                    <div className="ac-leading-pill" style={{ background:`${bidderTeam.color}14`, border:`1px solid ${bidderTeam.color}40` }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:bidderTeam.color,boxShadow:`0 0 8px ${bidderTeam.color}` }} />
                      <span style={{ color:bidderTeam.color, fontWeight:700, fontSize:14 }}>{getTeamLabel(bidderTeam)}</span>
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
                              <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.5rem', letterSpacing:2 }}>{player.overseas && osCount >= maxOverseas ? `MAX ${maxOverseas} OVERSEAS` : 'INSUFFICIENT FUNDS'}</span>
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
                      const t = displayTeams.find(t => t.id === b.teamId) || TEAMS.find(t => t.id === b.teamId);
                      return (
                        <div key={i} className="ac-log-row" style={{ background:i===0?`${t?.color}12`:'transparent', animation:i===0?'rowIn .2s ease':'none', opacity:Math.max(.1,1-i*.2) }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <div style={{ width:6,height:6,borderRadius:'50%',background:t?.color }} />
                            <span style={{ color:t?.color, fontWeight:700, fontSize:13 }}>{t ? getTeamLabel(t, { short: true }) : b.teamId}</span>
                            {b.teamId === effectiveMyTeamId && <span style={{ fontSize:9, background:`${t?.color}33`, color:t?.color, padding:'1px 5px', borderRadius:6 }}>YOU</span>}
                          </div>
                          <span style={{ color:GOLD, fontWeight:700, fontSize:13 }}>{fmt(b.bid)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="ac-desktop-squad">
                  <div className="ac-desktop-squad-head">
                    <div>
                      <div style={{ fontFamily:"'Bebas Neue'", fontSize:28, letterSpacing:2, color:myTeam?.color || GOLD }}>
                        {myTeam ? getTeamLabel(myTeam, { short: true }) : 'YOUR TEAM'} SQUAD
                      </div>
                      <div style={{ color:'#6b7280', fontSize:12, letterSpacing:1.1, marginTop:4 }}>
                        Your own buys stay visible here, while the franchise rail on the right still opens every team.
                      </div>
                    </div>
                    <div className="ac-desktop-squad-meta">
                      <div className="ac-desktop-squad-stat">
                        <div style={{ color:'#6b7280', fontSize:10, letterSpacing:1.6 }}>PLAYERS</div>
                        <div style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:1, whiteSpace:'nowrap' }}>{mySquad.length}/{maxSquadSize}</div>
                      </div>
                      <div className="ac-desktop-squad-stat">
                        <div style={{ color:'#6b7280', fontSize:10, letterSpacing:1.6 }}>OVERSEAS</div>
                        <div style={{ color:'#a78bfa', fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:1, whiteSpace:'nowrap' }}>{osCount}/{maxOverseas}</div>
                      </div>
                      <div className="ac-desktop-squad-stat">
                        <div style={{ color:'#6b7280', fontSize:10, letterSpacing:1.6 }}>SPENT</div>
                        <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:1, whiteSpace:'nowrap' }}>{fmt(mySpent)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="ac-desktop-squad-body squad-scroller">
                    {mySquad.length === 0 ? (
                      <div className="ac-desktop-squad-empty">No players bought yet. As soon as you win bids, your squad will build out here automatically.</div>
                    ) : (
                      <div className="ac-desktop-squad-grid">
                        {mySquadByRole.map(([role, rolePlayers]) => (
                          <div key={role} className="ac-desktop-squad-col">
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <span style={{ fontSize:18 }}>{ROLE_EMOJI[role]}</span>
                                <span style={{ color:ROLE_C[role], fontWeight:800, fontSize:13, letterSpacing:1.4 }}>{ROLE_L[role].toUpperCase()}</span>
                              </div>
                              <span style={{ color:'#6b7280', fontSize:11 }}>{rolePlayers.length}</span>
                            </div>

                            {rolePlayers.map((squadPlayer, index) => (
                              <div key={`${role}-${squadPlayer.name}-${index}`} className="ac-desktop-squad-player">
                                <div className="ac-desktop-squad-player-main">
                                  <div className="ac-desktop-squad-avatar">
                                    {getPlayerPhoto(squadPlayer.name) ? (
                                      <img
                                        src={getPlayerPhoto(squadPlayer.name)}
                                        alt={squadPlayer.name}
                                        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
                                      />
                                    ) : (
                                      <span style={{ fontSize:15 }}>{ROLE_EMOJI[role]}</span>
                                    )}
                                  </div>
                                  <div style={{ minWidth:0, flex:1 }}>
                                    <div style={{ color:'#e5e7eb', fontSize:14, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                      {squadPlayer.name}
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                                      {squadPlayer.overseas && (
                                        <span style={{ fontSize:9, background:'#6366f120', color:'#818cf8', padding:'2px 6px', borderRadius:999, letterSpacing:1 }}>
                                          OS
                                        </span>
                                      )}
                                      <span style={{ color:'#4b5563', fontSize:10, letterSpacing:1.2 }}>
                                        {squadPlayer.setName || 'Auction buy'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ flexShrink:0, textAlign:'right' }}>
                                  <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1, whiteSpace:'nowrap' }}>
                                    {fmt(squadPlayer.soldFor || squadPlayer.base)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* end bid log */}
              </div>{/* end ac-scroll */}

              <div className="ac-mobile-dock">
                {/* ── INLINE BID ROW (mobile, fixed dock) ── */}
                <div className="ac-bid-row">
                  <div className="ac-purse-label">
                    Purse: <span className="ac-purse-val">₹{(gs.purses[effectiveMyTeamId]||0).toFixed(1)} Cr</span>
                  </div>
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
                          {player.overseas && osCount >= maxOverseas ? `MAX ${maxOverseas} OVERSEAS` : 'CANNOT BID'}
                        </span>
                      )}
                    </button>
                  )}
                  <button className="ac-menu-btn" onClick={() => setShowHamburger(true)}>≡</button>
                </div>

                <div className="ac-mob-tabs">
                  {[['chat','Chat'],['teams','Teams'],['settings','Settings']].map(([id,label]) => (
                    <div key={id} className={`ac-mob-tab${mobileTab===id?' active':''}`}
                      onClick={() => setMobileTab(id)}>{label}</div>
                  ))}
                </div>

                <div className="ac-tab-content">
                  <div className="ac-mobile-panel-scroll" style={mobileTab === 'chat' ? { overflowY:'hidden', paddingBottom:0 } : {}}>
                {mobileTab === 'teams' && sortedTeams.map(team => {
                  const isLead = team.id === gs.currentBidder;
                  const isMe   = team.id === effectiveMyTeamId;
                  const squad  = gs.squads[team.id] || [];
                  const spent  = DEFAULT_PURSE - (gs.purses[team.id] || 0);
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
                            <span style={{ fontWeight:700, color: isMe ? team.color : '#ddd', fontSize:15, letterSpacing:.5 }}>{getTeamLabel(team, { short: true })}</span>
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
                                    <div className="ac-player-bought-main">
                                      <div className="ac-desktop-squad-avatar" style={{ width:28, height:28 }}>
                                        {getPlayerPhoto(p.name) ? (
                                          <img
                                            src={getPlayerPhoto(p.name)}
                                            alt={p.name}
                                            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
                                          />
                                        ) : (
                                          <span style={{ fontSize:12 }}>{ROLE_EMOJI[role]}</span>
                                        )}
                                      </div>
                                      <div style={{ minWidth:0, flex:1 }}>
                                        <span style={{ color:'#ccc', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block' }}>{p.name}</span>
                                        {p.overseas && (
                                          <span className="ac-os-badge" style={{ marginTop:2 }}>OS</span>
                                        )}
                                      </div>
                                    </div>
                                    <span style={{ color:GOLD, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>{fmt(p.soldFor||p.base)}</span>
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
                        <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>{configuredTimer}s</div>
                      </div>
                      {isHost && (
                        <div style={{ display:'flex', gap:6 }}>
                          {timerOptions.map(t => (
                            <button key={t} onClick={() => handleTimerDurationChange(t)}
                              style={{ flex:1, padding:'7px 0', background: configuredTimer===t ? GOLD : '#1a1a1a',
                                color: configuredTimer===t ? '#000' : '#888', border:'none', borderRadius:6,
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
                          {isRivals ? 'Rivals Auction' : (isMulti ? lobbyMode : auctionMode) === 'mega' ? 'Mega Auction' : 'Mini Auction'}
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
                    {isHost && (
                      <div style={{ background:'#0f0f12', border:'1px solid #1c1c1c', borderRadius:10, padding:'14px', marginTop:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                          <div>
                            <div style={{ color:'#ddd', fontSize:14, fontWeight:700 }}>🚫 Kick Players</div>
                            <div style={{ color:'#555', fontSize:10, marginTop:2 }}>Remove unknown players from the live room.</div>
                          </div>
                          <span style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:1 }}>{manageablePlayers.length}</span>
                        </div>
                        <div style={{ display:'grid', gap:8 }}>
                          {manageablePlayers.length === 0 ? (
                            <div style={{ color:'#666', fontSize:12, textAlign:'center', padding:'8px 0' }}>No kickable players right now.</div>
                          ) : manageablePlayers.map((player) => {
                            const team = player.teamId ? TEAMS.find((entry) => entry.id === player.teamId) : null;
                            return (
                              <div key={player.id} style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'space-between', border:'1px solid #1f2937', borderRadius:10, padding:'10px 12px', background:'rgba(255,255,255,0.02)' }}>
                                <div style={{ minWidth:0, flex:1 }}>
                                  <div style={{ color:'#e5e7eb', fontSize:13, fontWeight:700 }}>{player.name}</div>
                                  <div style={{ color:team?.color || '#64748b', fontSize:10, letterSpacing:1.1, marginTop:4 }}>
                                    {player.isSpectator ? 'SPECTATOR' : team ? `${team.short} PLAYER` : 'WAITING FOR TEAM'}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleKickPlayer(player)}
                                  style={{ padding:'7px 10px', borderRadius:8, border:'1px solid #7f1d1d', background:'#2a0d0d', color:'#fca5a5', fontWeight:800, fontSize:11, letterSpacing:1, cursor:'pointer' }}
                                >
                                  KICK
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {mobileTab === 'chat' && (
                  <MobileChatBox chatLog={chatLog} emit={emit} currentRoom={roomCode} isSpectator={isSpectatorMode} myName={myName} myTeamId={effectiveMyTeamId} gs={gs} />
                )}
                  </div>
                </div>
                <div className="ac-mobile-footer">
                  <span>Join the community</span>
                  <a className="ac-mobile-social" href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noreferrer" aria-label="Join WhatsApp community" style={{ color: 'inherit', textDecoration: 'none' }}><WhatsAppIcon /></a>
                  <span className="ac-mobile-social"><TelegramIcon /></span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: teams */}
        <div className="ac-right">
          <div style={{ padding:'6px 12px', fontSize:9, letterSpacing:3, color:'#444', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>{isRivals ? 'RIVALS' : 'FRANCHISES'}</div>
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
                      <span style={{ fontWeight:700, color:'#ddd', fontSize:13, letterSpacing:.5 }}>{getTeamLabel(team, { short: true })}</span>
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
            <div style={{ padding:'8px 12px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#25D366', textDecoration:'none', fontSize:11, letterSpacing:1.5, fontWeight:700 }}
              >
                <WhatsAppIcon />
                JOIN WHATSAPP COMMUNITY
              </a>
            </div>
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
          const t = displayTeams.find(t => t.id === item.bidder);
          return (
            <div key={i} className="ac-ticker-item">
              <span>{item.player.name}</span>
              {item.sold ? (<><span style={{ color:GOLD }}>→</span><span style={{ color:t?.color, fontWeight:900 }}>{t ? getTeamLabel(t, { short: true }) : item.bidder}</span><span style={{ color:'#ddd', fontWeight:700 }}>{fmt(item.price)}</span></>) : <span style={{ color:'#ef4444', fontWeight:700 }}>UNSOLD</span>}
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
                      <span style={{ fontWeight:700, color:'#ddd', fontSize:16, letterSpacing:.5 }}>{getTeamLabel(team, { short: true })}</span>
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
              <button className="ac-sheet-close" onClick={() => setShowHamburger(false)} aria-label="Close more panel">X</button>
            </div>
            {/* Sub-tabs */}
            <div className="ac-sheet-tabs">
              {[['upcoming','Upcoming'],['sold','Sold'],['unsold','Unsold'],['leaderboard','Leaderboard']].map(([id,label]) => (
                <div key={id} className={`ac-sheet-tab${hamburgerTab===id?' active':''}`}
                  onClick={() => setHamburgerTab(id)}>{label}</div>
              ))}
              <button className="ac-sheet-tab-close" onClick={() => setShowHamburger(false)} aria-label="Close more panel">X</button>
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
                          <div key={i} style={{ background:'#0d0d10', border:'1px solid #1a1a1a', borderRadius:6, padding:'7px 9px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:12, color:'#aaa', minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                            <span style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                              {p.overseas && <span className="ac-os-badge">OS</span>}
                              <span style={{ fontSize:10, color:ROLE_C[p.role] }}>{ROLE_EMOJI[p.role]}</span>
                            </span>
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
                    const t = displayTeams.find(t => t.id === item.bidder);
                    return (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #141414' }}>
                        <div>
                          <div style={{ color:'#ddd', fontWeight:700, fontSize:13 }}>{item.player.name}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                            <span style={{ fontSize:10, color:ROLE_C[item.player.role] }}>{ROLE_L[item.player.role]}</span>
                            {item.player.overseas && <span className="ac-os-badge">OS</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color:t?.color, fontWeight:700, fontSize:12 }}>{t ? getTeamLabel(t, { short: true }) : item.bidder}</div>
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
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                          <span style={{ fontSize:10, color:ROLE_C[item.player.role] }}>{ROLE_L[item.player.role]}</span>
                          {item.player.overseas && <span className="ac-os-badge">OS</span>}
                        </div>
                      </div>
                      <span style={{ color:'#ef4444', fontWeight:700, fontSize:11, letterSpacing:1 }}>UNSOLD</span>
                    </div>
                  ));
              })()}

              {/* LEADERBOARD */}
              {hamburgerTab === 'leaderboard' && (() => {
                const board = [...displayTeams]
                  .map(t => ({ team:t, topBid: Math.max(...((gs.auctionLog||[]).filter(x=>x.sold&&x.bidder===t.id).map(x=>x.price)), 0), spent: DEFAULT_PURSE-(gs.purses[t.id]||0) }))
                  .sort((a,b) => b.topBid - a.topBid);
                return (
                  <div>
                    <div style={{ fontSize:9, letterSpacing:3, color:'#555', marginBottom:12 }}>HIGHEST SINGLE BID · {isRivals ? 'TODAY’S RIVALS' : 'ALL TEAMS'}</div>
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
function SelectionScreen({ mySquad, onSubmit, submitted, playersNeeded = 11, mode = 'mega', isHost = false, activeTeams = [], selections = {}, onFinalizeSelection, squadLimit = 15, chatLog = [], emit, roomCode, myName = '', myTeamId, gs, isSpectator = false }) {
  const [selected, setSelected] = useState([]);
  const ratingMode = String(mode || 'mega').toLowerCase() === 'mini' ? 'mini' : 'mega';

  useEffect(() => {
    if (!Array.isArray(mySquad) || mySquad.length === 0) {
      setSelected([]);
      return;
    }
    setSelected((prev) => {
      if (prev.length > 0) return prev;
      const autoXI = selectPlayingXI(mySquad, ratingMode);
      const topRatedSquad = [...mySquad]
        .sort((a, b) => getPlayerRating(b.name, ratingMode) - getPlayerRating(a.name, ratingMode))
        .slice(0, playersNeeded);

      if (autoXI.length >= playersNeeded) {
        return autoXI.slice(0, playersNeeded);
      }

      const selectedNames = new Set(autoXI.map((player) => player.name));
      const filledXI = [...autoXI];
      for (const player of topRatedSquad) {
        if (filledXI.length >= playersNeeded) break;
        if (selectedNames.has(player.name)) continue;
        filledXI.push(player);
        selectedNames.add(player.name);
      }

      return filledXI.slice(0, Math.min(playersNeeded, mySquad.length));
    });
  }, [mySquad, playersNeeded, ratingMode]);

  const toggle = (p) => setSelected((prev) =>
    prev.find((x) => x.name === p.name)
      ? prev.filter((x) => x.name !== p.name)
      : prev.length < playersNeeded ? [...prev, p] : prev
  );

  const getRoleCategory = useCallback((role) => {
    const value = String(role || '').toUpperCase();
    if (value.includes('WK') || value.includes('KEEP')) return 'wk';
    if (value.includes('BOWL')) return 'bowl';
    if (value.includes('BAT')) return 'bat';
    if (value.includes('AR') || value.includes('ROUND')) return 'ar';
    return 'other';
  }, []);

  const selectedNames = useMemo(() => new Set(selected.map((p) => p.name)), [selected]);

  const roleSummary = useMemo(() => {
    return selected.reduce((acc, player) => {
      const category = getRoleCategory(player.role);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, { bat: 0, bowl: 0, wk: 0, ar: 0, other: 0 });
  }, [getRoleCategory, selected]);

  const getValidationErrors = () => {
    if ((mySquad?.length || 0) < squadLimit) return `You need to buy ${squadLimit} players before submitting your XI.`;
    if (selected.length !== playersNeeded) return `Select ${playersNeeded} players.`;
    if (roleSummary.bat < 2) return 'Must have at least 2 Batsmen';
    if (roleSummary.bowl < 2) return 'Must have at least 2 Bowlers';
    if (roleSummary.wk < 1) return 'Must have at least 1 Wicketkeeper';
    return null;
  };

  const validationError = getValidationErrors();
  const canSubmit = validationError === null;
  const submittedCount = activeTeams.filter((player) => selections[player.teamId]).length;
  const totalTeams = activeTeams.length;
  const playersLeft = Math.max(playersNeeded - selected.length, 0);
  const roleTargets = [
    { key: 'bat', label: 'Batters', count: roleSummary.bat, min: 2, color: '#60A5FA' },
    { key: 'bowl', label: 'Bowlers', count: roleSummary.bowl, min: 2, color: '#F97316' },
    { key: 'wk', label: 'Wicketkeepers', count: roleSummary.wk, min: 1, color: '#34D399' },
    { key: 'ar', label: 'All-rounders', count: roleSummary.ar, min: 0, color: '#C084FC' },
  ];
  const selectionRules = [
    `Your squad must contain ${squadLimit} players before the XI can be submitted.`,
    `Select exactly ${playersNeeded} players from your squad.`,
    'Minimum balance required: 2 batters, 2 bowlers, 1 wicketkeeper.',
    'Tap any player card to add or remove them from the XI.',
    'Your submitted XI is locked for results once you confirm.',
  ];
  const enrichedSquad = useMemo(() => {
    return [...(mySquad || [])]
      .map((player) => ({
        ...player,
        photoUrl: getPlayerPhoto(player.name),
        rating: getPlayerRating(player.name, ratingMode),
        roleCategory: getRoleCategory(player.role),
        isSelected: selectedNames.has(player.name),
      }))
      .sort((a, b) => {
        if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;
        if (a.rating !== b.rating) return b.rating - a.rating;
        return (b.soldFor || b.base || 0) - (a.soldFor || a.base || 0);
      });
  }, [getRoleCategory, mySquad, ratingMode, selectedNames]);
  const selectedOrdered = useMemo(() => {
    return [...selected].sort((a, b) => {
      const aRole = getRoleCategory(a.role);
      const bRole = getRoleCategory(b.role);
      const order = { wk: 0, bat: 1, ar: 2, bowl: 3, other: 4 };
      if (order[aRole] !== order[bRole]) return order[aRole] - order[bRole];
      const ratingDiff = getPlayerRating(b.name, ratingMode) - getPlayerRating(a.name, ratingMode);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.soldFor || b.base || 0) - (a.soldFor || a.base || 0);
    });
  }, [getRoleCategory, ratingMode, selected]);

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'#050608', padding:'20px 14px 28px' }}>
      <style>{`
        .xi-submitted-shell { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr); gap: 18px; align-items: start; }
        @media (max-width: 900px) {
          .xi-submitted-shell { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="xi-submitted-shell">
        <div style={{ background:'#0b0d12', border:`1px solid ${BORDER}`, borderRadius:22, padding:'28px 22px', textAlign:'center' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(36px, 8vw, 56px)', color:GOLD, letterSpacing:4 }}>XI SUBMITTED!</div>
          <div style={{ color:'#CBD5E1', fontSize:14, marginTop:12, letterSpacing:1.4, lineHeight:1.7 }}>
            Your Playing XI is locked in. Stay here, chat with the room, and wait for the remaining teams to finish.
          </div>
          <div style={{ color:'#64748B', fontSize:12, marginTop:12, letterSpacing:1.5 }}>{submittedCount}/{totalTeams || 0} teams submitted</div>
          {isHost && (
            <button
              onClick={onFinalizeSelection}
              style={{ marginTop: 22, background:GOLD, border:`1px solid ${GOLD}`, borderRadius:10, padding:'14px 28px', color:'#000', fontWeight:900, fontSize:15, letterSpacing:3, cursor:'pointer', fontFamily:"'Barlow Condensed'" }}
            >
              FINALIZE RESULTS NOW
            </button>
          )}
        </div>
        <XIChatPanel
          chatLog={chatLog}
          emit={emit}
          currentRoom={roomCode}
          isSpectator={isSpectator}
          myName={myName}
          myTeamId={myTeamId}
          gs={gs}
          title="Room Chat"
          compact={false}
        />
      </div>
    </div>
  );
  return (
    <div className="xi-screen" style={{ minHeight:'100vh', background:'#050608', padding:'24px 16px 32px' }}>
      <style>{`
        .xi-screen { overflow-x: hidden; }
        .xi-shell { max-width: 1320px; margin: 0 auto; }
        .xi-hero { margin-bottom: 22px; background: #0b0d12; border: 1px solid ${BORDER}; border-radius: 24px; padding: 22px clamp(18px,3vw,30px); }
        .xi-hero-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; flex-wrap: wrap; }
        .xi-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; flex: 1 1 360px; width: 100%; }
        .xi-layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.95fr); gap: 20px; align-items: start; }
        .xi-squad-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
        .xi-side { min-width: 0; display: grid; gap: 16px; }
        .xi-role-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
        .xi-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .xi-player-card { min-width: 0; touch-action: manipulation; }
        .xi-action-panel { position: sticky; bottom: 10px; }
        .xi-card-shell { background: #0d1016; border: 1px solid ${BORDER}; border-radius: 20px; overflow: hidden; transition: border-color .18s ease, transform .18s ease, background .18s ease; }
        .xi-card-shell.selected { background: #101722; }
        .xi-card-media { position: relative; padding: 14px 14px 10px; min-height: 126px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .xi-card-content { padding: 12px 14px 14px; }
        @media (max-width: 900px) {
          .xi-screen { padding: 14px 10px calc(22px + env(safe-area-inset-bottom)) !important; }
          .xi-hero { border-radius: 18px !important; padding: 16px 14px !important; margin-bottom: 14px !important; }
          .xi-hero-row { gap: 14px !important; }
          .xi-hero-copy { flex-basis: 100% !important; }
          .xi-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; flex-basis: 100% !important; gap: 8px !important; }
          .xi-layout { grid-template-columns: 1fr !important; gap: 14px !important; }
          .xi-side { gap: 12px !important; }
          .xi-squad-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .xi-card-media { min-height: 104px !important; padding: 10px 10px 8px !important; }
          .xi-card-avatar { width: 58px !important; height: 58px !important; border-radius: 16px !important; }
          .xi-card-name { font-size: 14px !important; }
          .xi-chip { font-size: 9px !important; letter-spacing: 1px !important; padding: 3px 6px !important; }
          .xi-action-panel { position: sticky; bottom: calc(10px + env(safe-area-inset-bottom)); z-index: 5; }
        }
        @media (max-width: 560px) {
          .xi-title { font-size: 34px !important; letter-spacing: 2.5px !important; }
          .xi-copy { font-size: 12px !important; line-height: 1.55 !important; }
          .xi-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .xi-metric-card { border-radius: 13px !important; padding: 10px 8px !important; }
          .xi-metric-label { font-size: 8px !important; letter-spacing: 1.2px !important; }
          .xi-metric-value { font-size: 27px !important; }
          .xi-squad-grid { grid-template-columns: 1fr !important; }
          .xi-role-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; }
          .xi-panel { border-radius: 16px !important; padding: 14px !important; }
          .xi-selected-row { padding: 9px 10px !important; gap: 8px !important; }
          .xi-selected-price { display: none; }
          .xi-actions { display: grid !important; grid-template-columns: 1fr; }
          .xi-actions button { width: 100%; min-width: 0 !important; }
          .xi-player-card { text-align: left !important; }
          .xi-card-shell { border-radius: 16px !important; }
          .xi-card-media { min-height: unset !important; padding: 12px !important; border-bottom: none !important; }
          .xi-card-content { padding: 0 12px 12px !important; }
        }
      `}</style>
      <div className="xi-shell">
        <div className="xi-hero">
          <div className="xi-hero-row">
            <div className="xi-hero-copy" style={{ flex:'1 1 420px' }}>
              <div className="xi-title" style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(30px,6vw,56px)', color:GOLD, letterSpacing:4 }}>SELECT YOUR PLAYING XI</div>
              <div className="xi-copy" style={{ color:'#CBD5E1', fontSize:13, lineHeight:1.7, marginTop:8, maxWidth:760 }}>
                Auction is over. Build your strongest final XI with the best balance across roles.
                Once every active team submits, results will open automatically.
                {isHost ? ' If someone leaves, you can still finalize results and the game will auto-pick the best available XI for teams that did not submit.' : ''}
              </div>
            </div>
            <div className="xi-metrics">
              <div className="xi-metric-card" style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`, borderRadius:16, padding:'14px 16px' }}>
                <div className="xi-metric-label" style={{ color:'#64748B', fontSize:10, letterSpacing:2 }}>SELECTED</div>
                <div className="xi-metric-value" style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:34, letterSpacing:2, marginTop:4 }}>{selected.length}<span style={{ color:'#475569', fontSize:22 }}>/ {playersNeeded}</span></div>
              </div>
              <div className="xi-metric-card" style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`, borderRadius:16, padding:'14px 16px' }}>
                <div className="xi-metric-label" style={{ color:'#64748B', fontSize:10, letterSpacing:2 }}>TO PICK</div>
                <div className="xi-metric-value" style={{ color:playersLeft === 0 ? '#34D399' : CYAN, fontFamily:"'Bebas Neue'", fontSize:34, letterSpacing:2, marginTop:4 }}>{playersLeft}</div>
              </div>
              <div className="xi-metric-card" style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`, borderRadius:16, padding:'14px 16px' }}>
                <div className="xi-metric-label" style={{ color:'#64748B', fontSize:10, letterSpacing:2 }}>SQUAD SIZE</div>
                <div className="xi-metric-value" style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:34, letterSpacing:2, marginTop:4 }}>{mySquad.length}<span style={{ color:'#475569', fontSize:22 }}>/ {squadLimit}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="xi-layout">
          <div style={{ minWidth:0 }}>
            <div className="xi-squad-grid">
              {enrichedSquad.map((p, i) => {
                const sel = p.isSelected;
                const rc = ROLE_C[p.role] || CYAN;
                const rating = p.rating || getPlayerRating(p.name, ratingMode);
                return (
                  <button
                    className="xi-player-card"
                    key={`${p.name}-${i}`}
                    type="button"
                    onClick={() => toggle(p)}
                    style={{ background:'transparent', border:'none', padding:0, cursor:'pointer', transition:'transform .18s ease', transform:sel?'translateY(-2px)':'translateY(0)', overflow:'hidden', textAlign:'left' }}
                  >
                    <div className={`xi-card-shell${sel ? ' selected' : ''}`} style={{ borderColor: sel ? rc : BORDER }}>
                    <div className="xi-card-media">
                      <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                        <div className="xi-card-avatar" style={{ width:72, height:72, borderRadius:20, overflow:'hidden', border:`1px solid ${sel ? rc : `${rc}50`}`, background:`linear-gradient(180deg, ${rc}16, rgba(255,255,255,0.03))`, flexShrink:0 }}>
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
                          ) : (
                            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:1 }}>
                              {p.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                            </div>
                          )}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                          <span className="xi-chip" style={{ fontSize:10, letterSpacing:2, color:sel ? '#081018' : rc, background:sel ? rc : `${rc}16`, border:`1px solid ${sel ? rc : `${rc}22`}`, borderRadius:999, padding:'4px 8px', fontWeight:800 }}>
                            {sel ? 'SELECTED' : 'TAP TO PICK'}
                          </span>
                          <span style={{ fontSize:11, color:GOLD, fontWeight:700, letterSpacing:1.2 }}>{fmt(p.soldFor || p.base)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="xi-card-content">
                      <div className="xi-card-name" style={{ color:'#F8FAFC', fontWeight:800, fontSize:16, lineHeight:1.2 }}>{p.name}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:8 }}>
                        <span style={{ fontSize:11, color:rc, fontWeight:800, letterSpacing:1.4 }}>{ROLE_L[p.role]}</span>
                        {p.overseas && (
                          <span style={{ fontSize:10, background:'rgba(96,165,250,0.14)', border:'1px solid rgba(96,165,250,0.24)', color:'#93C5FD', padding:'2px 8px', borderRadius:999, fontWeight:800, letterSpacing:1.2 }}>
                            OVERSEAS
                          </span>
                        )}
                        {rating && (
                          <span style={{ fontSize:10, background:'rgba(232,184,75,0.12)', border:`1px solid ${GOLD}22`, color:GOLD, padding:'2px 8px', borderRadius:999, fontWeight:800, letterSpacing:1.2 }}>
                            RTG {rating}
                          </span>
                        )}
                      </div>
                    </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xi-side">
            <div className="xi-panel" style={{ background:'linear-gradient(180deg, rgba(13,15,20,0.98), rgba(8,10,14,0.98))', border:`1px solid ${BORDER}`, borderRadius:22, padding:18, boxShadow:'0 18px 50px rgba(0,0,0,0.26)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:28, letterSpacing:2 }}>Your Final XI</div>
                  <div style={{ color:'#64748B', fontSize:11, letterSpacing:1.4, marginTop:2 }}>{selected.length === playersNeeded ? 'Ready to submit' : `${playersLeft} more needed to lock the XI`}</div>
                </div>
                <div style={{ color:GOLD, fontFamily:"'Bebas Neue'", fontSize:34, letterSpacing:2 }}>{selected.length}/{playersNeeded}</div>
              </div>

              <div className="xi-role-grid">
                {roleTargets.map((item) => {
                  const met = item.count >= item.min;
                  return (
                    <div key={item.key} style={{ background:`${item.color}10`, border:`1px solid ${met ? `${item.color}55` : '#273142'}`, borderRadius:14, padding:'10px 12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:10, color:'#94A3B8', letterSpacing:1.2 }}>{item.label}</span>
                        <span style={{ color:met ? item.color : '#F87171', fontSize:10, fontWeight:800, letterSpacing:1.2 }}>{item.min > 0 ? `MIN ${item.min}` : 'OPTIONAL'}</span>
                      </div>
                      <div style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:1.5, marginTop:3 }}>{item.count}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display:'grid', gap:10 }}>
                {selectedOrdered.length === 0 ? (
                  <div style={{ border:`1px dashed ${BORDER}`, borderRadius:16, padding:'18px 14px', textAlign:'center', color:'#64748B', fontSize:13, lineHeight:1.6 }}>
                    Start tapping player cards to build your strongest Playing XI.
                  </div>
                ) : (
                  selectedOrdered.map((player, index) => {
                    const photoUrl = getPlayerPhoto(player.name);
                    const rc = ROLE_C[player.role] || CYAN;
                    return (
                      <div className="xi-selected-row" key={`${player.name}-${index}`} style={{ display:'flex', alignItems:'center', gap:10, border:`1px solid ${BORDER}`, background:'rgba(255,255,255,0.02)', borderRadius:16, padding:'10px 12px' }}>
                        <div style={{ width:34, color:'#475569', fontFamily:"'Bebas Neue'", fontSize:18, letterSpacing:1.5, textAlign:'center', flexShrink:0 }}>{String(index + 1).padStart(2, '0')}</div>
                        <div style={{ width:42, height:42, borderRadius:14, overflow:'hidden', background:`${rc}18`, border:`1px solid ${rc}55`, flexShrink:0 }}>
                          {photoUrl ? (
                            <img src={photoUrl} alt={player.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
                          ) : (
                            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800 }}>
                              {ROLE_EMOJI[player.role]}
                            </div>
                          )}
                        </div>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ color:'#E2E8F0', fontSize:14, fontWeight:800, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{player.name}</div>
                          <div style={{ color:rc, fontSize:10, fontWeight:800, letterSpacing:1.4, marginTop:4 }}>{ROLE_L[player.role]}</div>
                        </div>
                        <div className="xi-selected-price" style={{ color:GOLD, fontSize:11, fontWeight:800, letterSpacing:1.1, flexShrink:0 }}>{fmt(player.soldFor || player.base)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="xi-panel" style={{ background:'linear-gradient(180deg, rgba(10,13,18,0.98), rgba(8,10,14,0.98))', border:`1px solid ${BORDER}`, borderRadius:22, padding:18 }}>
              <div style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:2 }}>Selection Rules</div>
              <div style={{ display:'grid', gap:10, marginTop:14 }}>
                {selectionRules.map((rule, index) => (
                  <div key={rule} style={{ display:'flex', alignItems:'flex-start', gap:10, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 12px', background:'rgba(255,255,255,0.02)' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:`${GOLD}16`, color:GOLD, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:"'Bebas Neue'", fontSize:14 }}>
                      {index + 1}
                    </div>
                    <div style={{ color:'#CBD5E1', fontSize:13, lineHeight:1.55 }}>{rule}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="xi-panel xi-action-panel" style={{ textAlign:'center', background:'rgba(11,13,18,0.96)', border:`1px solid ${BORDER}`, borderRadius:22, padding:18, backdropFilter:'blur(12px)' }}>
              {validationError && (
                <div style={{ color:'#F87171', fontSize:13, marginBottom:14, letterSpacing:1.1, fontWeight:800 }}>
                  {(mySquad?.length || 0) < squadLimit
                    ? `BUY ${squadLimit - (mySquad?.length || 0)} MORE PLAYER${squadLimit - (mySquad?.length || 0) === 1 ? '' : 'S'} TO REACH THE ${squadLimit}-PLAYER SQUAD LIMIT`
                    : selected.length === playersNeeded ? validationError.toUpperCase() : `PICK ${playersLeft} MORE PLAYER${playersLeft === 1 ? '' : 'S'} TO CONTINUE`}
                </div>
              )}
              {!validationError && (
                <div style={{ color:'#34D399', fontSize:13, marginBottom:14, letterSpacing:1.1, fontWeight:800 }}>
                  XI BALANCE CHECK PASSED
                </div>
              )}
              <div className="xi-actions">
                <button onClick={() => canSubmit && onSubmit(selected)} disabled={!canSubmit}
                  style={{ background:canSubmit?`linear-gradient(135deg,${GOLD},#9a7610)`:'#111', border:`1px solid ${canSubmit?GOLD:'#333'}`, borderRadius:12, padding:'15px 30px', color:canSubmit?'#000':'#555', fontWeight:900, fontSize:16, letterSpacing:3, cursor:canSubmit?'pointer':'not-allowed', fontFamily:"'Barlow Condensed'", minWidth:220 }}>
                  SUBMIT PLAYING XI
                </button>
                {isHost && (
                  <button
                    onClick={onFinalizeSelection}
                    style={{ background:'transparent', border:`1px solid ${CYAN}66`, borderRadius:12, padding:'15px 24px', color:CYAN, fontWeight:900, fontSize:15, letterSpacing:2.5, cursor:'pointer', fontFamily:"'Barlow Condensed'" }}
                  >
                    HOST FINALIZE
                  </button>
                )}
              </div>
              {totalTeams > 0 && (
                <div style={{ color:'#64748B', fontSize:12, marginTop:14, letterSpacing:1.3 }}>
                  {submittedCount}/{totalTeams} active teams already submitted
                </div>
              )}
            </div>

            <XIChatPanel
              chatLog={chatLog}
              emit={emit}
              currentRoom={roomCode}
              isSpectator={isSpectator}
              myName={myName}
              myTeamId={myTeamId}
              gs={gs}
              title="Room Chat"
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const XIChatPanel = memo(function XIChatPanel({ chatLog, emit, currentRoom, isSpectator, myName, myTeamId, gs, title = 'Room Chat', compact = false }) {
  const [msg, setMsg] = useState('');
  const listRef = useRef(null);
  const shouldStickRef = useRef(true);
  const TEAM_CLR = {
    CSK:'#F9CA24', MI:'#4FC3F7', RCB:'#FF5252', KKR:'#CE93D8', SRH:'#FF8A65',
    DC:'#64B5F6', PBKS:'#EF9A9A', RR:'#F48FB1', GT:'#4DD0E1', LSG:'#81D4FA',
  };
  const myColor = TEAM_CLR[myTeamId] || '#22D3EE';

  const playerTeamMap = useMemo(() => {
    const map = {};
    Object.values(gs?.players || {}).forEach((player) => {
      if (player?.id && player?.teamId) map[player.id] = player.teamId;
    });
    return map;
  }, [gs?.players]);

  const visibleMessages = useMemo(
    () => (chatLog || []).filter((message) => message?.type === 'text' || message?.type === 'gif').slice(-80),
    [chatLog]
  );

  const handleScroll = useCallback(() => {
    const node = listRef.current;
    if (!node) return;
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldStickRef.current = remaining < 56;
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node || !shouldStickRef.current) return;
    node.scrollTop = node.scrollHeight;
  }, [visibleMessages.length]);

  const send = useCallback((e) => {
    e.preventDefault();
    if (!msg.trim() || !currentRoom || !emit) return;
    emit('send-chat', { text: msg.trim(), isGif: false });
    setMsg('');
  }, [msg, currentRoom, emit]);

  return (
    <div className="xi-panel" style={{ background:'rgba(10,13,18,0.98)', border:`1px solid ${BORDER}`, borderRadius:22, padding: compact ? 16 : 18, display:'flex', flexDirection:'column', minHeight: compact ? 300 : 420 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
        <div>
          <div style={{ color:'#fff', fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:2 }}>{title}</div>
          <div style={{ color:'#64748B', fontSize:11, letterSpacing:1.3, marginTop:3 }}>Keep talking while teams finish their XI.</div>
        </div>
        <div style={{ color:CYAN, fontSize:10, letterSpacing:2, fontWeight:800 }}>LIVE</div>
      </div>
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{ flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingRight:4, overscrollBehavior:'contain' }}
      >
        {visibleMessages.length === 0 ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#475569', gap:10, textAlign:'center', padding:'18px 12px' }}>
            <div style={{ fontSize:26 }}>💬</div>
            <div style={{ fontSize:12, letterSpacing:1 }}>No room chat yet</div>
          </div>
        ) : (
          visibleMessages.map((message) => {
            const isOwn = message.senderName === myName;
            const senderTeamId = message.senderTeamId || playerTeamMap[message.senderId];
            const senderColor = TEAM_CLR[senderTeamId] || CYAN;
            return (
              <div key={message.id} style={{ display:'flex', flexDirection:'column', alignItems:isOwn ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize:10, color:senderColor, fontWeight:700, letterSpacing:0.5, marginBottom:3 }}>
                  {message.senderName}
                </div>
                {message.type === 'gif' ? (
                  <img src={message.text} alt="GIF" style={{ maxWidth:'78%', borderRadius:10, border:'1px solid #1f2937' }} />
                ) : (
                  <div style={{
                    maxWidth:'86%',
                    padding:'8px 10px',
                    borderRadius:isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background:isOwn ? `${myColor}1a` : '#141922',
                    border:`1px solid ${isOwn ? `${myColor}44` : '#232b39'}`,
                    color:'#e5e7eb',
                    fontSize:13,
                    lineHeight:1.45,
                    wordBreak:'break-word',
                  }}>
                    {message.text}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {!isSpectator ? (
        <form onSubmit={send} style={{ display:'flex', gap:8, marginTop:12, borderTop:'1px solid #151b25', paddingTop:12 }}>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Message the room..."
            style={{ flex:1, background:'#0f141c', border:'1px solid #22283a', color:'#e5e7eb', padding:'10px 12px', borderRadius:10, fontSize:13, outline:'none', minWidth:0 }}
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            type="submit"
            disabled={!msg.trim()}
            style={{ background: msg.trim() ? myColor : '#111', color: msg.trim() ? '#000' : '#444', border:'none', minWidth:48, borderRadius:10, fontWeight:900, cursor:msg.trim() ? 'pointer' : 'not-allowed', fontSize:18, flexShrink:0 }}
          >
            ↑
          </button>
        </form>
      ) : (
        <div style={{ marginTop:12, borderTop:'1px solid #151b25', paddingTop:12, color:'#4b5563', fontSize:11, letterSpacing:1, textAlign:'center' }}>
          Spectator mode
        </div>
      )}
    </div>
  );
});

export default function AuctionPage() {
  return (
    <Suspense fallback={<div style={{ background: '#080808', height: '100vh' }} />}>
      <AuctionContent />
    </Suspense>
  );
}

// ── Mobile Chat Box ──────────────────────────────────────────────────────────
// Purpose-built for mobile tab panel: no outer scroll wrapper conflict,
// own-messages right-aligned with team color, lag-free scrolling.
const MobileChatBox = memo(function MobileChatBox({ chatLog, emit, currentRoom, isSpectator, myName, myTeamId, gs }) {
  const [msg, setMsg] = useState('');
  const endRef = useRef(null);
  const TEAM_CLR = {
    CSK:'#F9CA24', MI:'#4FC3F7', RCB:'#FF5252', KKR:'#CE93D8', SRH:'#FF8A65',
    DC:'#64B5F6', PBKS:'#EF9A9A', RR:'#F48FB1', GT:'#4DD0E1', LSG:'#81D4FA',
  };
  const myColor = TEAM_CLR[myTeamId] || '#22D3EE';

  // Build a fast id→teamId lookup from the game state
  const playerTeamMap = useMemo(() => {
    const m = {};
    Object.values(gs?.players || {}).forEach(p => { if (p.id && p.teamId) m[p.id] = p.teamId; });
    return m;
  }, [gs?.players]);

  const visibleMessages = useMemo(
    () => (chatLog || []).filter(m => m?.type === 'text' || m?.type === 'gif').slice(-60),
    [chatLog]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleMessages.length]);

  const send = useCallback((e) => {
    e.preventDefault();
    if (!msg.trim() || !currentRoom) return;
    emit('send-chat', { text: msg.trim(), isGif: false });
    setMsg('');
  }, [msg, currentRoom, emit]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>
      {/* Message list */}
      <div style={{ flex:1, overflowY:'auto', overscrollBehavior:'contain', padding:'6px 0 4px', display:'flex', flexDirection:'column', gap:5, WebkitOverflowScrolling:'touch' }}>
        {visibleMessages.length === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#374151', gap:8, padding:'24px 0' }}>
            <span style={{ fontSize:26 }}>💬</span>
            <span style={{ fontSize:11, letterSpacing:1 }}>No messages yet</span>
          </div>
        )}
        {visibleMessages.map(m => {
          const isOwn = m.senderName === myName;
          const senderTeamId = playerTeamMap[m.senderId];
          const nameColor = senderTeamId ? (TEAM_CLR[senderTeamId] || '#22D3EE') : '#22D3EE';
          return (
            <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: isOwn ? 'flex-end' : 'flex-start', padding:'0 2px' }}>
              <div style={{ fontSize:9, color: nameColor, fontWeight:700, letterSpacing:.3, marginBottom:2, paddingLeft: isOwn ? 0 : 2, paddingRight: isOwn ? 2 : 0 }}>
                {m.senderName}
              </div>
              {m.type === 'gif' ? (
                <img src={m.text} alt="GIF" style={{ maxWidth:'72%', borderRadius:8, border:'1px solid #1f2937' }} />
              ) : (
                <div style={{
                  maxWidth:'82%', padding:'7px 10px',
                  borderRadius: isOwn ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  background: isOwn ? `${myColor}1a` : '#181b24',
                  border: `1px solid ${isOwn ? myColor + '33' : '#242832'}`,
                  fontSize:13, color: isOwn ? '#e5e7eb' : '#c9cdd8', lineHeight:1.45, wordBreak:'break-word',
                }}>
                  {m.text}
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} style={{ height:1 }} />
      </div>

      {/* Input */}
      {!isSpectator ? (
        <form onSubmit={send} style={{ display:'flex', gap:6, padding:'6px 0 2px', borderTop:'1px solid #1a1a22', flexShrink:0 }}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Message the room…"
            style={{ flex:1, background:'#111318', border:'1px solid #22283a', color:'#e5e7eb', padding:'9px 11px', borderRadius:10, fontSize:13, outline:'none', minWidth:0 }}
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            type="submit"
            disabled={!msg.trim()}
            style={{ background: msg.trim() ? myColor : '#111', color: msg.trim() ? '#000' : '#333', border:'none', minWidth:44, borderRadius:10, fontWeight:900, cursor: msg.trim() ? 'pointer' : 'not-allowed', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .15s' }}
          >
            ↑
          </button>
        </form>
      ) : (
        <div style={{ padding:'8px 0 2px', borderTop:'1px solid #1a1a22', color:'#4b5563', fontSize:11, letterSpacing:1, textAlign:'center', flexShrink:0 }}>
          👁 Spectator — watching live
        </div>
      )}
    </div>
  );
});

// ── Chat Box Component (desktop sidebar) ─────────────────────────────────────
const ChatBox = memo(function ChatBox({ chatLog, emit, currentRoom, isSpectator }) {

  const [msg, setMsg] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifResults, setGifResults] = useState([]);
  const [gifLoading, setGifLoading] = useState(false);
  const endRef = useRef(null);
  const inputPlaceholder = isSpectator ? 'Watching live chat...' : 'Message...';
  const visibleMessages = useMemo(
    () => (chatLog || []).filter(message => message?.type === 'text' || message?.type === 'gif').slice(-80),
    [chatLog]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [visibleMessages.length]);

  useEffect(() => {
    if (!showGifPicker || isSpectator) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setGifLoading(true);
      try {
        const endpoint = gifQuery.trim()
          ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&limit=18&rating=pg-13&q=${encodeURIComponent(gifQuery.trim())}`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=18&rating=pg-13`;
        const res = await fetch(endpoint, { signal: controller.signal });
        const data = await res.json();
        setGifResults(Array.isArray(data?.data) ? data.data : []);
      } catch (_) {
        if (!controller.signal.aborted) setGifResults([]);
      } finally {
        if (!controller.signal.aborted) setGifLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [gifQuery, showGifPicker, isSpectator]);

  const send = (e) => {
    e.preventDefault();
    if (!msg.trim() || !currentRoom) return;
    const isGif = msg.trim().startsWith('http') && msg.trim().match(/\.(gif|jpg|jpeg|png)($|\?)/i);
    emit('send-chat', { text: msg.trim(), isGif: !!isGif });
    setMsg('');
  };

  const sendGif = (url) => {
    if (!url || !currentRoom) return;
    emit('send-chat', { text: url, isGif: true });
    setShowGifPicker(false);
    setGifQuery('');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(180deg, #0a0a0c 0%, #090b10 100%)', border:'1px solid #171a22', borderRadius:14, overflow:'hidden', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.02)', minHeight:0 }}>
      <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8, overscrollBehavior: 'contain' }}>
        {visibleMessages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', color: '#4b5563', gap: 10, textAlign:'center', padding:'24px 18px' }}>
            <div style={{ width: 52, height: 52, borderRadius:'50%', border:'1px solid #1f2430', background:'rgba(34,211,238,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color:'#22D3EE', fontSize:20 }}>
              💬
            </div>
            <div style={{ fontSize: 12, letterSpacing: 1 }}>No chat messages yet</div>
            <div style={{ fontSize: 10, color:'#394150', letterSpacing: 1.5, textTransform:'uppercase' }}>Start the conversation</div>
          </div>
        )}
        {visibleMessages.map(m => (
          <div key={m.id} style={{ fontSize:13, background:'#1a1a20', padding:'8px 12px', borderRadius:8, alignSelf:'flex-start', border:'1px solid #282830' }}>
            {m.type === 'gif' ? (
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
      {showGifPicker && !isSpectator && (
        <div style={{ borderTop:'1px solid #1a1a1a', background:'#090b10', padding:'10px 10px 8px', display:'flex', flexDirection:'column', gap:10, minHeight:180, maxHeight:'42%' }}>
          <div style={{ display:'flex', gap:8 }}>
            <input
              value={gifQuery}
              onChange={(e) => setGifQuery(e.target.value)}
              placeholder="Search GIFs"
              style={{ flex:1, background:'#111', border:'1px solid #222833', color:'#fff', padding:'9px 12px', borderRadius:10, fontSize:13, outline:'none', minWidth:0 }}
            />
            <button type="button" onClick={() => { setShowGifPicker(false); setGifQuery(''); }} style={{ background:'#151922', color:'#9ca3af', border:'1px solid #242a36', borderRadius:10, padding:'0 12px', fontWeight:700, cursor:'pointer' }}>
              CLOSE
            </button>
          </div>
          <div style={{ flex:1, minHeight:0, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:8, overscrollBehavior:'contain' }}>
            {gifLoading ? (
              <div style={{ gridColumn:'1 / -1', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:12, letterSpacing:1.2 }}>
                Loading GIFs...
              </div>
            ) : gifResults.length === 0 ? (
              <div style={{ gridColumn:'1 / -1', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:12, letterSpacing:1.2, textAlign:'center', padding:'12px 0' }}>
                No GIFs found right now.
              </div>
            ) : (
              gifResults.map((gif) => {
                const preview = gif?.images?.fixed_height_small?.url || gif?.images?.downsized?.url || gif?.images?.original?.url;
                const sendUrl = gif?.images?.downsized?.url || gif?.images?.original?.url || preview;
                if (!preview || !sendUrl) return null;
                return (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => sendGif(sendUrl)}
                    style={{ background:'#111318', border:'1px solid #1f2430', borderRadius:10, overflow:'hidden', padding:0, cursor:'pointer', minHeight:74 }}
                  >
                    <img src={preview} alt={gif.title || 'GIF'} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      <form onSubmit={send} style={{ display:'flex', borderTop:'1px solid #1a1a1a', padding:10, gap:8, background:'#080808' }}>
        {!isSpectator && (
          <button
            type="button"
            onClick={() => setShowGifPicker((prev) => !prev)}
            style={{ background:showGifPicker ? '#22D3EE' : '#111', color:showGifPicker ? '#000' : '#22D3EE', border:'1px solid rgba(34,211,238,0.25)', minWidth:52, padding:'0 12px', borderRadius:10, fontWeight:800, cursor:'pointer', flexShrink:0 }}
          >
            GIF
          </button>
        )}
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder={inputPlaceholder}
          style={{ flex:1, background:'#111', border:'1px solid #222833', color:'#fff', padding:'10px 12px', borderRadius:10, fontSize:13, outline:'none', minWidth:0, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.02)' }} />
        <button type="submit" disabled={!msg.trim()} style={{ background:'#22D3EE', color:'#000', border:'none', minWidth:58, padding:'0 14px', borderRadius:10, fontWeight:800, cursor:msg.trim()?'pointer':'not-allowed', opacity:msg.trim()?1:0.5, boxShadow:'0 8px 22px rgba(34,211,238,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4Z" />
          </svg>
        </button>
      </form>
    </div>
  );
});
