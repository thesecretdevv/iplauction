'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../GameContext';

const GOLD = '#E8B84B';
const CYAN = '#22D3EE';
const BG   = '#080808';

const TEAMS = [
  { id:'CSK',  name:'Chennai Super Kings',        short:'CSK',  color:'#F9CA24' },
  { id:'MI',   name:'Mumbai Indians',              short:'MI',   color:'#4FC3F7' },
  { id:'RCB',  name:'Royal Challengers Bengaluru', short:'RCB',  color:'#FF5252' },
  { id:'KKR',  name:'Kolkata Knight Riders',       short:'KKR',  color:'#CE93D8' },
  { id:'SRH',  name:'Sunrisers Hyderabad',         short:'SRH',  color:'#FF8A65' },
  { id:'DC',   name:'Delhi Capitals',              short:'DC',   color:'#64B5F6' },
  { id:'PBKS', name:'Punjab Kings',                short:'PBKS', color:'#EF9A9A' },
  { id:'RR',   name:'Rajasthan Royals',            short:'RR',   color:'#F48FB1' },
  { id:'GT',   name:'Gujarat Titans',              short:'GT',   color:'#4DD0E1' },
  { id:'LSG',  name:'Lucknow Super Giants',        short:'LSG',  color:'#81D4FA' },
];

export default function RoomPage() {
  const router = useRouter();
  const {
    emit, playerId,
    roomCode, setRoomCode, lobbyPlayers, setLobbyPlayers,
    isHost, setIsHost, myName, setMyName, setPlayMode,
    lobbyMode, setLobbyMode, setMultiGS, startMultiAuction,
  } = useGame();

  const [phase,       setPhase]       = useState('home');
  const [name,        setName]        = useState('');
  const [isPrivate,   setIsPrivate]   = useState(false);
  const [joinCode,    setJoinCode]    = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [aMode,       setAMode]       = useState('mega');
  const [serverRooms, setServerRooms] = useState([]);
  const nameRef = useRef(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ipl_player_name') : '';
    if (saved) setName(saved);
  }, []);

  useEffect(() => {
    if (phase === 'join' || phase === 'create-form') nameRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'join') return;
    emit('get-rooms', (data) => { if (data?.active) setServerRooms(data.active); });
  }, [phase]);

  const handleCreate = () => {
    if (!name.trim()) { setError('Enter your name first'); return; }
    setLoading(true); setError('');
    emit('create-room', { playerName: name.trim(), isPrivate, roomName: `${name.trim()}'s Room`, playerId }, (res) => {
      setLoading(false);
      if (!res?.ok) { setError(res?.error || 'Failed to create room'); return; }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ipl_room_code',   res.code);
        localStorage.setItem('ipl_player_name', name.trim());
        localStorage.setItem('ipl_play_mode',   'multi');
      }
      setRoomCode(res.code);
      setIsHost(true);
      setMyName(name.trim());
      setLobbyPlayers(res.players || []);
      setPlayMode('multi');
      setLobbyMode(aMode);
      emit('set-auction-mode', { mode: aMode });
      setPhase('lobby');
    });
  };

  const doJoin = (targetCode) => {
    if (!name.trim()) { setError('Enter your name first'); return; }
    const code = (targetCode || '').trim().toUpperCase();
    if (!code) { setError('Enter a room code'); return; }
    setLoading(true); setError('');
    emit('join-room', { code, playerName: name.trim(), playerId }, (res) => {
      setLoading(false);
      if (!res?.ok) { setError(res?.error || 'Room not found'); return; }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ipl_room_code',   code);
        localStorage.setItem('ipl_player_name', name.trim());
        localStorage.setItem('ipl_play_mode',   'multi');
      }
      setRoomCode(res.code || code);
      setIsHost(res.hostId === playerId);
      setMyName(name.trim());
      setLobbyPlayers(res.players || []);
      setPlayMode('multi');
      if (res.auctionMode) { setLobbyMode(res.auctionMode); setAMode(res.auctionMode); }
      if (res.roomStatus === 'active') {
        setMultiGS(res.gameState); router.push(`/auction?room=${code}`);
      } else if (res.roomStatus === 'finished') {
        setMultiGS(res.gameState); router.push(`/results?room=${code}`);
      } else {
        setPhase('lobby');
      }
    });
  };

  const selectTeam = (teamId) => {
    emit('select-team', { teamId }, (res) => {
      if (!res?.ok) setError(res?.error || 'Cannot select that team');
    });
  };

  const changeMode = (m) => {
    setAMode(m); setLobbyMode(m);
    emit('set-auction-mode', { mode: m });
  };

  const handleStart = () => {
    if (!aMode) { setError('Select MEGA or MINI first'); return; }
    startMultiAuction();
  };

  const shareUrl  = typeof window !== 'undefined' ? `${window.location.origin}/join/${roomCode}` : '';
  const copyLink  = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  const myTeamId  = lobbyPlayers.find(p => p.name === myName)?.teamId;
  const takenTeams = new Set(lobbyPlayers.filter(p => p.teamId).map(p => p.teamId));
  const canStart  = isHost && lobbyPlayers.length >= 1 && !!aMode;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideL   { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:none} }
        @keyframes slideR   { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }

        html, body { height: 100%; background: ${BG}; }

        /* ── OUTER SHELL ── */
        .rp-shell {
          min-height: 100vh;
          background: ${BG};
          position: relative;
          overflow-x: hidden;
        }



        /* ── CENTER PANEL ── */
        .rp-center {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 72px 20px 40px;
          min-height: 100vh;
          overflow-y: auto;
          position: relative; z-index: 5;
        }
        @media (max-width: 520px) { .rp-center { padding: 64px 14px 28px; } }

        /* ── NAVBAR ── */
        .rp-nav {
          position: fixed; top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; z-index: 100;
          border-bottom: 1px solid #111; background: ${BG}dd;
          backdrop-filter: blur(8px);
        }
        .rp-back {
          background: none; border: 1px solid #222; color: #555;
          font-family: 'Barlow Condensed', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: .15em; text-transform: uppercase;
          padding: 7px 14px; cursor: pointer; transition: color .2s, border-color .2s;
        }
        .rp-back:hover { color: #fff; border-color: #fff; }
        .rp-brand { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: .3em; color: #333; }
        .rp-brand span { color: ${GOLD}; }

        /* ── CONTENT BLOCKS ── */
        .rp-block { width: 100%; max-width: 480px; animation: fadeUp .4s ease both; }
        @media (max-width: 520px) { .rp-block { max-width: 100%; } }

        .rp-eyebrow { font-family: 'Courier Prime', monospace; font-weight: 700; font-size: 10px; color: ${GOLD}; letter-spacing: 4px; text-transform: uppercase; display: block; margin-bottom: 10px; }
        .rp-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem, 8vw, 4rem); letter-spacing: -.02em; line-height: .9; color: #fff; margin-bottom: 6px; }
        .rp-h1 span { color: ${GOLD}; }
        .rp-h1-sub { font-family: 'Courier Prime', monospace; font-size: 12px; color: #555; margin-bottom: 28px; line-height: 1.6; }

        /* ── CHOICE CARDS ── */
        .rp-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-bottom: 0; }
        @media (max-width: 460px) { .rp-choices { grid-template-columns: 1fr; gap: 10px; } }
        .rp-choice {
          padding: 22px 18px; border: 1px solid #1e1e1e; cursor: pointer;
          transition: border-color .2s, transform .2s, background .2s;
          position: relative; overflow: hidden;
        }
        .rp-choice:hover { transform: translateY(-4px); }
        .rp-choice-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .rp-choice-label::before { content:''; display:inline-block; width:16px; height:1px; }
        .rp-choice-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: #fff; margin-bottom: 6px; }
        .rp-choice-desc  { font-family: 'Courier Prime', monospace; font-size: 11px; color: #555; line-height: 1.55; }

        /* ── FORM ── */
        .rp-label { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 3px; color: #555; text-transform: uppercase; margin-bottom: 7px; margin-top: 16px; display: block; }
        .rp-input {
          width: 100%; padding: 13px 14px; background: #0d0d0d;
          border: 1px solid #1e1e1e; color: #fff;
          font-family: 'Barlow Condensed', sans-serif; font-size: 17px; letter-spacing: .06em;
          outline: none; transition: border-color .2s;
        }
        .rp-input:focus { border-color: ${GOLD}; }
        .rp-input::placeholder { color: #2a2a2a; }
        .rp-input.code-input { letter-spacing: .35em; font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; text-align: center; }

        /* ── TOGGLE PILLS ── */
        .rp-pills  { display: flex; gap: 7px; }
        .rp-pill {
          flex: 1; padding: 9px 8px; background: #111; border: 1px solid #1e1e1e;
          font-family: 'Bebas Neue', sans-serif; font-size: .95rem; letter-spacing: .08em;
          color: #444; cursor: pointer; transition: all .2s; text-align: center;
        }
        .rp-pill sub { font-family: 'Courier Prime', monospace; font-size: 8px; display: block; letter-spacing: 1px; opacity: .6; margin-top: 2px; }
        .rp-pill.gold-on  { border-color: ${GOLD}; background: rgba(232,184,75,.08); color: ${GOLD}; }
        .rp-pill.cyan-on  { border-color: ${CYAN}; background: rgba(34,211,238,.07); color: ${CYAN}; }

        /* ── PRIMARY BUTTON ── */
        .rp-btn {
          width: 100%; padding: 14px 16px; background: ${GOLD}; border: none;
          font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: .1em;
          color: #000; cursor: pointer; margin-top: 14px;
          transition: transform .18s, box-shadow .18s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .rp-btn:hover  { transform: translate(-2px,-2px); box-shadow: 3px 3px 0 #fff; }
        .rp-btn:disabled { opacity: .35; pointer-events: none; }
        .rp-btn.cyan-btn { background: ${CYAN}; }

        .rp-error { font-family: 'Courier Prime', monospace; font-size: 11px; color: #ef4444; letter-spacing: .04em; margin-top: 8px; }

        /* ── DIVIDER ── */
        .rp-hr { height: 1px; background: #181818; margin: 18px 0; }
        .rp-section { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 3px; color: #333; text-transform: uppercase; margin-bottom: 10px; }

        /* ── CODE DISPLAY ── */
        .rp-code-block { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 6px; }
        .rp-code-chip {
          font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.6rem, 6vw, 2.2rem); letter-spacing: .25em;
          color: ${CYAN}; background: rgba(34,211,238,.05); border: 1px solid rgba(34,211,238,.2);
          padding: 5px 14px; cursor: pointer; transition: background .2s; flex-shrink: 0;
        }
        .rp-code-chip:hover { background: rgba(34,211,238,.12); }
        .rp-copy-btn {
          padding: 8px 14px; background: rgba(34,211,238,.08); border: 1px solid rgba(34,211,238,.25);
          color: ${CYAN}; font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: .1em; cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .rp-copy-btn:hover { background: ${CYAN}; color: #000; }
        .rp-wa-link {
          padding: 8px 14px; background: rgba(37,211,102,.08); border: 1px solid rgba(37,211,102,.25);
          color: #25D366; font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: .1em; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px; transition: all .2s; white-space: nowrap;
        }
        .rp-wa-link:hover { background: #25D366; color: #000; }
        .rp-shareurl { font-family: 'Courier Prime', monospace; font-size: 10px; color: #2a2a2a; word-break: break-all; }

        /* ── PLAYER CHIPS ── */
        .rp-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .rp-chip {
          display: flex; align-items: center; gap: 7px;
          background: #0d0d0d; border: 1px solid #1e1e1e; padding: 7px 12px;
        }
        .rp-chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        /* ── TEAM GRID ── */
        .rp-team-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 7px; }
        @media (max-width: 480px) { .rp-team-grid { grid-template-columns: repeat(3,1fr); } }
        .rp-team-tile {
          padding: 10px 6px; text-align: center; cursor: pointer;
          border: 1px solid #1a1a1a; background: #111;
          transition: transform .18s, border-color .18s, background .18s;
        }
        .rp-team-tile:not(.t-taken):hover { transform: translateY(-3px); }

        /* ── PUBLIC ROOMS ── */
        .rp-room-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: #0d0d0d; border: 1px solid #181818; margin-bottom: 7px; }
        .rp-room-join-btn { padding: 6px 14px; background: rgba(34,211,238,.08); border: 1px solid rgba(34,211,238,.25); color: ${CYAN}; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: .1em; cursor: pointer; transition: all .2s; }
        .rp-room-join-btn:hover { background: ${CYAN}; color: #000; }

        .rp-join-row { display: flex; gap: 8px; margin-top: 4px; align-items: flex-start; }
        .rp-join-row .rp-input { flex: 1; min-width: 0; }
        .rp-join-row .rp-btn   { width: auto; padding: 13px 20px; margin-top: 0; flex-shrink: 0; }

        /* ── GLOBAL MOBILE SWEEP ── */
        @media (max-width: 400px) {
          .rp-h1  { font-size: 2.4rem; }
          .rp-nav { padding: 12px 14px; }
          .rp-choice { padding: 18px 14px; }
          .rp-pill  { font-size: .85rem; padding: 8px 6px; }
          .rp-btn   { font-size: 1rem; padding: 13px 12px; }
          .rp-team-grid { grid-template-columns: repeat(3,1fr) !important; gap:5px; }
          .rp-team-tile { padding: 8px 4px; }
          .rp-input { font-size: 15px; padding: 12px 12px; }
          .rp-join-row { flex-direction: column; }
          .rp-join-row .rp-input { width: 100%; }
          .rp-join-row .rp-btn   { width: 100%; margin-top: 0; }
          .rp-room-item { flex-direction: column; align-items: flex-start; gap: 8px; }
          .rp-chip { padding: 6px 10px; }
        }
      `}</style>

      {/* Center */}
      <div className="rp-center">
        {/* ── NAVBAR ── */}
        <nav className="rp-nav">
          <button className="rp-back" onClick={() => {
            if (phase === 'lobby' || phase === 'join' || phase === 'create-form') setPhase('home');
            else router.push('/');
          }}>← Back</button>
          <div className="rp-brand">IPL <span>AUCTION</span></div>
        </nav>

        {/* ══ HOME ══ */}
        {phase === 'home' && (
          <div className="rp-block">
            <span className="rp-eyebrow">Multiplayer</span>
            <h1 className="rp-h1">JOIN THE<br /><span>AUCTION ROOM</span></h1>
            <p className="rp-h1-sub">Create a room or enter a code to join your squad.</p>
            <div className="rp-choices">
              <div className="rp-choice"
                style={{ background:'#0a0a0a' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = 'rgba(232,184,75,.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#0a0a0a'; }}
                onClick={() => { setError(''); setPhase('create-form'); }}>
                <div className="rp-choice-label" style={{ color:GOLD }}>HOST</div>
                <div className="rp-choice-title">CREATE ROOM</div>
                <div className="rp-choice-desc">Set up a private or public room. Pick MEGA or MINI and invite friends.</div>
              </div>
              <div className="rp-choice"
                style={{ background:'#0a0a0a' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.background = 'rgba(34,211,238,.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#0a0a0a'; }}
                onClick={() => { setError(''); setPhase('join'); }}>
                <div className="rp-choice-label" style={{ color:CYAN }}>PLAYER</div>
                <div className="rp-choice-title">JOIN ROOM</div>
                <div className="rp-choice-desc">Enter a room code or pick from active public rooms.</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ CREATE FORM ══ */}
        {phase === 'create-form' && (
          <div className="rp-block">
            <span className="rp-eyebrow">Create Room</span>
            <h1 className="rp-h1" style={{ fontSize:'clamp(2rem,7vw,3.2rem)' }}>SET UP YOUR<br /><span>ROOM</span></h1>

            <label className="rp-label">Your Name</label>
            <input ref={nameRef} className="rp-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul" maxLength={20} onKeyDown={e => e.key === 'Enter' && handleCreate()} />

            <label className="rp-label">Visibility</label>
            <div className="rp-pills">
              <button className={`rp-pill${!isPrivate ? ' gold-on' : ''}`} onClick={() => setIsPrivate(false)}>PUBLIC<sub>Open to all</sub></button>
              <button className={`rp-pill${isPrivate ? ' gold-on' : ''}`} onClick={() => setIsPrivate(true)}>PRIVATE<sub>Code only</sub></button>
            </div>

            <label className="rp-label">Auction Mode</label>
            <div className="rp-pills">
              <button className={`rp-pill${aMode === 'mega' ? ' gold-on' : ''}`} onClick={() => setAMode('mega')}>MEGA<sub>500+ Players</sub></button>
              <button className={`rp-pill${aMode === 'mini' ? ' cyan-on' : ''}`} onClick={() => setAMode('mini')}>MINI<sub>200 Players</sub></button>
            </div>

            {error && <div className="rp-error">{error}</div>}
            <button className="rp-btn" onClick={handleCreate} disabled={loading}>
              {loading ? 'CREATING ROOM…' : 'CREATE ROOM →'}
            </button>
          </div>
        )}

        {/* ══ JOIN ══ */}
        {phase === 'join' && (
          <div className="rp-block">
            <span className="rp-eyebrow">Join Room</span>
            <h1 className="rp-h1" style={{ fontSize:'clamp(2rem,7vw,3.2rem)' }}>ENTER THE<br /><span>AUCTION FLOOR</span></h1>

            <label className="rp-label">Your Name</label>
            <input ref={nameRef} className="rp-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul" maxLength={20} />

            <label className="rp-label">Room Code</label>
            <div className="rp-join-row">
              <input className="rp-input code-input" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ABCD" maxLength={6} onKeyDown={e => e.key === 'Enter' && doJoin(joinCode)} />
              <button className="rp-btn cyan-btn" onClick={() => doJoin(joinCode)} disabled={loading}>
                {loading ? '…' : 'JOIN'}
              </button>
            </div>

            {error && <div className="rp-error">{error}</div>}

            {serverRooms.length > 0 && (
              <>
                <div className="rp-hr" />
                <div className="rp-section">Active Public Rooms</div>
                {serverRooms.map((r, i) => (
                  <div key={i} className="rp-room-item">
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:'#ddd', letterSpacing:'.04em' }}>{r.name}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:'#444', marginTop:2 }}>Host: {r.host} · {r.players}/10</div>
                    </div>
                    <button className="rp-room-join-btn" onClick={() => doJoin(r.code)} disabled={loading}>JOIN</button>
                  </div>
                ))}
              </>
            )}
            {serverRooms.length === 0 && (
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:'#2a2a2a', marginTop:16, textAlign:'center' }}>No public rooms right now.</div>
            )}
          </div>
        )}

        {/* ══ LOBBY ══ */}
        {phase === 'lobby' && roomCode && (
          <div className="rp-block" style={{ maxWidth:520 }}>
            {/* Code */}
            <div className="rp-section">Room Code — Share to Invite</div>
            <div className="rp-code-block">
              <div className="rp-code-chip" onClick={copyLink} title="Click to copy">{roomCode}</div>
              <button className="rp-copy-btn" onClick={copyLink}>{copied ? '✓ COPIED' : 'COPY CODE'}</button>
              <a className="rp-wa-link" href={`https://wa.me/?text=${encodeURIComponent(`Join my IPL Auction game! 🏏\n\nClick: ${shareUrl}\nOr code: ${roomCode}`)}`} target="_blank" rel="noreferrer">📱 SHARE</a>
            </div>
            <div className="rp-shareurl">{shareUrl}</div>

            <div className="rp-hr" />

            {/* Mode — host only */}
            {isHost && (
              <>
                <div className="rp-section">Auction Mode</div>
                <div className="rp-pills" style={{ marginBottom:16 }}>
                  <button className={`rp-pill${aMode === 'mega' ? ' gold-on' : ''}`} onClick={() => changeMode('mega')}>MEGA<sub>500+ Players</sub></button>
                  <button className={`rp-pill${aMode === 'mini' ? ' cyan-on' : ''}`} onClick={() => changeMode('mini')}>MINI<sub>200 Players</sub></button>
                </div>
              </>
            )}
            {!isHost && lobbyMode && (
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, color:'#444', marginBottom:14 }}>
                Mode: <span style={{ color: lobbyMode === 'mega' ? GOLD : CYAN }}>{lobbyMode.toUpperCase()} AUCTION</span>
              </div>
            )}

            {/* Players */}
            <div className="rp-section">Players ({lobbyPlayers.length}/10)</div>
            <div className="rp-chips" style={{ marginBottom:16 }}>
              {lobbyPlayers.map((p, i) => {
                const team = TEAMS.find(t => t.id === p.teamId);
                return (
                  <div key={i} className="rp-chip">
                    <div className="rp-chip-dot" style={{ background: team?.color || '#2a2a2a' }} />
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:600, fontSize:14, color: team?.color || '#aaa', letterSpacing:'.04em' }}>{p.name}</span>
                    {p.isHost && <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:GOLD, letterSpacing:'2px' }}>HOST</span>}
                  </div>
                );
              })}
            </div>

            <div className="rp-hr" />

            {/* Team grid */}
            <div className="rp-section">Pick Your Franchise</div>
            <div className="rp-team-grid" style={{ marginBottom:18 }}>
              {TEAMS.map(t => {
                const taken  = takenTeams.has(t.id) && t.id !== myTeamId;
                const isMine = t.id === myTeamId;
                return (
                  <div key={t.id}
                    className={`rp-team-tile${taken ? ' t-taken' : ''}`}
                    style={{ borderColor: isMine ? t.color : taken ? '#111' : '#1a1a1a', background: isMine ? `${t.color}12` : taken ? '#090909' : '#111', opacity: taken ? .28 : 1, cursor: taken ? 'not-allowed' : 'pointer' }}
                    onClick={() => !taken && selectTeam(t.id)}
                  >
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.15rem', color: isMine ? t.color : taken ? '#333' : t.color, letterSpacing:'.03em' }}>{t.short}</div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:'7.5px', color:'#333', marginTop:2, lineHeight:1.3 }}>{t.name}</div>
                    {isMine && <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:'7px', color:t.color, marginTop:3, letterSpacing:'1px' }}>✓ YOU</div>}
                    {taken  && <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:'7px', color:'#444', marginTop:3 }}>TAKEN</div>}
                  </div>
                );
              })}
            </div>

            {error && <div className="rp-error" style={{ marginBottom:10 }}>{error}</div>}

            {isHost ? (
              <button className="rp-btn" onClick={handleStart} disabled={!canStart}>
                START AUCTION →
              </button>
            ) : (
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, color:'#333', letterSpacing:'.1em', textAlign:'center', padding:'12px 0' }}>
                Waiting for host to start…
              </div>
            )}
          </div>
        )}
      </div>

    </>
  );
}
