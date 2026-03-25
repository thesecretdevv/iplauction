'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GOLD, BG, BORDER } from '../src/MultiScreens';
import { useGame, playIplTheme } from './GameContext';

const tataIplLogo = '/assets/TataIPL.png';

export default function HomePage() {
  const router = useRouter();
  const { setPlayMode } = useGame();

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% 90%, #1c150a 0%, ${BG} 62%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`.home-title{font-size:clamp(52px,9vw,110px)!important}.home-year{font-size:clamp(28px,4.5vw,58px)!important}.home-stats{gap:clamp(20px,4vw,54px)!important;flex-wrap:wrap!important}.home-btn{padding:14px clamp(28px,5vw,60px)!important;font-size:clamp(13px,1.4vw,17px)!important;margin-top:clamp(28px,4vh,52px)!important}.home-stat-val{font-size:clamp(18px,2.5vw,28px)!important}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      {[300, 500, 700, 900].map(s => <div key={s} style={{ position: "absolute", width: s, height: s, border: "1px solid rgba(212,175,55,0.035)", borderRadius: "50%", pointerEvents: "none" }} />)}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(212,175,55,0.015) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(212,175,55,0.015) 40px)", pointerEvents: "none" }} />

      {/* TATA IPL LOGO */}
      <div style={{ position: "absolute", top: 16, left: 20, zIndex: 10 }}>
        <img src={tataIplLogo} alt="TATA IPL" style={{ height: 52, objectFit: "contain", filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.6))" }} />
      </div>

      {/* TOP SHORTCUTS */}
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 12, zIndex: 10 }}>
        <button onClick={() => { setPlayMode("multi"); router.push("/room"); }} style={{ background: "transparent", border: `1px solid ${GOLD}40`, borderRadius: 6, padding: "8px 16px", color: GOLD, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 2, fontFamily: "'Rajdhani'" }}>JOIN ROOM</button>
        <button onClick={() => { setPlayMode("multi"); router.push("/room"); }} style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}`, borderRadius: 6, padding: "8px 16px", color: GOLD, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 2, fontFamily: "'Rajdhani'" }}>CREATE ROOM</button>
      </div>

      <div style={{ textAlign: "center", zIndex: 1, animation: "fadeUp .6s ease-out" }}>
        <div style={{ color: `${GOLD}77`, fontSize: 11, letterSpacing: 8, marginBottom: 22, fontWeight: 600 }}>TATA INDIAN PREMIER LEAGUE</div>
        <div className="home-title" style={{ fontFamily: "'Bebas Neue'", fontSize: 110, lineHeight: 0.85, letterSpacing: 12, color: "#f0f0f0", textShadow: `0 0 100px ${GOLD}18` }}>BIDWICKET IPL<br /><span style={{ color: GOLD, textShadow: `0 0 80px ${GOLD}88, 0 0 160px ${GOLD}33` }}>AUCTION</span></div>
        <div className="home-year" style={{ fontFamily: "'Bebas Neue'", fontSize: 58, color: "#1e1e1e", letterSpacing: 22, marginTop: 6 }}>2025</div>
        <div style={{ color: "#444", fontSize: 12, marginTop: 22, letterSpacing: 5 }}>THE ULTIMATE BIDDING SIMULATION</div>
        <button className="home-btn" onClick={() => { playIplTheme(); router.push("/mode"); }} style={{ marginTop: 52, background: `linear-gradient(135deg, ${GOLD}, #9a7610)`, border: "none", borderRadius: 3, padding: "17px 60px", color: "#000", fontSize: 17, fontWeight: 900, cursor: "pointer", letterSpacing: 5, fontFamily: "'Barlow Condensed'", boxShadow: `0 4px 60px ${GOLD}55, 0 0 0 1px ${GOLD}22` }}>START AUCTION</button>
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
