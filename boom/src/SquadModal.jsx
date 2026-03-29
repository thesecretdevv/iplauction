'use client';

import { useState } from "react";
import { GOLD, CYAN, BG, CARD, BORDER, ROLE_C, ROLE_EMOJI, ROLE_L } from "./MultiScreens";



export function SquadModal({ isOpen, onClose, squads, myTeamId, TEAMS, maxSquad = 25, maxOverseas = 8 }) {
    if (!isOpen) return null;

    const mySquad = squads[myTeamId] || [];
    const myTeamInfo = TEAMS.find(t => t.id === myTeamId);

    // Group players by role using official keys
    const grouped = {
        "BAT": [],
        "BOWL": [],
        "AR": [],
        "WK": []
    };

    mySquad.forEach(p => {
        let r = p.role || "BAT";
        if (grouped[r]) grouped[r].push(p);
        else grouped["BAT"].push(p); // Fallback
    });

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: "'Rajdhani', sans-serif" }}>
            <style>{`
                @keyframes slideUp { from {opacity:0; transform:translateY(30px) scale(0.98);} to {opacity:1; transform:none;} }
                .squad-scroller::-webkit-scrollbar { width: 6px; }
                .squad-scroller::-webkit-scrollbar-track { background: ${BG}; border-radius: 4px; }
                .squad-scroller::-webkit-scrollbar-thumb { background: ${GOLD}55; border-radius: 4px; }
            `}</style>

            <div style={{ width: "90%", maxWidth: 900, background: CARD, border: `1px solid ${myTeamInfo?.color || GOLD}`, borderRadius: 16, overflow: "hidden", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column", maxHeight: "85vh", boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${myTeamInfo?.color || GOLD}22` }}>

                {/* Header */}
                <div style={{ padding: "24px 30px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(to right, ${myTeamInfo?.color}15, transparent)` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                        <img src={`/assets/${myTeamId}.png`} style={{ width: 50, height: 50, objectFit: 'contain' }} alt="" />
                        <div>
                            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, color: myTeamInfo?.color || GOLD, letterSpacing: 3, lineHeight: 1 }}>{myTeamInfo?.name || "MY SQUAD"}</div>
                            <div style={{ color: "#aaa", fontSize: 13, letterSpacing: 2, marginTop: 4, fontWeight: 600, display: "flex", gap: 15 }}>
                                <div>PLAYERS: <span style={{ color: "#fff", fontSize: 15 }}>{mySquad.length} <span style={{ color: "#555" }}>/</span> {maxSquad}</span></div>
                                <div style={{ color: mySquad.filter(p => p.overseas).length >= maxOverseas ? "#ff4d4d" : GOLD }}>
                                    OVERSEAS: <span style={{ color: "#fff", fontSize: 15 }}>{mySquad.filter(p => p.overseas).length} <span style={{ color: "#555" }}>/</span> {maxOverseas}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#666", fontSize: 28, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#666"}>✕</button>
                </div>

                {/* Content */}
                <div className="squad-scroller" style={{ padding: 30, overflowY: "auto", flex: 1 }}>
                    {mySquad.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#555", fontSize: 18, letterSpacing: 2 }}>You haven't bought any players yet.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                            {["BAT", "BOWL", "AR", "WK"].map(role => {
                                const players = grouped[role];
                                if (!players || players.length === 0) return null;

                                return (
                                    <div key={role}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#fff", letterSpacing: 2 }}>{ROLE_L[role]?.toUpperCase()}S</div>
                                            <div style={{ color: GOLD, fontSize: 12, background: `${GOLD}15`, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{players.length}</div>
                                            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${BORDER}, transparent)` }} />
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                                            {players.map((p, i) => (
                                                <div key={i} style={{ background: "#05070D", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8, transition: "transform 0.2s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <span style={{ fontSize: 16 }}>{ROLE_EMOJI[p.role]}</span>
                                                            <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, lineHeight: 1.2 }}>
                                                                {p.name} {p.overseas && <span title="Overseas Player">✈️</span>}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontWeight: 900, color: GOLD, fontSize: 14, whiteSpace: "nowrap", marginLeft: 8 }}>
                                                            {p.soldFor >= 1 ? `₹${p.soldFor.toFixed(2)}Cr` : `₹${Math.round(p.soldFor * 100)}L`}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8, borderTop: `1px dashed #222` }}>
                                                        <div style={{ fontSize: 11, color: p.overseas ? CYAN : "#888", fontWeight: 700, letterSpacing: 1 }}>{p.overseas ? "OVERSEAS" : "INDIAN"}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
