'use client';

import { Suspense } from 'react';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { LobbyScreen } from '../../../src/MultiScreens';
import { useGame, stopIplTheme } from '../../GameContext';
import { GOLD, BG, CARD, BORDER } from '../../../src/MultiScreens';

export default function LobbyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#05070D" }} />}>
      <LobbyContent />
    </Suspense>
  );
}

function LobbyContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const urlCode = params.code?.toUpperCase() || '';

  const {
    roomCode, lobbyPlayers, isHost, lobbyMode,
    emit, setLobbyMode, startMultiAuction
  } = useGame();

  const [copied, setCopied] = useState(false);

  const code = roomCode || urlCode;
  const mode = searchParams.get('mode') || lobbyMode || 'MEGA';
  const isPublic = searchParams.get('public') !== 'false';

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) {
    router.push("/room");
    return null;
  }

  return (
    <div>
      <LobbyScreen
        roomCode={code}
        players={lobbyPlayers}
        isHost={isHost}
        auctionMode={lobbyMode || mode}
        emit={emit}
        onModeSelect={m => { setLobbyMode(m); emit("set-auction-mode", { mode: m }); }}
        onStart={startMultiAuction}
      />
      {/* Shareable Link Section - overlaid at the bottom */}
      <div style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        background: CARD, border: `1px solid ${GOLD}40`, borderRadius: 12,
        padding: "12px 24px", display: "flex", alignItems: "center", gap: 14,
        fontFamily: "'Rajdhani',sans-serif", zIndex: 100,
        boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${GOLD}11`
      }}>
        <span style={{ color: "#888", fontSize: 12, letterSpacing: 2, fontWeight: 600 }}>SHARE LINK</span>
        <div style={{
          background: "#0a0c14", border: `1px solid ${BORDER}`, borderRadius: 6,
          padding: "6px 14px", color: "#22D3EE", fontSize: 13, fontFamily: "monospace",
          maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }}>
          {shareUrl}
        </div>
        <button onClick={copyLink} style={{
          background: copied ? "#22D3EE" : "#22D3EE22",
          color: copied ? "#000" : "#22D3EE",
          border: "1px solid #22D3EE55", borderRadius: 6,
          padding: "6px 16px", fontWeight: 700, cursor: "pointer",
          fontSize: 12, letterSpacing: 1, transition: "all .2s"
        }}>
          {copied ? "✓ COPIED!" : "COPY"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Join my IPL Auction game! 🏏\n\nClick to join: ${shareUrl}\n\nOr use room code: ${code}`)}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#25D36622", border: "1px solid #25D36650",
            padding: "6px 14px", borderRadius: 6, color: "#25D366",
            fontSize: 12, fontWeight: 700, textDecoration: "none"
          }}
        >
          📱 WHATSAPP
        </a>
      </div>
    </div>
  );
}
