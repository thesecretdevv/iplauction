'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, fmt } from '../GameContext';
import { TEAMS, ROLE_C, ROLE_L, ROLE_EMOJI, GOLD, BG, CARD, BORDER } from '../../src/MultiScreens';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "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";

export default function ResultsPage() {
  const router = useRouter();
  const { gs, effectiveMyTeamId, handleRestart } = useGame();

  if (!gs) {
    return null;
  }

  return <Results gs={gs} myTeamId={effectiveMyTeamId} onRestart={handleRestart} />;
}

// ── Results Component (ported from App.jsx) ──
function Results({ gs, myTeamId: mti, onRestart }) {
  const [activeId, setActiveId] = useState(mti || TEAMS[0].id);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const team = TEAMS.find(t => t.id === activeId);

  if (showAnalysis) return <GeminiAnalysisScreen gs={gs} onBack={() => setShowAnalysis(false)} />;
  const playingXI = gs.playingXI?.[activeId] || [];
  const fullSquad = gs.squads[activeId] || [];
  const displayList = playingXI.length === 11 ? playingXI : fullSquad;

  const spent = +(120 - (gs.purses[activeId] || 0)).toFixed(2);
  const soldCount = (gs.auctionLog || []).filter(l => l.sold).length;
  const unsoldCount = (gs.auctionLog || []).filter(l => !l.sold).length;

  const downloadSheet = async () => {
    const el = document.getElementById("capture-results");
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: BG, scale: 2 });
    const link = document.createElement("a");
    link.download = `IPL-Auction-${team?.short}-XI.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareWhatsApp = () => {
    const text = `🏏 *IPL Auction* \nCheck out my Playing XI for *${team?.name}*!\n\n${displayList.map((p, i) => `${i + 1}. ${ROLE_EMOJI[p.role]} ${p.name}`).join("\n")}\n\nBuild your own squad at IPL Auction!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", padding: "clamp(16px,3vh,28px)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.res-squad{grid-template-columns:repeat(2,1fr)!important}@media(max-width:700px){.res-squad{grid-template-columns:1fr!important}}`}</style>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(30px,5vw,54px)", color: GOLD, letterSpacing: 8 }}>IPL AUCTION COMPLETE</div>
        <div style={{ color: "#555", fontSize: 12, letterSpacing: 3, marginTop: 4 }}>{soldCount} SOLD · {unsoldCount} UNSOLD</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {TEAMS.map(t => (
          <button key={t.id} onClick={() => setActiveId(t.id)} style={{ background: activeId === t.id ? t.color : "transparent", border: `1px solid ${t.color}`, borderRadius: 4, padding: "6px 14px", color: activeId === t.id ? "#000" : t.color, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Rajdhani'" }}>
            {t.short}{t.id === mti ? " ★" : ""}
          </button>
        ))}
      </div>
      <div id="capture-results" style={{ maxWidth: 1000, margin: "0 auto", animation: "fadeUp .3s ease-out", background: BG, padding: 20, borderRadius: 16 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ background: `linear-gradient(135deg, ${CARD}, #0A0D15)`, border: `1px solid ${GOLD}40`, borderRadius: 12, padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 10, boxShadow: `0 8px 30px ${GOLD}15` }}>
            <div style={{ fontSize: 13, color: GOLD, letterSpacing: 3, fontWeight: 700 }}>{team?.name}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: "#fff", letterSpacing: 2 }}>{playingXI.length === 11 ? "FINAL PLAYING XI" : "FULL SQUAD"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px dashed ${BORDER}`, paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>REMAINING PURSE</span>
              <strong style={{ color: GOLD, fontSize: 16 }}>{fmt(gs.purses[activeId])}</strong>
            </div>
          </div>
        </div>
        {displayList.length === 0 ? <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px", flex: 1 }}>No players purchased by {team?.name}</div> : (
          <div className="res-squad" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {displayList.map((p, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{ROLE_EMOJI[p.role]}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 14, color: "#eee" }}>{p.name}</div><div style={{ fontSize: 12, color: ROLE_C[p.role], marginTop: 2 }}>{ROLE_L[p.role]}{p.overseas ? " · OS" : ""}</div></div>
                </div>
                <div style={{ textAlign: "right" }}><div style={{ color: GOLD, fontWeight: 700, fontSize: 16 }}>{fmt(p.soldFor)}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: 40, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => setShowAnalysis(true)} style={{ background: `linear-gradient(135deg,#6366f1,#4338ca)`, border: "none", borderRadius: 3, padding: "14px 30px", color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'", boxShadow: "0 0 30px #6366f140" }}>AI TEAM ANALYSIS</button>
        <button onClick={downloadSheet} style={{ background: "#22D3EE", border: "none", borderRadius: 3, padding: "14px 30px", color: "#000", fontWeight: 900, cursor: "pointer", fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}>DOWNLOAD IMAGE</button>
        <button onClick={shareWhatsApp} style={{ background: "#25D366", border: "none", borderRadius: 3, padding: "14px 30px", color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}>SHARE ON WHATSAPP</button>
        <button onClick={onRestart} style={{ background: `linear-gradient(135deg, ${GOLD}, #9a7610)`, border: "none", borderRadius: 3, padding: "14px 36px", color: "#000", fontWeight: 900, cursor: "pointer", fontSize: 13, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}>PLAY AGAIN</button>
      </div>
    </div>
  );
}

// ── AI Analysis Screen (ported from App.jsx) ──
function GeminiAnalysisScreen({ gs, onBack }) {
  const [status, setStatus] = useState("idle");
  const [analysis, setAnalysis] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  async function runAnalysis() {
    if (!GROQ_API_KEY) {
      setErrorMsg("API key missing. Add NEXT_PUBLIC_GROQ_API_KEY OR use the fallback.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const teamSummaries = TEAMS.map(t => {
      const xi = gs.playingXI?.[t.id] || gs.squads?.[t.id]?.slice(0, 11) || [];
      const lines = xi.map(p => `    - ${p.name} (${p.role === "WK" ? "Wicket-Keeper" : p.role === "BAT" ? "Batter" : p.role === "BOWL" ? "Bowler" : "All-Rounder"}${p.overseas ? ", Overseas" : ""}) -- Rs.${p.soldFor?.toFixed(2) || p.base}Cr`).join("\n");
      const purseLeft = (gs.purses?.[t.id] || 0).toFixed(2);
      return `**${t.name} (${t.id})**\nPlaying XI:\n${lines || "  No players"}\nRemaining Purse: Rs.${purseLeft}Cr`;
    }).join("\n\n---\n\n");

    const prompt = `You are a world-class IPL cricket analyst with deep knowledge of IPL 2025 conditions. Based on the IPL Auction results below, critically analyze and rank ALL 10 teams from BEST (1st) to WORST (10th).

Consider the Playing XI composition, assigning specific batting positions and bowling roles. Evaluate their balance, overseas slot usage (max 4), and overall squad synergy.

Here are the 10 Final Playing XIs:

${teamSummaries}

CRITICAL RULES:
1. ABSOLUTELY NO EMOJIS anywhere in the response.
2. RESPOND IN EXACT JSON FORMAT (no markdown wrapper, pure JSON only).

{
  "rankings": [
    {
      "rank": 1,
      "teamId": "TEAM_ID",
      "teamName": "Full Team Name",
      "score": 92,
      "verdict": "One sentence championship-level verdict",
      "strengths": ["Strength 1 (NO EMOJIS)", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "whyWins": "Detailed explanation of why this team is the strongest based on their assigned roles in the XI."
    }
  ],
  "overallSummary": "Summary of the auction landscape. NO EMOJIS."
}

Rank ALL 10 teams. DO NOT USE A SINGLE EMOJI IN YOUR OUTPUT. Pure JSON only.`;

    try {
      const groq = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0]?.message?.content || "";
      const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      setAnalysis(parsed);
      setStatus("done");
    } catch (e) {
      console.error("Groq AI error:", e);
      setErrorMsg(e.message || "Failed to get analysis.");
      setStatus("error");
    }
  }

  useEffect(() => { runAnalysis(); }, []);

  const teamColor = (id) => TEAMS.find(t => t.id === id)?.color || "#888";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Rajdhani',sans-serif", padding: "clamp(14px,3vh,28px)" }}>
      <style>{`
        @keyframes fadeUpG{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes pulseG{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spinG{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes rankInG{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}
        .gem-card{transition:transform .2s,box-shadow .2s;cursor:pointer}
        .gem-card:hover{transform:translateY(-3px)!important}
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12, animation: "fadeUpG .4s ease-out" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(26px,4vw,48px)", color: GOLD, letterSpacing: 6, lineHeight: 1 }}>AI TEAM ANALYSIS</div>
          <div style={{ color: "#444", fontSize: 11, letterSpacing: 4, marginTop: 4 }}>POWERED BY ADVANCED AI · IPL 2025 CONDITIONS</div>
        </div>
        <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${GOLD}50`, borderRadius: 6, padding: "10px 22px", color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}>
          ← BACK TO RESULTS
        </button>
      </div>

      {status === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 28 }}>
          <div style={{ width: 70, height: 70, border: `4px solid ${GOLD}22`, borderTop: `4px solid ${GOLD}`, borderRadius: "50%", animation: "spinG 1s linear infinite" }} />
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: GOLD, letterSpacing: 4, animation: "pulseG 1.5s infinite" }}>AI IS ANALYZING YOUR TEAMS...</div>
          <div style={{ color: "#444", fontSize: 13, letterSpacing: 2, maxWidth: 420, textAlign: "center" }}>
            Evaluating squad balance, IPL 2025 form, overseas usage, death bowling and powerplay specialists across all 10 franchises...
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {TEAMS.map((t, i) => (<div key={t.id} style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, animation: `pulseG ${0.8 + i * 0.1}s infinite` }} />))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, animation: "fadeUpG .4s ease-out" }}>
          <div style={{ fontSize: 52 }}>⚠️</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, color: "#ef4444", letterSpacing: 4 }}>ANALYSIS FAILED</div>
          <div style={{ background: "#0d0d0d", border: "1px solid #ef444428", borderRadius: 12, padding: "18px 28px", maxWidth: 520, textAlign: "center" }}>
            <div style={{ color: "#ef4444", fontSize: 13, lineHeight: 1.7 }}>{errorMsg}</div>
            {!CLAUDE_API_KEY && (
              <div style={{ marginTop: 14, padding: "10px 16px", background: "#1a1a1a", borderRadius: 8, fontFamily: "monospace", fontSize: 12, color: GOLD, letterSpacing: 1 }}>
                NEXT_PUBLIC_CLAUDE_API_KEY=your_key_here
              </div>
            )}
          </div>
          <button onClick={runAnalysis} style={{ background: `linear-gradient(135deg,${GOLD},#9a7610)`, border: "none", borderRadius: 6, padding: "12px 32px", color: "#000", fontWeight: 900, cursor: "pointer", fontSize: 14, letterSpacing: 2, fontFamily: "'Barlow Condensed'" }}>
            RETRY ANALYSIS
          </button>
        </div>
      )}

      {status === "done" && analysis && (
        <div style={{ animation: "fadeUpG .5s ease-out" }}>
          {analysis.overallSummary && (
            <div style={{ background: `${GOLD}09`, border: `1px solid ${GOLD}28`, borderRadius: 12, padding: "18px 24px", maxWidth: 900, margin: "0 auto 28px" }}>
              <div style={{ fontSize: 10, color: GOLD, letterSpacing: 4, fontWeight: 700, marginBottom: 8 }}>🏏 EXPERT SUMMARY</div>
              <div style={{ color: "#ccc", fontSize: 15, lineHeight: 1.75 }}>{analysis.overallSummary}</div>
            </div>
          )}

          {analysis.rankings?.[0] && (() => {
            const champ = analysis.rankings[0];
            const tc = teamColor(champ.teamId);
            return (
              <div style={{ background: `linear-gradient(135deg,${tc}14,${GOLD}06,${CARD})`, border: `2px solid ${GOLD}`, borderRadius: 16, padding: "26px 30px", maxWidth: 900, margin: "0 auto 24px", boxShadow: `0 0 60px ${GOLD}1a`, animation: "fadeUpG .6s ease-out" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, background: `linear-gradient(135deg,${GOLD},#9a7610)`, color: "#000", borderRadius: 6, padding: "4px 16px", letterSpacing: 2 }}>🥇 #1 CHAMPION</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, color: GOLD, letterSpacing: 4 }}>{champ.teamName}</div>
                  <div style={{ marginLeft: "auto", background: `${GOLD}14`, border: `1px solid ${GOLD}40`, borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, color: GOLD }}>{champ.score}</div>
                    <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>SCORE/100</div>
                  </div>
                </div>
                <div style={{ color: "#e0c97b", fontSize: 15, fontStyle: "italic", marginBottom: 16, lineHeight: 1.65 }}>&quot;{champ.verdict}&quot;</div>
                {champ.whyWins && (
                  <div style={{ background: "#ffffff05", borderRadius: 10, padding: "14px 18px", borderLeft: `4px solid ${GOLD}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>WHY THIS TEAM WINS IPL 2025</div>
                    <div style={{ color: "#bbb", fontSize: 14, lineHeight: 1.8 }}>{champ.whyWins}</div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {champ.strengths?.length > 0 && (
                    <div style={{ background: "#00cc6608", border: "1px solid #00cc6620", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, color: "#00cc88", letterSpacing: 3, marginBottom: 8, fontWeight: 700 }}>✅ STRENGTHS</div>
                      {champ.strengths.map((s, i) => <div key={i} style={{ color: "#aaa", fontSize: 13, marginBottom: 5, paddingLeft: 10, borderLeft: "2px solid #00cc8840" }}>• {s}</div>)}
                    </div>
                  )}
                  {champ.weaknesses?.length > 0 && (
                    <div style={{ background: "#ff444408", border: "1px solid #ff444422", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, color: "#ff6b6b", letterSpacing: 3, marginBottom: 8, fontWeight: 700 }}>⚠️ VULNERABILITIES</div>
                      {champ.weaknesses.map((w, i) => <div key={i} style={{ color: "#aaa", fontSize: 13, marginBottom: 5, paddingLeft: 10, borderLeft: "2px solid #ff444440" }}>• {w}</div>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: "#444", letterSpacing: 4, marginBottom: 6 }}>ALL TEAM RANKINGS — CLICK TO EXPAND</div>
            {analysis.rankings?.map((r, idx) => {
              const tc = teamColor(r.teamId);
              const isOpen = expanded[r.teamId];
              const borderC = idx === 0 ? GOLD : idx === 1 ? "#aaa" : idx === 2 ? "#CD7F32" : BORDER;
              return (
                <div key={r.teamId} className="gem-card" onClick={() => toggleExpand(r.teamId)}
                  style={{ background: CARD, border: `1px solid ${borderC}`, borderRadius: 12, overflow: "hidden", animation: `rankInG ${0.15 + idx * 0.06}s ease-out both` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: idx === 0 ? `${GOLD}07` : "transparent" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, minWidth: 40, textAlign: "center", lineHeight: 1, color: idx === 0 ? GOLD : idx === 1 ? "#aaa" : idx === 2 ? "#CD7F32" : "#555" }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${r.rank}`}
                    </div>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: tc, boxShadow: `0 0 8px ${tc}`, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: tc, letterSpacing: 2, lineHeight: 1 }}>{r.teamName}</div>
                      <div style={{ color: "#555", fontSize: 12, marginTop: 2, letterSpacing: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.verdict}</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 52, flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: idx === 0 ? GOLD : idx === 1 ? "#aaa" : idx === 2 ? "#CD7F32" : "#555" }}>{r.score}</div>
                      <div style={{ fontSize: 8, color: "#444", letterSpacing: 2 }}>/100</div>
                    </div>
                    <div style={{ color: "#444", fontSize: 16, marginLeft: 6, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${BORDER}`, animation: "fadeUpG .2s ease-out" }}>
                      {r.whyWins && (
                        <div style={{ margin: "14px 0 12px", background: "#ffffff05", borderRadius: 8, padding: "12px 16px", borderLeft: `3px solid ${tc}` }}>
                          <div style={{ fontSize: 9, color: tc, letterSpacing: 3, fontWeight: 700, marginBottom: 6 }}>DETAILED ANALYSIS</div>
                          <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.75 }}>{r.whyWins}</div>
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                        {r.strengths?.length > 0 && (
                          <div style={{ background: "#00cc6606", border: "1px solid #00cc6618", borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ fontSize: 9, color: "#00cc88", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>STRENGTHS</div>
                            {r.strengths.map((s, i) => <div key={i} style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>• {s}</div>)}
                          </div>
                        )}
                        {r.weaknesses?.length > 0 && (
                          <div style={{ background: "#ff444406", border: "1px solid #ff444418", borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ fontSize: 9, color: "#ff6b6b", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>WEAKNESSES</div>
                            {r.weaknesses.map((w, i) => <div key={i} style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>• {w}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 32, color: "#2a2a2a", fontSize: 11, letterSpacing: 2 }}>
            Analysis by Advanced AI · Based on IPL 2025 player form & team balance
          </div>
        </div>
      )}
    </div>
  );
}
