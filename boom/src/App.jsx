import { useState, useEffect, useRef, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
import { MEGA_SETS, PLAYER_IMAGES } from "./megaPlayers";
import { useSocket, playBeep } from "./useSocket";
import { PlayModeScreen, RoomScreen, LobbyScreen, TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI } from "./MultiScreens";
import { StatsModal } from "./StatsModal";
import { SquadModal } from "./SquadModal";
import confetti from "canvas-confetti";

if (typeof document !== "undefined" && !document.getElementById("ipl-gf")) {
  const l = document.createElement("link"); l.id = "ipl-gf"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap";
  document.head.appendChild(l);
}

const GOLD = "#D4AF37", BG = "#05070D", CARD = "#0C0F18", BORDER = "rgba(212,175,55,0.12)";


const MINI_PLAYERS = [
  { name: "Rishabh Pant", role: "WK", overseas: false, base: 2 }, { name: "Shreyas Iyer", role: "BAT", overseas: false, base: 2 },
  { name: "KL Rahul", role: "WK", overseas: false, base: 2 }, { name: "Venkatesh Iyer", role: "AR", overseas: false, base: 2 },
  { name: "Ishan Kishan", role: "WK", overseas: false, base: 2 }, { name: "Arshdeep Singh", role: "BOWL", overseas: false, base: 2 },
  { name: "Yuzvendra Chahal", role: "BOWL", overseas: false, base: 2 }, { name: "Mohammad Shami", role: "BOWL", overseas: false, base: 2 },
  { name: "Jos Buttler", role: "WK", overseas: true, base: 2 }, { name: "Mitchell Starc", role: "BOWL", overseas: true, base: 2 },
  { name: "Liam Livingstone", role: "AR", overseas: true, base: 2 }, { name: "Josh Hazlewood", role: "BOWL", overseas: true, base: 2 },
  { name: "Heinrich Klaasen", role: "WK", overseas: true, base: 2 }, { name: "Trent Boult", role: "BOWL", overseas: true, base: 2 },
  { name: "Phil Salt", role: "WK", overseas: true, base: 1.5 }, { name: "Tim David", role: "BAT", overseas: true, base: 1.5 },
  { name: "Washington Sundar", role: "AR", overseas: false, base: 1.5 }, { name: "Avesh Khan", role: "BOWL", overseas: false, base: 1.5 },
  { name: "Marcus Stoinis", role: "AR", overseas: true, base: 1.5 }, { name: "Lockie Ferguson", role: "BOWL", overseas: true, base: 1.5 },
  { name: "Rachin Ravindra", role: "AR", overseas: true, base: 1.5 }, { name: "Riyan Parag", role: "AR", overseas: false, base: 1.5 },
  { name: "Tilak Varma", role: "BAT", overseas: false, base: 1.5 }, { name: "Shivam Dube", role: "AR", overseas: false, base: 1.5 },
  { name: "Deepak Chahar", role: "BOWL", overseas: false, base: 1.5 }, { name: "Prasidh Krishna", role: "BOWL", overseas: false, base: 1.5 },
  { name: "Jake Fraser-McGurk", role: "BAT", overseas: true, base: 0.75 }, { name: "Shardul Thakur", role: "AR", overseas: false, base: 1 },
  { name: "Deepak Hooda", role: "AR", overseas: false, base: 0.75 }, { name: "T Natarajan", role: "BOWL", overseas: false, base: 0.75 },
  { name: "Khaleel Ahmed", role: "BOWL", overseas: false, base: 0.75 }, { name: "Akash Deep", role: "BOWL", overseas: false, base: 1 },
  { name: "Harshit Rana", role: "BOWL", overseas: false, base: 0.75 }, { name: "Mayank Yadav", role: "BOWL", overseas: false, base: 0.75 },
  { name: "Abhishek Sharma", role: "AR", overseas: false, base: 1 }, { name: "Nitish Kumar Reddy", role: "AR", overseas: false, base: 0.75 },
  { name: "Rahul Tewatia", role: "AR", overseas: false, base: 1 }, { name: "Nathan Ellis", role: "BOWL", overseas: true, base: 0.75 },
  { name: "Rovman Powell", role: "BAT", overseas: true, base: 1 }, { name: "Devdutt Padikkal", role: "BAT", overseas: false, base: 1.5 },
];

const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const getIncrement = p => p < 2 ? 0.10 : p < 5 ? 0.20 : p < 10 ? 0.25 : 0.50;
const fmt = c => c >= 1 ? `₹${c.toFixed(2)} Cr` : `₹${Math.round(c * 100)} L`;
const nextBid = c => +(c + getIncrement(c)).toFixed(2);

function buildQueue(mode) {
  if (mode === "mini") return shuffle(MINI_PLAYERS).map((p, i) => ({ ...p, id: i, setName: "Mini Auction", rating: 70 + Math.random() * 25 | 0 }));
  const queue = [];
  for (const set of MEGA_SETS) {
    const s = shuffle(set.players);
    s.forEach((p, i) => queue.push({ ...p, id: queue.length + i, setName: set.name, rating: 50 + Math.round(p.base * 18 + Math.random() * 12) }));
  }
  return queue;
}

function initGame(myTeamId, mode) {
  const queue = buildQueue(mode);
  return {
    myTeamId, mode, playerQueue: queue, currentIdx: 0,
    currentBid: queue[0].base, currentBidder: null,
    timer: 10, phase: "bidding", currentSetName: queue[0].setName,
    purses: Object.fromEntries(TEAMS.map(t => [t.id, 120])),
    squads: Object.fromEntries(TEAMS.map(t => [t.id, []])),
    bidLog: [], auctionLog: [],
  };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [auctionMode, setAuctionMode] = useState(null);
  const [playMode, setPlayMode] = useState(null); // "single" | "multi"
  const g = useRef(null);
  const intervalRef = useRef(null);
  const tickRef = useRef(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const prevTimerRef = useRef(10);

  // Multiplayer state
  const { emit, on } = useSocket();
  const [roomCode, setRoomCode] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [myName, setMyName] = useState("");
  const [lobbyMode, setLobbyMode] = useState(null);
  const [myTeamId, setMyTeamId] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showSquad, setShowSquad] = useState(false);
  const [multiGS, setMultiGS] = useState(null);

  const [playerId] = useState(() => {
    const saved = localStorage.getItem("ipl_player_id");
    if (saved) return saved;
    const n = uuidv4();
    localStorage.setItem("ipl_player_id", n);
    return n;
  });

  // Auto-Rejoin Logic (Multi & Single)
  useEffect(() => {
    const savedPlayMode = localStorage.getItem("ipl_play_mode");

    if (savedPlayMode === "multi") {
      const savedRoom = localStorage.getItem("ipl_room_code");
      const savedName = localStorage.getItem("ipl_player_name");

      if (savedRoom && savedName) {
        setRoomCode(savedRoom);
        setMyName(savedName);
        setPlayMode("multi");

        emit("join-room", { code: savedRoom, playerName: savedName, playerId }, (res) => {
          if (res.ok) {
            setLobbyPlayers(res.players);
            setIsHost(res.hostId === playerId);
            if (res.auctionMode) setLobbyMode(res.auctionMode);

            if (res.roomStatus === "active") {
              setMultiGS(res.gameState);
              setScreen("auction");
            } else if (res.roomStatus === "finished") {
              setMultiGS(res.gameState);
              setScreen("results");
            } else {
              setScreen("lobby");
            }
          } else {
            localStorage.removeItem("ipl_room_code");
            localStorage.removeItem("ipl_play_mode");
          }
        });
      }
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
          setScreen(savedScreen);

          if (savedScreen === "auction") {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => tickRef.current?.(), 1000);
          }
        } catch (e) {
          console.error("Failed to restore single player session", e);
        }
      }
    }
  }, [emit, playerId]);

  // Persist Single Player State
  useEffect(() => {
    if (playMode === "single" && g.current) {
      localStorage.setItem("ipl_play_mode", "single");
      localStorage.setItem("ipl_single_gs", JSON.stringify(g.current));
      localStorage.setItem("ipl_single_screen", screen);
      localStorage.setItem("ipl_auction_mode", auctionMode);
      localStorage.setItem("ipl_my_team_id", myTeamId);
    }
  }, [playMode, screen, auctionMode, myTeamId, multiGS]); // using multiGS as a proxy for 'tick' forceUpdates if needed, but actually g.current update is manual. 
  // Let's add a sync effect that runs on every forceUpdate for single player.
  useEffect(() => {
    if (playMode === "single" && g.current && screen !== "home") {
      localStorage.setItem("ipl_single_gs", JSON.stringify(g.current));
    }
  });


  // Socket listeners for multiplayer
  useEffect(() => {
    if (playMode !== "multi") return;
    const off1 = on("lobby-update", ({ players, auctionMode: m }) => {
      setLobbyPlayers(players);
      if (m) setLobbyMode(m);
    });
    const off2 = on("game-started", (gs) => {
      setMultiGS(gs);
      setScreen("auction");
    });
    const off3 = on("game-state", (gs) => {
      setMultiGS(gs);
    });
    const off4 = on("game-over", (gs) => {
      setMultiGS(gs);
      setScreen("results");
    });
    return () => { off1(); off2(); off3(); off4(); };
  }, [playMode, on]);

  // Timer sound for multiplayer
  useEffect(() => {
    if (!multiGS) return;
    if (multiGS.timer <= 5 && multiGS.timer > 0 && multiGS.phase === "bidding") playBeep();
  }, [multiGS?.timer]);

  // ─── Single Player Logic ───
  function advanceToNext() {
    const gs = g.current; if (!gs) return;
    const next = gs.currentIdx + 1;
    if (next >= gs.playerQueue.length) { setScreen("results"); return; }
    gs.currentIdx = next;
    const np = gs.playerQueue[next];
    gs.currentBid = np.base; gs.currentBidder = null;
    gs.timer = 10; gs.phase = "bidding"; gs.bidLog = [];
    gs.currentSetName = np.setName;
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
    forceUpdate();
    setTimeout(advanceToNext, 2800);
  }

  function tick() {
    const gs = g.current; if (!gs || gs.phase !== "bidding") return;
    gs.timer--;
    if (gs.timer <= 5 && gs.timer > 0) playBeep();
    if (gs.timer <= 0) finishCurrent(); else forceUpdate();
  }
  tickRef.current = tick;

  function humanBid() {
    if (playMode === "multi") {
      emit("place-bid", {}, (res) => { /* handled by game-state event */ });
      return;
    }
    const gs = g.current; if (!gs || gs.phase !== "bidding") return;
    if (gs.currentBidder === gs.myTeamId) return;
    const nb = nextBid(gs.currentBid);
    if (gs.purses[gs.myTeamId] < nb || gs.squads[gs.myTeamId].length >= 25) return;
    gs.currentBid = nb; gs.currentBidder = gs.myTeamId; gs.timer = 10;
    gs.bidLog = [{ teamId: gs.myTeamId, bid: nb, isMe: true }, ...gs.bidLog].slice(0, 7);
    forceUpdate();
  }

  function startSingleAuction(teamId) {
    g.current = initGame(teamId, auctionMode);
    setMyTeamId(teamId);
    setScreen("auction");
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tickRef.current?.(), 1000);
  }

  const handleCreateRoom = (isPrivate, name) => {
    emit("create-room", { playerName: name, isPrivate, playerId }, (res) => {
      localStorage.setItem("ipl_room_code", res.code);
      localStorage.setItem("ipl_player_name", name);
      localStorage.setItem("ipl_play_mode", "multi");

      setRoomCode(res.code);
      setIsHost(true);
      setMyName(name);
      setLobbyPlayers(res.players);
      setScreen("lobby");
    });
  };

  const handleJoinRoom = (code, name) => {
    emit("join-room", { code, playerName: name, playerId }, (res) => {
      if (res.ok) {
        localStorage.setItem("ipl_room_code", code);
        localStorage.setItem("ipl_player_name", name);
        localStorage.setItem("ipl_play_mode", "multi");

        setRoomCode(res.code || code);
        setMyName(name);
        setLobbyPlayers(res.players);
        setScreen("lobby");
      } else {
        alert(res.error || "Failed to join room");
      }
    });
  };

  function startMultiAuction() {
    const queue = buildQueue(lobbyMode || "mega");
    emit("start-game", { playerQueue: queue }, (res) => {
      if (!res?.ok) alert(res?.error || "Cannot start");
    });
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ─── Determine data source ───
  const gs = playMode === "multi" ? multiGS : g.current;
  const isMulti = playMode === "multi";

  // Audio and Confetti for sold
  useEffect(() => {
    if (gs && gs.phase === "sold") {
      const audio = new Audio('/src/assets/fahhh.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play failed:", e));

      // Fire confetti from bottom left and bottom right
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.9 },
          colors: ['#D4AF37', '#ffffff', '#22D3EE']
        });
        confetti({
          particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.9 },
          colors: ['#D4AF37', '#ffffff', '#22D3EE']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [gs?.phase, gs?.currentIdx]);

  // ─── Screen Routing ───
  if (screen === "home") return <Home onPlay={() => setScreen("modeSelect")} />;
  if (screen === "modeSelect") return <ModeSelect onSelect={m => { setAuctionMode(m); setScreen("playMode"); }} />;
  if (screen === "playMode") return <PlayModeScreen onSingle={() => { setPlayMode("single"); setScreen("teamSelect"); }} onMulti={() => { setPlayMode("multi"); setScreen("roomScreen"); }} />;
  if (screen === "roomScreen") return <RoomScreen emit={emit} playerId={playerId} onJoined={({ code, players, isHost: h, myName: n }) => { setRoomCode(code); setLobbyPlayers(players); setIsHost(h); setMyName(n); setScreen("lobby"); }} />;
  if (screen === "lobby") return <LobbyScreen roomCode={roomCode} players={lobbyPlayers} isHost={isHost} auctionMode={lobbyMode} emit={emit} onModeSelect={m => { setLobbyMode(m); emit("set-auction-mode", { mode: m }); }} onStart={startMultiAuction} />;
  if (screen === "teamSelect") return <TeamSelect onSelect={startSingleAuction} mode={auctionMode} />;
  if (screen === "results" && gs) return <Results gs={gs} myTeamId={isMulti ? myTeamId : gs.myTeamId} onRestart={() => {
    ["ipl_room_code", "ipl_play_mode", "ipl_single_gs", "ipl_single_screen", "ipl_auction_mode", "ipl_my_team_id"].forEach(k => localStorage.removeItem(k));
    clearInterval(intervalRef.current);
    g.current = null;
    setMultiGS(null);
    setPlayMode(null);
    setAuctionMode(null);
    setLobbyMode(null);
    setScreen("home");
  }} />;
  if (!gs) return null;

  const player = gs.playerQueue[gs.currentIdx];
  const effectiveMyTeamId = isMulti ? (lobbyPlayers.find(p => p.name === myName)?.teamId || myTeamId) : gs.myTeamId;
  const myTeam = TEAMS.find(t => t.id === effectiveMyTeamId);
  const bidderTeam = gs.currentBidder ? TEAMS.find(t => t.id === gs.currentBidder) : null;
  const canBid = gs.phase === "bidding" && gs.currentBidder !== effectiveMyTeamId
    && (gs.purses[effectiveMyTeamId] || 0) >= nextBid(gs.currentBid) && (gs.squads[effectiveMyTeamId]?.length || 0) < 25;
  const iLeading = gs.currentBidder === effectiveMyTeamId;
  const upcoming = gs.playerQueue.slice(gs.currentIdx + 1, gs.currentIdx + 9);

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

      {/* TOP BAR */}
      <div className="ipl-topbar" style={{ background: "linear-gradient(90deg,#0B0D16 0%,#141008 50%,#0B0D16 100%)", borderBottom: `1px solid ${BORDER}`, padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="ipl-topbar-title" style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: GOLD, letterSpacing: 3 }}>TATA IPL AUCTION</div>
          <div style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30`, borderRadius: 4, padding: "2px 10px", fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 1 }}>{player.setName}</div>
          {isMulti && <div style={{ background: "#22D3EE18", border: "1px solid #22D3EE30", borderRadius: 4, padding: "2px 8px", fontSize: 9, color: "#22D3EE", letterSpacing: 1 }}>LIVE</div>}
          <button onClick={() => setShowStats(true)} style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}40`, color: GOLD, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer", marginLeft: 8 }}>📊 STATS</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#444", fontSize: 11, letterSpacing: 3 }}>PLAYER</span>
          <span style={{ color: "#aaa", fontWeight: 700, fontSize: 14 }}>{gs.currentIdx + 1} / {gs.playerQueue.length}</span>

          {/* HOST CONTROLS */}
          {isMulti && isHost && (
            <div style={{ display: "flex", gap: 6, marginLeft: 16, borderLeft: `1px solid ${BORDER}`, paddingLeft: 16 }}>
              {isHost && (
                <>
                  <button onClick={() => gs.isPaused ? emit("resume-game") : emit("pause-game")} style={{ background: "transparent", border: "1px solid #FFCA28", borderRadius: 4, color: "#FFCA28", padding: "4px 12px", cursor: "pointer", fontWeight: "bold" }}>
                    {gs.isPaused ? "RESUME" : "PAUSE"}
                  </button>
                  <button onClick={() => {
                    if (window.confirm("Are you sure you want to end the auction early?")) {
                      emit("end-game");
                    }
                  }} style={{ background: "transparent", border: "1px solid #ef4444", borderRadius: 4, color: "#ef4444", padding: "4px 12px", cursor: "pointer", fontWeight: "bold" }}>
                    END
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowSquad(true)} style={{ background: "#22D3EE22", color: "#22D3EE", border: "1px solid #22D3EE55", borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontWeight: "bold", fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 1 }}>
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

          {/* Host Timer Editor */}
          {isHost && isMulti && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <button
                onClick={() => {
                  const curr = gs.timerDuration || 10;
                  const val = prompt("Set new bid timer duration (5 to 60 seconds):", curr);
                  if (val && !isNaN(val)) emit("set-timer-duration", { duration: parseInt(val) });
                }}
                style={{ background: "#111", border: `1px solid #333`, color: "#888", fontSize: 10, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}
                title="Edit Timer Length"
              >
                EDIT TIMER ⏱
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: myTeam?.color, boxShadow: `0 0 8px ${myTeam?.color}` }} />
          <span style={{ color: myTeam?.color, fontWeight: 700, letterSpacing: 1, fontSize: 14 }}>{myTeam?.short} ★</span>
          <span style={{ color: "#555", fontSize: 12 }}>₹{(gs.purses[effectiveMyTeamId] || 0).toFixed(1)} Cr · {gs.squads[effectiveMyTeamId]?.length || 0} pl</span>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="ipl-left" style={{ width: 264, padding: 14, borderRight: `1px solid ${BORDER}`, overflowY: "auto", flexShrink: 0 }}>
          <PlayerCard player={player} />
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
                <div style={{ background: `${myTeam?.color}20`, border: `2px solid ${myTeam?.color}80`, borderRadius: 8, padding: "14px 30px", color: myTeam?.color, fontWeight: 700, fontSize: 15, letterSpacing: 1, textAlign: "center" }}>✓ YOU'RE LEADING — {fmt(gs.currentBid)}</div>
              ) : (
                <button className="ipl-bid-btn" onClick={humanBid} disabled={!canBid}
                  style={{ background: canBid ? `linear-gradient(135deg,${myTeam?.color}40,${myTeam?.color}20)` : "#0e0e0e", border: `2px solid ${canBid ? myTeam?.color : "#2a2a2a"}`, borderRadius: 8, padding: "15px 44px", color: canBid ? myTeam?.color : "#3a3a3a", fontSize: 19, fontWeight: 900, cursor: canBid ? "pointer" : "not-allowed", letterSpacing: 2, fontFamily: "'Barlow Condensed'", boxShadow: canBid ? `0 0 28px ${myTeam?.color}44` : "none" }}>
                  {canBid ? `BID ${fmt(nextBid(gs.currentBid))}` : "INSUFFICIENT"}
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

        {/* RIGHT: Teams + Upcoming */}
        <div className="ipl-right" style={{ width: 240, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "8px 14px", fontSize: 10, letterSpacing: 3, color: "#444", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>FRANCHISES</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {[...TEAMS].sort((a, b) => (gs.purses[b.id] || 0) - (gs.purses[a.id] || 0)).map(team => {
              const isLead = team.id === gs.currentBidder, isMe = team.id === effectiveMyTeamId;
              return (
                <div key={team.id} style={{ padding: "6px 14px", borderLeft: `3px solid ${isLead ? team.color : "transparent"}`, background: isLead ? `${team.color}0d` : isMe ? `${team.color}06` : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: team.color, opacity: isLead || isMe ? 1 : 0.4 }} />
                      <span style={{ color: isMe || isLead ? team.color : "#999", fontWeight: isMe || isLead ? 700 : 500, fontSize: 12 }}>{team.short}{isMe && " ★"}</span>
                    </div>
                    {isLead && <span style={{ fontSize: 8, background: team.color, color: "#000", padding: "1px 5px", borderRadius: 3, fontWeight: 900 }}>LEAD</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: "#888" }}>₹{(gs.purses[team.id] || 0).toFixed(1)} Cr</span>
                    <span style={{ fontSize: 10, color: "#888" }}>{gs.squads[team.id]?.length || 0} pl</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* BOTTOM TICKER */}
      <div className="ipl-ticker" style={{ borderTop: `1px solid ${BORDER}`, padding: "7px 20px", display: "flex", gap: 22, overflowX: "auto", flexShrink: 0, background: "#07090E", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#666", letterSpacing: 3, flexShrink: 0 }}>RECENT</span>
        {(gs.auctionLog || []).slice(0, 10).map((item, i) => (
          <div key={i} style={{ flexShrink: 0, fontSize: 12, color: "#999", display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ color: "#bbb" }}>{item.player.name}</span>
            {item.sold ? (<><span style={{ color: "#666" }}>→</span><span style={{ color: TEAMS.find(t => t.id === item.bidder)?.color, fontWeight: 700 }}>{item.bidder}</span><span style={{ color: GOLD, fontSize: 11 }}>{fmt(item.price)}</span></>) : <span style={{ color: "#ef4444", fontSize: 11 }}>UNSOLD</span>}
          </div>
        ))}
        {(!gs.auctionLog || gs.auctionLog.length === 0) && <span style={{ color: "#555", fontSize: 12 }}>Auction in progress...</span>}
      </div>

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        gs={multiGS || g.current}
        TEAMS={TEAMS}
        myTeamId={myTeamId}
      />

      <SquadModal
        isOpen={showSquad}
        onClose={() => setShowSquad(false)}
        squads={(multiGS || g.current)?.squads || {}}
        myTeamId={effectiveMyTeamId}
        TEAMS={TEAMS}
      />

    </div>
  );
}

function PlayerCard({ player }) {
  const rc = ROLE_C[player.role];
  const photo = PLAYER_IMAGES?.[player.name];

  return (
    <div style={{ background: `linear-gradient(160deg, #0E1220, ${rc}08)`, border: `1px solid ${rc}20`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${rc}, transparent)` }} />
      <div style={{ height: 180, background: `linear-gradient(160deg, ${rc}18, #060810)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
        {photo ? (
          <div style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <img src={photo} alt={player.name} referrerPolicy="no-referrer" style={{ height: "100%", width: "100%", objectFit: "cover", objectPosition: "top center", filter: "drop-shadow(0 0 20px rgba(0,0,0,0.8))" }} />
          </div>
        ) : (
          <>{ROLE_EMOJI[player.role]}</>
        )}
        {player.overseas && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 9, background: "#C084FC22", color: "#C084FC", padding: "2px 7px", borderRadius: 4, fontWeight: 700, letterSpacing: 1, zIndex: 10 }}>OS</div>}
      </div>
      <div style={{ padding: "10px 14px" }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1, lineHeight: 1.1, color: "#f0f0f0" }}>{player.name}</div>
        <div style={{ display: "flex", gap: 7, marginTop: 6, alignItems: "center" }}>
          <span style={{ background: `${rc}1a`, color: rc, padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{ROLE_L[player.role]}</span>
        </div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          <div style={{ background: "#07090E", borderRadius: 7, padding: "6px 10px" }}>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>BASE</div>
            <div style={{ color: GOLD, fontWeight: 700, fontSize: 15, fontFamily: "'Bebas Neue'" }}>{fmt(player.base)}</div>
          </div>
          <div style={{ background: "#07090E", borderRadius: 7, padding: "6px 10px" }}>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>RATING</div>
            <div style={{ color: rc, fontWeight: 700, fontSize: 15, fontFamily: "'Bebas Neue'" }}>{player.rating || "—"}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home({ onPlay }) {
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% 90%, #1c150a 0%, ${BG} 62%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`.home-title{font-size:clamp(52px,9vw,110px)!important}.home-year{font-size:clamp(28px,4.5vw,58px)!important}.home-stats{gap:clamp(20px,4vw,54px)!important;flex-wrap:wrap!important}.home-btn{padding:14px clamp(28px,5vw,60px)!important;font-size:clamp(13px,1.4vw,17px)!important;margin-top:clamp(28px,4vh,52px)!important}.home-stat-val{font-size:clamp(18px,2.5vw,28px)!important}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      {[300, 500, 700, 900].map(s => <div key={s} style={{ position: "absolute", width: s, height: s, border: "1px solid rgba(212,175,55,0.035)", borderRadius: "50%", pointerEvents: "none" }} />)}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(212,175,55,0.015) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(212,175,55,0.015) 40px)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", zIndex: 1, animation: "fadeUp .6s ease-out" }}>
        <div style={{ color: `${GOLD}77`, fontSize: 11, letterSpacing: 8, marginBottom: 22, fontWeight: 600 }}>TATA INDIAN PREMIER LEAGUE</div>
        <div className="home-title" style={{ fontFamily: "'Bebas Neue'", fontSize: 110, lineHeight: 0.85, letterSpacing: 12, color: "#f0f0f0", textShadow: `0 0 100px ${GOLD}18` }}>TATA IPL<br /><span style={{ color: GOLD, textShadow: `0 0 80px ${GOLD}88, 0 0 160px ${GOLD}33` }}>AUCTION</span></div>
        <div className="home-year" style={{ fontFamily: "'Bebas Neue'", fontSize: 58, color: "#1e1e1e", letterSpacing: 22, marginTop: 6 }}>2025</div>
        <div style={{ color: "#444", fontSize: 12, marginTop: 22, letterSpacing: 5 }}>THE ULTIMATE BIDDING SIMULATION</div>
        <button className="home-btn" onClick={onPlay} style={{ marginTop: 52, background: `linear-gradient(135deg, ${GOLD}, #9a7610)`, border: "none", borderRadius: 3, padding: "17px 60px", color: "#000", fontSize: 17, fontWeight: 900, cursor: "pointer", letterSpacing: 5, fontFamily: "'Barlow Condensed'", boxShadow: `0 4px 60px ${GOLD}55, 0 0 0 1px ${GOLD}22` }}>START AUCTION</button>
        <div className="home-stats" style={{ marginTop: 54, display: "flex", gap: 54, justifyContent: "center" }}>
          {[["500+", "PLAYERS"], ["10", "TEAMS"], ["₹120Cr", "EACH PURSE"], ["LIVE", "MULTIPLAYER"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="home-stat-val" style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: GOLD, letterSpacing: 2 }}>{n}</div>
              <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeSelect({ onSelect }) {
  const [hov, setHov] = useState(null);
  const modes = [
    { id: "mega", title: "TATA IPL MEGA AUCTION", subtitle: "500+ Official Players · 40+ Sets", desc: "Full mega auction with all official sets.", icon: "🏟️", players: "500+", color: GOLD },
    { id: "mini", title: "TATA IPL MINI AUCTION", subtitle: "40 Players · Quick Mode", desc: "Quick game with top players shuffled randomly.", icon: "⚡", players: "40", color: "#22D3EE" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ textAlign: "center", marginBottom: 50, animation: "fadeUp .4s ease-out" }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,52px)", letterSpacing: 8, color: GOLD }}>SELECT TATA IPL AUCTION MODE</div>
      </div>
      <div style={{ display: "flex", gap: 24, animation: "fadeUp .5s ease-out", flexWrap: "wrap", justifyContent: "center", padding: "0 20px" }}>
        {modes.map(m => (
          <div key={m.id} onClick={() => onSelect(m.id)} onMouseEnter={() => setHov(m.id)} onMouseLeave={() => setHov(null)}
            style={{ width: 320, background: hov === m.id ? `${m.color}10` : CARD, border: `1px solid ${hov === m.id ? m.color : BORDER}`, borderRadius: 16, padding: "36px 28px", cursor: "pointer", transition: "all .25s", textAlign: "center", boxShadow: hov === m.id ? `0 0 50px ${m.color}22` : "none", transform: hov === m.id ? "translateY(-6px)" : "none" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{m.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, color: m.color, letterSpacing: 3 }}>{m.title}</div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 10 }}>{m.subtitle}</div>
            <div style={{ color: "#3a3a3a", fontSize: 11, marginTop: 8 }}>{m.desc}</div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 20 }}>
              <div><div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: m.color }}>{m.players}</div><div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>PLAYERS</div></div>
              <div><div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: m.color }}>10</div><div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>TEAMS</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSelect({ onSelect, mode }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", padding: "clamp(20px,4vh,38px) clamp(16px,3vw,32px)" }}>
      <style>{`.ts-title{font-size:clamp(26px,4vw,46px)!important}.ts-grid{grid-template-columns:repeat(5,1fr)!important}@media(max-width:1000px){.ts-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:600px){.ts-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      <div style={{ textAlign: "center", marginBottom: 38 }}>
        <div className="ts-title" style={{ fontFamily: "'Bebas Neue'", fontSize: 46, letterSpacing: 8, color: GOLD }}>CHOOSE YOUR FRANCHISE</div>
        <div style={{ color: "#444", fontSize: 13, letterSpacing: 3, marginTop: 6 }}>{mode === "mega" ? "MEGA AUCTION — 500+ PLAYERS" : "MINI AUCTION — 40 PLAYERS"}</div>
      </div>
      <div className="ts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, maxWidth: 880, margin: "0 auto" }}>
        {TEAMS.map(t => (
          <div key={t.id} onClick={() => onSelect(t.id)} onMouseEnter={() => setHov(t.id)} onMouseLeave={() => setHov(null)}
            style={{ background: hov === t.id ? `${t.color}14` : CARD, border: `1px solid ${hov === t.id ? t.color : BORDER}`, borderRadius: 12, padding: "22px 16px", cursor: "pointer", textAlign: "center", transition: "all .2s", boxShadow: hov === t.id ? `0 0 30px ${t.color}33` : "none", transform: hov === t.id ? "translateY(-4px)" : "none" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, color: t.color, letterSpacing: 2, lineHeight: 1 }}>{t.short}</div>
            <div style={{ fontSize: 11, color: hov === t.id ? "#aaa" : "#555", marginTop: 7, lineHeight: 1.4, fontWeight: 500 }}>{t.name}</div>
            <div style={{ marginTop: 14, fontSize: 12, color: `${t.color}88`, fontWeight: 600, letterSpacing: 1 }}>₹120 Cr purse</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Results({ gs, myTeamId: mti, onRestart }) {
  const [activeId, setActiveId] = useState(mti || TEAMS[0].id);
  const team = TEAMS.find(t => t.id === activeId);
  const squad = gs.squads[activeId] || [];
  const spent = +(120 - (gs.purses[activeId] || 0)).toFixed(2);
  const soldCount = (gs.auctionLog || []).filter(l => l.sold).length;
  const unsoldCount = (gs.auctionLog || []).filter(l => !l.sold).length;
  const mySquad = gs.squads[mti] || []; // Assuming mti is the current user's team ID
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", padding: "clamp(16px,3vh,28px)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.res-squad{grid-template-columns:repeat(2,1fr)!important}@media(max-width:700px){.res-squad{grid-template-columns:1fr!important}}`}</style>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(30px,5vw,54px)", color: GOLD, letterSpacing: 8 }}>TATA IPL AUCTION COMPLETE</div>
        <div style={{ color: "#555", fontSize: 12, letterSpacing: 3, marginTop: 4 }}>{soldCount} SOLD · {unsoldCount} UNSOLD</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {TEAMS.map(t => (
          <button key={t.id} onClick={() => setActiveId(t.id)} style={{ background: activeId === t.id ? t.color : "transparent", border: `1px solid ${t.color}`, borderRadius: 4, padding: "6px 14px", color: activeId === t.id ? "#000" : t.color, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Rajdhani'" }}>
            {t.short}{t.id === mti ? " ★" : ""}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", animation: "fadeUp .3s ease-out" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          {/* PURSE HIGHLIGHT */}
          <div style={{ background: `linear-gradient(135deg, ${CARD}, #0A0D15)`, border: `1px solid ${GOLD}40`, borderRadius: 12, padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 10, boxShadow: `0 8px 30px ${GOLD}15` }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 3, fontWeight: 700 }}>REMAINING PURSE</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, color: "#fff", letterSpacing: 2 }}>{fmt(gs.purses[activeId])}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px dashed ${BORDER}`, paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>SQUAD LIMIT</span>
              <strong style={{ color: (squad.length >= 25 ? "#ef4444" : "#22D3EE"), fontSize: 16 }}>{squad.length} <span style={{ color: "#555" }}>/</span> 25</strong>
            </div>
          </div>

          {[["PLAYERS BOUGHT", squad.length, team?.color], ["TOTAL SPENT", `₹${spent} Cr`, GOLD]].map(([l, v, c]) => (
            <div key={l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 22px", flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>{l}</div>
              <div style={{ fontSize: 28, color: c, fontFamily: "'Bebas Neue'" }}>{v}</div>
            </div>
          ))}
        </div>
        {squad.length === 0 ? <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px", flex: 1 }}>No players purchased by {team?.name}</div> : (
          <div className="res-squad" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {squad.map((p, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontWeight: 600, fontSize: 14, color: "#eee" }}>{p.name}</div><div style={{ fontSize: 12, color: ROLE_C[p.role], marginTop: 2 }}>{ROLE_L[p.role]}{p.overseas ? " · OS" : ""}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ color: GOLD, fontWeight: 700, fontSize: 16 }}>{fmt(p.soldFor)}</div><div style={{ fontSize: 11, color: "#3a3a3a" }}>Base {fmt(p.base)}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={onRestart} style={{ background: `linear-gradient(135deg, ${GOLD}, #9a7610)`, border: "none", borderRadius: 3, padding: "14px 46px", color: "#000", fontWeight: 900, cursor: "pointer", fontSize: 16, letterSpacing: 4, fontFamily: "'Barlow Condensed'" }}>PLAY AGAIN</button>
      </div>
    </div>
  );
}