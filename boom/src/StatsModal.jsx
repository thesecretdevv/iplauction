import { useState, useMemo } from "react";
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from "./MultiScreens";
import { PLAYER_IMAGES } from "./megaPlayers";

const fmt = c => c >= 1 ? `₹${c.toFixed(2)} Cr` : `₹${Math.round(c * 100)} L`;

export function StatsModal({ isOpen, gs, onClose }) {
    const [tab, setTab] = useState("upcoming");

    const sold = useMemo(() => (gs?.auctionLog || []).filter(l => l.sold), [gs?.auctionLog]);
    const unsold = useMemo(() => (gs?.auctionLog || []).filter(l => !l.sold), [gs?.auctionLog]);
    const upcoming = useMemo(() => (gs?.playerQueue || []).slice((gs?.currentIdx || 0) + 1), [gs?.playerQueue, gs?.currentIdx]);
    const leaderboard = useMemo(() => [...sold].sort((a, b) => b.price - a.price), [sold]);

    if (!isOpen) return null;

    const tabs = [
        { id: "upcoming", label: `UPCOMING (${upcoming.length})` },
        { id: "sold", label: `SOLD (${sold.length})` },
        { id: "unsold", label: `UNSOLD (${unsold.length})` },
        { id: "leaderboard", label: "LEADERBOARD" },
    ];

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Rajdhani',sans-serif", padding: 20 }}>
            {/* Backdrop */}
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,7,13,0.85)", backdropFilter: "blur(8px)", animation: "fadeIn .2s" }} />

            {/* Modal Container */}
            <div style={{ position: "relative", width: "100%", maxWidth: 880, height: "85vh", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", animation: "popIn .3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: `0 0 80px ${GOLD}11` }}>
                <style>{`
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes popIn{from{opacity:0;transform:scale(0.96) translateY(20px)}to{opacity:1;transform:none}}
          .st-tab{padding:14px 20px;font-family:'Bebas Neue';font-size:22px;letter-spacing:2px;cursor:pointer;transition:all .2s;text-align:center;flex:1}
          .st-tab:hover{background:rgba(212,175,55,0.05)}
        `}</style>

                {/* Header Tabs */}
                <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, background: "#0a0c16" }}>
                    {tabs.map(t => (
                        <div key={t.id} className="st-tab" onClick={() => setTab(t.id)}
                            style={{ color: tab === t.id ? GOLD : "#666", borderBottom: `2px solid ${tab === t.id ? GOLD : "transparent"}`, background: tab === t.id ? `${GOLD}11` : "transparent" }}>
                            {t.label}
                        </div>
                    ))}
                    <div onClick={onClose} style={{ padding: "0 24px", cursor: "pointer", display: "flex", alignItems: "center", borderLeft: `1px solid ${BORDER}`, color: "#ef4444", fontWeight: 900, fontSize: 24 }}>×</div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: 20, background: BG }}>
                    {/* UPCOMING */}
                    {tab === "upcoming" && (
                        <div style={{ display: "grid", gap: 8 }}>
                            {upcoming.length === 0 && <div style={{ color: "#555", textAlign: "center", padding: 40 }}>No upcoming players</div>}
                            {upcoming.map((p, i) => {
                                const newSet = i === 0 ? true : upcoming[i - 1].setName !== p.setName;
                                return (
                                    <div key={i}>
                                        {newSet && <div style={{ color: GOLD, fontSize: 13, letterSpacing: 3, fontWeight: 700, padding: "16px 0 8px" }}>{p.setName.toUpperCase()}</div>}
                                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                {PLAYER_IMAGES?.[p.name] ? (
                                                    <img src={PLAYER_IMAGES[p.name]} alt={p.name} referrerPolicy="no-referrer" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "top" }} />
                                                ) : (
                                                    <span style={{ fontSize: 20, background: `${ROLE_C[p.role]}1a`, borderRadius: "50%", display: "flex", width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>{ROLE_EMOJI[p.role]}</span>
                                                )}
                                                <div>
                                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#eee" }}>{p.name}</div>
                                                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{p.role} {p.overseas ? "· OVERSEAS" : ""}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{fmt(p.base)}</div>
                                                <div style={{ color: "#444", fontSize: 10, letterSpacing: 2 }}>BASE PRICE</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* SOLD */}
                    {tab === "sold" && (
                        <div style={{ display: "grid", gap: 8 }}>
                            {sold.length === 0 && <div style={{ color: "#555", textAlign: "center", padding: 40 }}>No players sold yet</div>}
                            {sold.map((l, i) => {
                                const team = TEAMS.find(t => t.id === l.bidder);
                                return (
                                    <div key={i} style={{ background: CARD, border: `1px solid ${team?.color}40`, borderLeft: `4px solid ${team?.color}`, borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            {PLAYER_IMAGES?.[l.player.name] ? (
                                                <img src={PLAYER_IMAGES[l.player.name]} alt={l.player.name} referrerPolicy="no-referrer" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "top" }} />
                                            ) : (
                                                <span style={{ fontSize: 20, background: `${ROLE_C[l.player.role]}1a`, borderRadius: "50%", display: "flex", width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>{ROLE_EMOJI[l.player.role]}</span>
                                            )}
                                            <div>
                                                <div style={{ fontSize: 16, fontWeight: 700, color: "#eee" }}>{l.player.name}</div>
                                                <div style={{ fontSize: 12, color: team?.color, marginTop: 4, fontWeight: 600 }}>Bought by {team?.name}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 1 }}>{fmt(l.price)}</div>
                                            <div style={{ color: "#666", fontSize: 11 }}>Base: {fmt(l.player.base)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* UNSOLD */}
                    {tab === "unsold" && (
                        <div style={{ display: "grid", gap: 8 }}>
                            {unsold.length === 0 && <div style={{ color: "#555", textAlign: "center", padding: 40 }}>No unsold players</div>}
                            {unsold.map((l, i) => (
                                <div key={i} style={{ background: CARD, border: `1px solid #ef444440`, borderLeft: `4px solid #ef4444`, borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {PLAYER_IMAGES?.[l.player.name] ? (
                                            <img src={PLAYER_IMAGES[l.player.name]} alt={l.player.name} referrerPolicy="no-referrer" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "top" }} />
                                        ) : (
                                            <span style={{ fontSize: 20, background: `${ROLE_C[l.player.role]}1a`, borderRadius: "50%", display: "flex", width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>{ROLE_EMOJI[l.player.role]}</span>
                                        )}
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: "#eee" }}>{l.player.name}</div>
                                            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{l.player.setName}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ color: "#ef4444", fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>UNSOLD</div>
                                        <div style={{ color: "#555", fontSize: 11 }}>Base: {fmt(l.player.base)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LEADERBOARD */}
                    {tab === "leaderboard" && (
                        <div style={{ display: "grid", gap: 12 }}>
                            {leaderboard.length === 0 && <div style={{ color: "#555", textAlign: "center", padding: 40 }}>Leaderboard empty</div>}
                            {leaderboard.map((l, i) => {
                                const team = TEAMS.find(t => t.id === l.bidder);
                                return (
                                    <div key={i} style={{ background: i === 0 ? `linear-gradient(90deg, ${GOLD}22, ${CARD})` : CARD, border: `1px solid ${i === 0 ? GOLD : BORDER}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: i === 0 ? GOLD : "#888", width: 30, textAlign: "center" }}>#{i + 1}</div>
                                        {PLAYER_IMAGES?.[l.player.name] ? (
                                            <img src={PLAYER_IMAGES[l.player.name]} alt={l.player.name} referrerPolicy="no-referrer" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
                                        ) : (
                                            <span style={{ fontSize: 24, background: `${ROLE_C[l.player.role]}1a`, borderRadius: "50%", display: "flex", width: 50, height: 50, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ROLE_EMOJI[l.player.role]}</span>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? GOLD : "#eee" }}>{l.player.name}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                                <span style={{ fontSize: 12, color: team?.color, fontWeight: 600 }}>{team?.name}</span>
                                                <span style={{ fontSize: 10, color: "#555" }}>•</span>
                                                <span style={{ fontSize: 12, color: ROLE_C[l.player.role] }}>{ROLE_L[l.player.role]}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 1, textShadow: i === 0 ? `0 0 20px ${GOLD}66` : "none" }}>{fmt(l.price)}</div>
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
