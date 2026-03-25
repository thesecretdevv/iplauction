'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import { useGame } from '../GameContext';

export default function ModePage() {
  const router = useRouter();
  const { setAuctionMode } = useGame();
  const [hov, setHov] = useState(null);

  const modes = [
    { id: "mega", title: "BIDWICKET IPL MEGA AUCTION", subtitle: "500+ Official Players · 40+ Sets", desc: "Full mega auction with all official sets.", icon: "🏟️", players: "500+", color: GOLD },
    { id: "mini", title: "BIDWICKET IPL MINI AUCTION", subtitle: "200 Players · Quick Mode", desc: "Quick game with top players from all categories shuffled randomly.", icon: "⚡", players: "200", color: "#22D3EE" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ textAlign: "center", marginBottom: 50, animation: "fadeUp .4s ease-out" }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(32px,5vw,52px)", letterSpacing: 8, color: GOLD }}>SELECT BIDWICKET IPL AUCTION MODE</div>
      </div>
      <div style={{ display: "flex", gap: 24, animation: "fadeUp .5s ease-out", flexWrap: "wrap", justifyContent: "center", padding: "0 20px" }}>
        {modes.map(m => (
          <div key={m.id} onClick={() => { setAuctionMode(m.id); router.push(`/play-mode?mode=${m.id.toUpperCase()}`); }} onMouseEnter={() => setHov(m.id)} onMouseLeave={() => setHov(null)}
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
