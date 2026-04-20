'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '../../GameContext';
import { GOLD, BG, CARD, BORDER } from '../../../src/MultiScreens';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code?.toUpperCase() || '';
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    emit, playerId, setRoomCode, setLobbyPlayers,
    setIsHost, setMyName, setPlayMode, setMultiGS,
    setLobbyMode, setIsSpectator, setRoomMeta
  } = useGame();

  const handleJoin = (preferredRole = 'player') => {
    if (!name.trim()) return setError("Enter your name");
    setLoading(true);
    setError('');

    emit("join-room", { code, playerName: name.trim(), playerId, preferredRole }, (res) => {
      setLoading(false);
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("ipl_player_name", name.trim());
          if (res.roomStatus === "finished") {
            localStorage.removeItem("ipl_room_code");
            localStorage.removeItem("ipl_play_mode");
          } else {
            localStorage.setItem("ipl_room_code", code);
            localStorage.setItem("ipl_play_mode", "multi");
          }
        }
        setRoomCode(res.code || code);
        setMyName(name.trim());
        setLobbyPlayers(res.players);
        setPlayMode("multi");
        setIsHost(res.hostId === playerId);
        setIsSpectator(!!res.isSpectator);
        if (res.auctionMode) setLobbyMode(res.auctionMode);
        setRoomMeta({
          roomType: res.roomType || 'standard',
          activeTeamIds: res.activeTeamIds || null,
          rivalsMatch: res.rivalsMatch || null,
          roomName: res.roomName || null,
          squadLimit: res.squadLimit || null,
        });

        if (res.roomStatus === "active") {
          setMultiGS(res.gameState);
          const me = (res.players || []).find((player) => player.id === playerId);
          if (res.isSpectator || me?.teamId) {
            router.push(`/auction?room=${code}${res.auctionMode ? `&mode=${res.auctionMode}` : ''}${res.isSpectator ? '&spectator=1' : ''}`);
          } else {
            const params = new URLSearchParams({
              action: 'lobby',
              room: code,
            });
            if (res.auctionMode) params.set('mode', res.auctionMode);
            router.push(`/room?${params.toString()}`);
          }
        } else if (res.roomStatus === "finished") {
          setMultiGS(res.gameState);
          router.push(`/results?room=${code}${res.auctionMode ? `&mode=${res.auctionMode}` : ''}`);
        } else {
          const params = new URLSearchParams({
            action: 'lobby',
            room: code,
          });
          if (res.auctionMode) params.set('mode', res.auctionMode);
          router.push(`/room?${params.toString()}`);
        }
      } else {
        setError(res.error === 'Room not found' ? 'Room not found or already expired.' : (res.error || "Failed to join room"));
      }
    });
  };

  const inputStyle = {
    width: "100%", padding: "16px 18px", background: "#0a0c14",
    border: `1px solid ${BORDER}`, borderRadius: 10, color: "#fff",
    fontSize: 18, fontFamily: "'Rajdhani'", letterSpacing: 2,
    outline: "none", boxSizing: "border-box", textAlign: "center"
  };

  return (
    <div style={{
      minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      <div style={{ animation: "fadeUp .4s ease-out", textAlign: "center", maxWidth: 400, width: "90%" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(28px,4vw,48px)", color: GOLD, letterSpacing: 6 }}>
            JOIN AUCTION
          </div>
          <div style={{ color: "#555", fontSize: 12, letterSpacing: 3, marginTop: 8 }}>
            YOU&apos;VE BEEN INVITED TO A ROOM
          </div>
        </div>

        {/* Room Code Display */}
        <div style={{
          background: CARD, border: `1px solid #22D3EE40`, borderRadius: 12,
          padding: "20px", marginBottom: 28
        }}>
          <div style={{ fontSize: 10, color: "#888", letterSpacing: 3, marginBottom: 8 }}>ROOM CODE</div>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: 48, color: "#22D3EE",
            letterSpacing: 10, lineHeight: 1
          }}>
            {code}
          </div>
        </div>

        {/* Name Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter Your Name"
            style={inputStyle}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && handleJoin('player')}
            autoFocus
          />

          {error && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{error}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:12 }}>
            <button
              onClick={() => handleJoin('player')}
              disabled={loading}
              style={{
                width: "100%", padding: "16px",
                background: `linear-gradient(135deg, ${GOLD}, #9a7610)`,
                border: "none", borderRadius: 8, color: "#000",
                fontSize: 16, fontWeight: 900, cursor: loading ? "wait" : "pointer",
                letterSpacing: 2, fontFamily: "'Barlow Condensed'",
                boxShadow: `0 4px 30px ${GOLD}44`
              }}
            >
              {loading ? "JOINING..." : "PLAY IF SLOT OPEN"}
            </button>
            <button
              onClick={() => handleJoin('spectator')}
              disabled={loading}
              style={{
                width: "100%", padding: "16px",
                background: "#0b1220",
                border: `1px solid ${BORDER}`, borderRadius: 8, color: "#cbd5e1",
                fontSize: 16, fontWeight: 900, cursor: loading ? "wait" : "pointer",
                letterSpacing: 2, fontFamily: "'Barlow Condensed'",
              }}
            >
              {loading ? "JOINING..." : "WATCH AS SPECTATOR"}
            </button>
          </div>
        </div>

        {/* Link to create own room */}
        <div style={{ marginTop: 28, color: "#444", fontSize: 12 }}>
          Or{' '}
          <span
            onClick={() => router.push("/room")}
            style={{ color: GOLD, cursor: "pointer", textDecoration: "underline" }}
          >
            create your own room
          </span>
        </div>
      </div>
    </div>
  );
}
