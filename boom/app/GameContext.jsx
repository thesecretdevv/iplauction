'use client';

import { createContext, useContext, useState, useEffect, useRef, useReducer, useCallback, useMemo, startTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { MEGA_SETS } from '../src/megaPlayers';
import { MEGA_AUCTION_SET_ORDER } from './data/playerRatings';
import { useSocket, playPulse, playSaleSound } from '../src/useSocket';
import { TEAMS } from '../src/MultiScreens';
import confetti from 'canvas-confetti';

const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const getIncrement = p => p < 2 ? 0.10 : p < 5 ? 0.20 : p < 10 ? 0.25 : 0.50;
export const fmt = c => c >= 1 ? `₹${c.toFixed(2)} Cr` : `₹${Math.round(c * 100)} L`;
export const nextBid = c => +(c + getIncrement(c)).toFixed(2);
const normalizePlayerName = (name) => String(name || '').replace(/\s*\(WK\)/gi, '').replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const MEGA_PLAYER_LOOKUP = new Map(
  MEGA_SETS.flatMap((set) => set.players).map((player) => [normalizePlayerName(player.name), player])
);

function buildMiniPlayers() {
  const byRole = { BAT: [], BOWL: [], AR: [], WK: [] };
  for (const set of getMegaSetsForAuction()) {
    for (const player of set.players) {
      if (byRole[player.role]) byRole[player.role].push({ ...player, setName: "Mini Auction" });
    }
  }
  for (const role in byRole) byRole[role].sort((a, b) => b.base - a.base);
  const targets = { BAT: 52, BOWL: 68, AR: 55, WK: 25 };
  const pool = [];
  for (const role in targets) {
    const available = byRole[role];
    const count = Math.min(targets[role], available.length);
    pool.push(...available.slice(0, count));
  }
  return pool;
}

export function buildQueue(mode) {
  if (mode === "mini") {
    const miniPool = buildMiniPlayers();
    return shuffle(miniPool).map((p, i) => ({ ...p, id: i, setName: p.setName || "Mini Auction" }));
  }
  const queue = [];
  for (const set of getMegaSetsForAuction()) {
    const s = shuffle(set.players);
    s.forEach((p, i) => queue.push({ ...p, id: queue.length + i, setName: set.name }));
  }
  return queue;
}

function getMegaSetsForAuction() {
  return MEGA_AUCTION_SET_ORDER.map(({ setName, playerNames }, index) => ({
    id: MEGA_SETS.find((set) => set.name === setName)?.id || `SET-${index + 1}`,
    name: setName,
    players: playerNames
      .map((playerName) => MEGA_PLAYER_LOOKUP.get(normalizePlayerName(playerName)))
      .filter(Boolean),
  })).filter((set) => set.players.length > 0);
}

function createGameState(queue) {
  return {
    playerQueue: queue, currentIdx: 0,
    currentBid: queue[0].base, currentBidder: null,
    timer: 10, phase: "bidding", currentSetName: queue[0].setName,
    timerDuration: 10, squadLimit: 15,
    purses: Object.fromEntries(TEAMS.map(t => [t.id, 120])),
    squads: Object.fromEntries(TEAMS.map(t => [t.id, []])),
    playingXI: Object.fromEntries(TEAMS.map(t => [t.id, []])),
    selections: Object.fromEntries(TEAMS.map(t => [t.id, false])),
    bidLog: [], auctionLog: [],
  };
}

function mergeGameState(prev, next) {
  if (!next) return prev;
  if (!prev) return next;

  return {
    ...prev,
    ...next,
    playerQueue: next.playerQueue ?? prev.playerQueue,
    purses: next.purses ?? prev.purses,
    squads: next.squads ?? prev.squads,
    playingXI: next.playingXI ?? prev.playingXI,
    selections: next.selections ?? prev.selections,
    bidLog: next.bidLog ?? prev.bidLog,
    auctionLog: next.auctionLog ?? prev.auctionLog,
    activeTeamIds: next.activeTeamIds ?? prev.activeTeamIds,
    rivalsMatch: next.rivalsMatch ?? prev.rivalsMatch,
    roomName: next.roomName ?? prev.roomName,
    roomType: next.roomType ?? prev.roomType,
    auctionMode: next.auctionMode ?? prev.auctionMode,
    totalPlayers: next.totalPlayers ?? prev.totalPlayers,
    timerDuration: next.timerDuration ?? prev.timerDuration,
    squadLimit: next.squadLimit ?? prev.squadLimit,
  };
}

// ── IPL Audio ──────────────────────────────────────────────────────────────────
let _iplAudio = null;
export function playIplTheme() {
  if (typeof window === 'undefined') return;
  if (_iplAudio) { _iplAudio.pause(); _iplAudio.currentTime = 0; }
  _iplAudio = new Audio('/assets/Ipl.mp3');
  _iplAudio.volume = 0.7;
  _iplAudio.play().catch(() => { });
}
export function stopIplTheme(fadeDuration = 2000) {
  if (!_iplAudio) return;
  const a = _iplAudio;
  const step = a.volume / (fadeDuration / 50);
  const fade = setInterval(() => {
    if (a.volume > step) { a.volume = Math.max(0, a.volume - step); }
    else { a.pause(); a.currentTime = 0; clearInterval(fade); }
  }, 50);
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  function clearSavedMultiplayerSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem("ipl_room_code");
    localStorage.removeItem("ipl_play_mode");
  }

  // Helper to build URLs with query params
  function buildUrl(path, params = {}) {
    const filtered = Object.entries(params).filter(([, v]) => v != null && v !== '');
    if (filtered.length === 0) return path;
    return `${path}?${filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`;
  }

  const [auctionMode, setAuctionMode] = useState(null);
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [playMode, setPlayMode] = useState(null);
  const g = useRef(null);
  const intervalRef = useRef(null);
  const tickRef = useRef(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const prevTimerRef = useRef(10);
  const lastMultiBidAtRef = useRef(0);

  // Multiplayer state
  const { emit, on } = useSocket();
  const [roomCode, setRoomCode] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [myName, setMyName] = useState("");
  const [lobbyMode, setLobbyMode] = useState(null);
  const [myTeamId, setMyTeamId] = useState(null);
  const [showSquad, setShowSquad] = useState(false);
  const [viewingTeam, setViewingTeam] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [multiGS, setMultiGS] = useState(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [roomMeta, setRoomMeta] = useState(null);

  const [playerId] = useState(() => {
    if (typeof window === 'undefined') return uuidv4();
    const saved = localStorage.getItem("ipl_player_id");
    if (saved) return saved;
    const n = uuidv4();
    localStorage.setItem("ipl_player_id", n);
    return n;
  });

  // Auto-Rejoin (runs once on mount)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // ── Rejoin logic ──
    const search = new URLSearchParams(window.location.search);
    const roomParam = search.get('room');
    const savedRoom = roomParam || localStorage.getItem("ipl_room_code");
    const savedName = localStorage.getItem("ipl_player_name");
    const savedPlayMode = localStorage.getItem("ipl_play_mode");

    if (savedRoom && savedName) {
      // Auto-join if we have all data
      setRoomCode(savedRoom);
      setMyName(savedName);
      setPlayMode("multi");
      
        emit("join-room", { code: savedRoom, playerName: savedName, playerId }, (res) => {
        if (res.ok) {
          setLobbyPlayers(res.players);
          setIsHost(res.hostId === playerId);
          setIsSpectator(!!res.isSpectator);
          if (res.auctionMode) setLobbyMode(res.auctionMode);
          setRoomMeta({
            roomType: res.roomType || 'standard',
            activeTeamIds: res.activeTeamIds || null,
            rivalsMatch: res.rivalsMatch || null,
            roomName: res.roomName || null,
          });
          if (res.roomStatus === "active") {
            setMultiGS(res.gameState);
            const me = (res.players || []).find((player) => player.id === playerId);
            const shouldEnterAuction = res.isSpectator || !!me?.teamId;
            if (shouldEnterAuction) {
              if (pathname !== '/auction') {
                router.push(buildUrl('/auction', { room: res.gameState?.roomCode || savedRoom, mode: (res.auctionMode || 'MEGA').toUpperCase(), spectator: res.isSpectator ? 1 : undefined }));
              }
            } else if (pathname !== '/room') {
              router.push(buildUrl('/room', { action: 'lobby', room: res.code || savedRoom, mode: res.auctionMode || undefined }));
            }
          } else if (res.roomStatus === "finished") {
            clearSavedMultiplayerSession();
            setMultiGS(res.gameState);
            if (roomParam) {
              router.push(buildUrl('/results', { room: savedRoom, mode: res.auctionMode }));
            }
          } else if (pathname === '/room') {
             // If they were at home and chose a public room, stay on appropriate phase
             setAuctionMode(res.auctionMode || 'mega');
          }
        } else {
          clearSavedMultiplayerSession();
        }
      });
    } else if (savedPlayMode === "single") {
      const savedGS = localStorage.getItem("ipl_single_gs");
      const savedScreen = localStorage.getItem("ipl_single_screen");
      const savedMode = localStorage.getItem("ipl_auction_mode");
      const savedTeamId = localStorage.getItem("ipl_my_team_id");
      if (savedGS && savedScreen) {
        try {
          const parsedGS = JSON.parse(savedGS);
          g.current = parsedGS;
          setPlayMode("single");
          setAuctionMode(savedMode);
          setMyTeamId(savedTeamId);
          // Map old screen names to routes with query params
          const modeParam = savedMode ? savedMode.toUpperCase() : '';
          const teamParam = savedTeamId || '';
          const routeMap = {
            home: '/',
            modeSelect: '/mode',
            playMode: buildUrl('/play-mode', { mode: modeParam }),
            teamSelect: buildUrl('/team-select', { mode: modeParam }),
            auction: buildUrl('/auction', { mode: modeParam, team: teamParam }),
            results: buildUrl('/results', { mode: modeParam, team: teamParam }),
            lobby: '/lobby',
            roomScreen: '/room'
          };
          router.push(routeMap[savedScreen] || '/');
          if (savedScreen === "auction") {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => tickRef.current?.(), 1000);
          }
        } catch (e) {
          console.error("Failed to restore single player session", e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist Single Player State
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (playMode === "single" && g.current) {
      syncSingleGS();
    }
  }, [playMode, pathname, auctionMode, myTeamId, multiGS]);

  // Socket listeners for multiplayer
  useEffect(() => {
    if (playMode !== "multi") return;
    const off1 = on("lobby-update", ({ players, auctionMode: m, hostId, roomType, activeTeamIds, rivalsMatch, roomName, squadLimit }) => {
      setLobbyPlayers(players);
      if (m) setLobbyMode(m);
      if (hostId) setIsHost(hostId === playerId);
      setRoomMeta(prev => ({
        roomType: roomType || prev?.roomType || 'standard',
        activeTeamIds: activeTeamIds || prev?.activeTeamIds || null,
        rivalsMatch: rivalsMatch || prev?.rivalsMatch || null,
        roomName: roomName || prev?.roomName || null,
        squadLimit: squadLimit || prev?.squadLimit || null,
      }));
    });
    const off2 = on("game-started", (gs) => {
      startTransition(() => {
        setMultiGS(gs);
        setRoomMeta(prev => ({
          roomType: gs?.roomType || prev?.roomType || 'standard',
          activeTeamIds: gs?.activeTeamIds || prev?.activeTeamIds || null,
          rivalsMatch: gs?.rivalsMatch || prev?.rivalsMatch || null,
          roomName: gs?.roomName || prev?.roomName || null,
          squadLimit: gs?.squadLimit || prev?.squadLimit || null,
        }));
      });
      if (gs?.roomType === 'rivals' && pathname === '/room') {
        router.push(buildUrl('/room', { action: 'rivals-found', room: roomCode || gs?.roomCode }));
        return;
      }
      router.push(buildUrl('/auction', { room: roomCode || gs?.roomCode, mode: (lobbyMode || gs?.auctionMode || 'MEGA').toUpperCase() }));
    });
    const off3 = on("game-state", (gs) => {
      startTransition(() => {
        setMultiGS(prev => mergeGameState(prev, gs));
        setRoomMeta(prev => ({
          roomType: gs?.roomType || prev?.roomType || 'standard',
          activeTeamIds: gs?.activeTeamIds || prev?.activeTeamIds || null,
          rivalsMatch: gs?.rivalsMatch || prev?.rivalsMatch || null,
          roomName: gs?.roomName || prev?.roomName || null,
          squadLimit: gs?.squadLimit || prev?.squadLimit || null,
        }));
      });
    });
    const off4 = on("game-over", (gs) => {
      clearSavedMultiplayerSession();
      startTransition(() => {
        setMultiGS(prev => mergeGameState(prev, gs));
        setRoomMeta(prev => ({
          roomType: gs?.roomType || prev?.roomType || 'standard',
          activeTeamIds: gs?.activeTeamIds || prev?.activeTeamIds || null,
          rivalsMatch: gs?.rivalsMatch || prev?.rivalsMatch || null,
          roomName: gs?.roomName || prev?.roomName || null,
          squadLimit: gs?.squadLimit || prev?.squadLimit || null,
        }));
      });
      router.push(buildUrl('/results', { room: roomCode || gs?.roomCode, mode: (lobbyMode || gs?.auctionMode || 'MEGA').toUpperCase() }));
    });
    // Lightweight timer tick — only updates the timer field to avoid full re-render
    const off5 = on("timer-tick", ({ timer }) => {
      startTransition(() => {
        setMultiGS(prev => prev ? { ...prev, timer } : prev);
      });
    });
    const off6 = on("chat-update", (logs) => {
      startTransition(() => {
        setChatLog(prev => {
          const nextLogs = Array.isArray(logs) ? logs : [];
          if (prev.length === nextLogs.length && prev[prev.length - 1]?.id === nextLogs[nextLogs.length - 1]?.id) {
            return prev;
          }
          return nextLogs;
        });
      });
    });
    const off7 = on("room-kicked", (payload) => {
      clearSavedMultiplayerSession();
      startTransition(() => {
        setLobbyPlayers([]);
        setMultiGS(null);
        setRoomMeta(null);
        setRoomCode(null);
        setIsHost(false);
        setIsSpectator(false);
        setPlayMode(null);
      });
      if (typeof window !== 'undefined') {
        window.alert(payload?.message || 'You were removed from the room by the host.');
      }
      router.push('/room?action=browse');
    });
    return () => { off1(); off2(); off3(); off4(); off5(); off6(); off7(); };
  }, [playMode, on, router, pathname, roomCode, lobbyMode]);

  // Unified Audio & Animation side-effects
  const gs = playMode === "multi" ? multiGS : g.current;
  const isMulti = playMode === "multi";

  const effectiveMyTeamId = useMemo(() => {
    if (!isMulti) return g.current?.myTeamId || myTeamId;
    // 1. Try lobby players list (synced from server)
    const fromLobby = lobbyPlayers.find(p => p.id === playerId)?.teamId;
    if (fromLobby) return fromLobby;
    // 2. Fallback to manually selected myTeamId
    if (myTeamId) return myTeamId;
    // 3. Late joiner: find first team not already taken by active players in lobby
    const taken = new Set(lobbyPlayers.map(p => p.teamId).filter(Boolean));
    const available = (TEAMS || []).find(t => !taken.has(t.id));
    return available?.id || (TEAMS && TEAMS[0]?.id) || null;
  }, [isMulti, lobbyPlayers, multiGS, playerId, myTeamId, g.current?.myTeamId]);

  useEffect(() => {
    const currentGS = isMulti ? multiGS : g.current;
    if (!currentGS) return;
    if (currentGS.timer <= 5 && currentGS.timer > 0 && currentGS.phase === "bidding") {
      playPulse();
    }
    if (currentGS.phase === "sold" || currentGS.phase === "unsold") {
      if (prevTimerRef.current !== currentGS.phase) {
        playSaleSound(currentGS.phase === "sold");
      }
    }
    prevTimerRef.current = currentGS.phase;
  }, [multiGS?.timer, multiGS?.phase, g.current?.timer, g.current?.phase, isMulti]);

  // Confetti for sold
  useEffect(() => {
    if (pathname !== '/auction' || gs?.phase !== "sold") return;

    const duration = 2000;
    const end = Date.now() + duration;
    let frameId = null;
    let active = true;

    const frame = () => {
      if (!active) return;
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.9 }, colors: ['#D4AF37', '#ffffff', '#22D3EE'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.9 }, colors: ['#D4AF37', '#ffffff', '#22D3EE'] });
      if (Date.now() < end) frameId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      active = false;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [gs?.phase, gs?.currentIdx, pathname]);

  function syncSingleGS() {
    if (typeof window === 'undefined') return;
    if (playMode === "single" && g.current) {
      const screenMap = { "/": "home", "/mode": "modeSelect", "/play-mode": "playMode", "/team-select": "teamSelect", "/auction": "auction", "/results": "results" };
      localStorage.setItem("ipl_single_gs", JSON.stringify(g.current));
      localStorage.setItem("ipl_single_screen", screenMap[pathname] || "auction");
      localStorage.setItem("ipl_auction_mode", auctionMode);
      localStorage.setItem("ipl_my_team_id", myTeamId);
      localStorage.setItem("ipl_play_mode", "single");
    }
  }

  // ─── Single Player Logic ───
  function advanceToNext() {
    const gs = g.current; if (!gs) return;
    const next = gs.currentIdx + 1;
    if (next >= gs.playerQueue.length) {
      router.push(buildUrl('/results', { mode: (auctionMode || 'MEGA').toUpperCase(), team: myTeamId }));
      return;
    }
    gs.currentIdx = next;
    const np = gs.playerQueue[next];
    gs.currentBid = np.base; gs.currentBidder = null;
    gs.timer = 10; gs.phase = "bidding"; gs.bidLog = [];
    gs.currentSetName = np.setName;
    syncSingleGS();
    forceUpdate();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tickRef.current?.(), 1000);
  }

  function finishCurrent() {
    const gs = g.current; if (!gs || gs.phase !== "bidding") return;
    clearInterval(intervalRef.current);
    gs.phase = gs.currentBidder ? "sold" : "unsold";
    const player = gs.playerQueue[gs.currentIdx];
    if (gs.currentBidder) {
      gs.purses[gs.currentBidder] = +(gs.purses[gs.currentBidder] - gs.currentBid).toFixed(2);
      gs.squads[gs.currentBidder] = [...gs.squads[gs.currentBidder], { ...player, soldFor: gs.currentBid }];
      gs.auctionLog = [{ player, bidder: gs.currentBidder, price: gs.currentBid, sold: true }, ...gs.auctionLog];
    } else {
      gs.auctionLog = [{ player, bidder: null, price: 0, sold: false }, ...gs.auctionLog];
    }
    syncSingleGS();
    forceUpdate();
    setTimeout(advanceToNext, 2800);
  }

  function tick() {
    const gs = g.current; if (!gs || gs.phase !== "bidding") return;
    gs.timer--;
    if (gs.timer <= 5 && gs.timer > 0) playPulse();
    if (gs.timer <= 0) finishCurrent(); else forceUpdate();
  }
  tickRef.current = tick;


  function humanBid() {
    if (playMode === "multi") {
      const now = Date.now();
      if (now - lastMultiBidAtRef.current < 120) return;
      lastMultiBidAtRef.current = now;
      emit("place-bid", {}, (res) => { });
      return;
    }
    const gs = g.current; if (!gs || gs.phase !== "bidding") return;
    if (gs.currentBidder === gs.myTeamId) return;
    const nb = gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid);
    const osCount = gs.squads[gs.myTeamId].filter(p => p.overseas).length;
    const playerOnAuction = gs.playerQueue[gs.currentIdx];
    const isMiniMode = (playMode === 'multi' ? lobbyMode === 'mini' : auctionMode === 'mini');
    const maxSquadSize = gs.squadLimit || 15;
    if (gs.purses[gs.myTeamId] < nb || gs.squads[gs.myTeamId].length >= maxSquadSize || (playerOnAuction.overseas && osCount >= 8)) return;
    gs.currentBid = nb; gs.currentBidder = gs.myTeamId; gs.timer = 10;
    gs.bidLog = [{ teamId: gs.myTeamId, bid: nb, isMe: true }, ...gs.bidLog].slice(0, 7);
    syncSingleGS();
    forceUpdate();
  }

  function startSingleAuction(tId) {
    const queue = buildQueue(auctionMode);
    setPlayMode("single");
    setMyTeamId(tId);
    g.current = {
      ...createGameState(queue),
      myTeamId: tId,
      playingXI: Object.fromEntries(TEAMS.map(t => [t.id, []])),
      selections: Object.fromEntries(TEAMS.map(t => [t.id, false]))
    };
    stopIplTheme(2000);
    setTimeout(() => {
      router.push(buildUrl('/auction', { mode: (auctionMode || 'MEGA').toUpperCase(), team: tId }));
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => tickRef.current?.(), 1000);
    }, 2000);
  }

  function submitXI(players) {
    if (playMode === "multi") {
      emit("submit-xi", { players }, (res) => {
        if (!res?.ok) alert(res?.error || "Submission failed");
      });
    } else {
      g.current.playingXI[effectiveMyTeamId] = players;
      g.current.selections[effectiveMyTeamId] = true;
      TEAMS.forEach(t => {
        if (t.id !== effectiveMyTeamId) {
          g.current.playingXI[t.id] = [...(g.current.squads[t.id] || [])]
            .sort((a, b) => b.soldFor - a.soldFor)
            .slice(0, 11);
          g.current.selections[t.id] = true;
        }
      });
      g.current.phase = "finished";
      syncSingleGS();
      forceUpdate();
    }
  }

  function handleCreateRoom(isPrivate, name) {
    emit("create-room", { playerName: name, isPrivate, playerId }, (res) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem("ipl_room_code", res.code);
        localStorage.setItem("ipl_player_name", name);
        localStorage.setItem("ipl_play_mode", "multi");
      }
      setRoomCode(res.code);
      setIsHost(true);
      setMyName(name);
      setLobbyPlayers(res.players);
      setPlayMode("multi");
      setIsSpectator(false);
      setIsPrivateRoom(isPrivate);
      setRoomMeta({
        roomType: res.roomType || 'standard',
        activeTeamIds: res.activeTeamIds || null,
        rivalsMatch: res.rivalsMatch || null,
        roomName: null,
        squadLimit: res.squadLimit || null,
      });
      router.push(buildUrl('/room', { action: 'lobby', room: res.code, public: !isPrivate }));
    });
  }

  function handleJoinRoom(code, name, preferredRole = 'player') {
    emit("join-room", { code, playerName: name, playerId, preferredRole }, (res) => {
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("ipl_room_code", code);
          localStorage.setItem("ipl_player_name", name);
          localStorage.setItem("ipl_play_mode", "multi");
        }
        setRoomCode(res.code || code);
        setMyName(name);
        setLobbyPlayers(res.players);
        setPlayMode("multi");
        if (res.auctionMode) setLobbyMode(res.auctionMode);
        setIsSpectator(!!res.isSpectator);
        setRoomMeta({
          roomType: res.roomType || 'standard',
          activeTeamIds: res.activeTeamIds || null,
          rivalsMatch: res.rivalsMatch || null,
          roomName: res.roomName || null,
          squadLimit: res.squadLimit || null,
        });

        if (res.roomStatus === "active") {
          setMultiGS(res.gameState);
          // If spectator, go to auction. If participant but has team, go to auction.
          // If participant NO team, let them pick team in lobby.
          const myP = (res.players || []).find(p => p.id === playerId);
          if (res.isSpectator || (myP && myP.teamId)) {
            router.push(buildUrl('/auction', { room: code, mode: res.auctionMode, spectator: res.isSpectator ? 1 : undefined }));
          } else {
             router.push(buildUrl('/room', { action: 'lobby', room: code, mode: res.auctionMode }));
          }
        } else if (res.roomStatus === "finished") {
          clearSavedMultiplayerSession();
          setMultiGS(res.gameState);
          router.push(buildUrl('/results', { room: code, mode: res.auctionMode }));
        } else {
          router.push(buildUrl('/room', { action: 'lobby', room: code, mode: res.auctionMode }));
        }
      } else {
        alert(res.error || "Failed to join room");
      }
    });
  }

  function startMultiAuction(options = {}) {
    const queue = buildQueue(lobbyMode || "mega");
    emit("start-game", { playerQueue: queue }, (res) => {
      if (!res?.ok) {
        const message = res?.error || "Cannot start";
        if (options.onError) options.onError(message);
        else alert(message);
        return;
      }
      if (res?.alreadyStarted && res?.gameState) {
        setMultiGS(res.gameState);
        router.push(buildUrl('/auction', { room: roomCode || res.gameState?.roomCode, mode: (lobbyMode || res.gameState?.auctionMode || 'MEGA').toUpperCase() }));
        return;
      }
      stopIplTheme(2000);
      if (options.onSuccess) options.onSuccess(res);
    });
  }

  function handleRestart(destination = "/") {
    if (typeof window !== 'undefined') {
      ["ipl_room_code", "ipl_play_mode", "ipl_single_gs", "ipl_single_screen", "ipl_auction_mode", "ipl_my_team_id"].forEach(k => localStorage.removeItem(k));
    }
    clearInterval(intervalRef.current);
    g.current = null;
    setMultiGS(null);
    setPlayMode(null);
    setAuctionMode(null);
    setLobbyMode(null);
    setRoomCode(null);
    setMyTeamId(null);
    setRoomMeta(null);
    router.push(destination);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const value = {
    // State
    gs, isMulti, playMode, setPlayMode, auctionMode, setAuctionMode,
    roomCode, setRoomCode, lobbyPlayers, setLobbyPlayers,
    isHost, setIsHost, myName, setMyName, lobbyMode, setLobbyMode,
    myTeamId, setMyTeamId, showSquad, setShowSquad,
    viewingTeam, setViewingTeam, showStats, setShowStats,
    multiGS, setMultiGS, playerId, g, effectiveMyTeamId,
    isSpectator, setIsSpectator, chatLog, setChatLog, roomMeta, setRoomMeta,
    // Socket
    emit, on,
    // Actions
    humanBid, startSingleAuction, submitXI,
    handleCreateRoom, handleJoinRoom, startMultiAuction, handleRestart,
    forceUpdate, syncSingleGS,
    // Helpers
    fmt, nextBid, buildQueue,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
