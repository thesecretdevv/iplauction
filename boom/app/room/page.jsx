'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '../GameContext';
import AppDialog from '../components/AppDialog';

const GOLD  = '#E8B84B';
const CYAN  = '#22D3EE';
const GREEN = '#4ade80';
const BG    = '#080808';
const CARD  = '#0d0d0d';

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

// ── Global styles ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Rajdhani:wght@500;600;700&family=Courier+Prime:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: ${BG}; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes floatOrb  { 0%{transform:translateY(0)rotate(0);opacity:0} 20%{opacity:.12} 80%{opacity:.12} 100%{transform:translateY(-800px)rotate(360deg);opacity:0} }
  @keyframes scrollMq  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }

  .rp-particles { position:fixed; top:0;left:0;right:0;bottom:0; overflow:hidden; pointer-events:none; z-index:0; }
  .particle { position:absolute; border-radius:50%; background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.8),rgba(232,184,75,.4) 40%,rgba(0,0,0,0) 80%); opacity:0; animation:floatOrb linear infinite; }
  .p1{left:10%;width:12px;height:12px;animation-duration:15s}
  .p2{left:30%;width:8px;height:8px;animation-duration:22s;animation-delay:3s;filter:hue-rotate(180deg)}
  .p3{left:50%;width:16px;height:16px;animation-duration:18s;animation-delay:7s}
  .p4{left:70%;width:10px;height:10px;animation-duration:26s;animation-delay:1s}
  .p5{left:85%;width:14px;height:14px;animation-duration:20s;animation-delay:5s;filter:hue-rotate(180deg)}

  .rp-nav {
    position:fixed; top:0;left:0;right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 24px; border-bottom:1px solid #111;
    background:${BG}ee; backdrop-filter:blur(10px);
  }
  .rp-brand { font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:.3em; color:#333; }
  .rp-brand span { color:${GOLD}; }
  .rp-back { background:none; border:1px solid #222; color:#555; font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:12px; letter-spacing:.15em; padding:7px 14px; cursor:pointer; transition:color .2s,border-color .2s; border-radius:4px; }
  .rp-back:hover { color:#fff; border-color:#555; }

  .rp-eyebrow {
    font-family:'Courier Prime',monospace; font-weight:700; font-size:11px; letter-spacing:4px; text-transform:uppercase; display:block; margin-bottom:10px;
    background:linear-gradient(90deg,${GOLD} 0%,#fff 50%,${GOLD} 100%); background-size:200% auto;
    color:transparent; -webkit-background-clip:text; background-clip:text; animation:shimmer 3s linear infinite;
  }
  .rp-h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(2.5rem,7vw,4.5rem); letter-spacing:-.02em; line-height:.9; color:#fff; }
  .rp-h1 span { color:${GOLD}; }
  .rp-live-counter { display:inline-flex; align-items:center; gap:8px; font-family:'Barlow Condensed',sans-serif; font-size:12px; letter-spacing:1px; color:${CYAN}; background:rgba(34,211,238,.1); padding:4px 10px; border-radius:4px; border:1px solid rgba(34,211,238,.2); margin:10px 0 22px; font-weight:700; }
  .rp-live-dot { width:6px; height:6px; border-radius:50%; background:${CYAN}; box-shadow:0 0 8px ${CYAN}; animation:pulse 1.5s ease-in-out infinite; }

  /* ── Choice cards (home screen) ── */
  .rp-choices { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; width:100%; }
  @media(max-width:768px){ .rp-choices{grid-template-columns:1fr 1fr} }
  @media(max-width:560px){ .rp-choices{grid-template-columns:1fr} }
  .rp-choice { padding:22px 18px; border:1px solid #1a1a1a; cursor:pointer; background:#0a0a0a; transition:all .3s cubic-bezier(.175,.885,.32,1.275); position:relative; overflow:hidden; border-radius:10px; }
  .rp-choice.create-card:hover { transform:translateY(-6px); border-color:${GOLD}; box-shadow:0 12px 32px rgba(232,184,75,.18); }
  .rp-choice.join-card:hover   { transform:translateY(-6px); border-color:${CYAN}; box-shadow:0 12px 32px rgba(34,211,238,.18); }
  .rp-choice.browse-card:hover { transform:translateY(-6px); border-color:#818cf8; box-shadow:0 12px 32px rgba(129,140,248,.18); }
  .rp-choice-label { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:10px; letter-spacing:3px; text-transform:uppercase; margin-bottom:12px; }
  .rp-choice-title { font-family:'Bebas Neue',sans-serif; font-size:1.85rem; color:#fff; margin-bottom:6px; }
  .rp-choice-desc  { font-family:'Courier Prime',monospace; font-size:11px; color:#94A3B8; line-height:1.6; }

  /* ── Form elements ── */
  .rp-label { font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:3px; color:#94A3B8; text-transform:uppercase; margin-bottom:7px; margin-top:22px; display:block; }
  .rp-input { width:100%; padding:15px 16px; background:#0c0c0c; border-radius:6px; border:1px solid #1e1e1e; color:#fff; font-family:'Barlow Condensed',sans-serif; font-size:17px; letter-spacing:.06em; outline:none; transition:border-color .2s,box-shadow .2s; }
  .rp-input:focus { border-color:${GOLD}; box-shadow:0 0 0 1px ${GOLD} inset; }
  .rp-input::placeholder { color:#666; }
  .rp-input.code-input { letter-spacing:.35em; font-family:'Bebas Neue',sans-serif; font-size:1.6rem; text-align:center; }
  .rp-input.code-input:focus { border-color:${CYAN}; box-shadow:0 0 0 1px ${CYAN} inset; }

  /* ── Toggle cards (tactile selection) ── */
  .rp-toggle-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px; }
  @media(max-width:480px) { .rp-toggle-grid { grid-template-columns:1fr; } }
  .rp-toggle-card {
    padding:16px 14px; border-radius:8px; cursor:pointer; border:1px solid #1e1e1e;
    background:#0c0c0c; transition:all .18s ease; position:relative; overflow:hidden;
    border-left:3px solid transparent;
    display:flex; flex-direction:column; gap:4px;
  }
  .rp-toggle-card:hover { border-color:#333; background:#111; }
  .rp-toggle-card.selected-gold { border-color:${GOLD}; border-left-color:${GOLD}; background:rgba(232,184,75,.07); }
  .rp-toggle-card.selected-cyan { border-color:${CYAN}; border-left-color:${CYAN}; background:rgba(34,211,238,.07); }
  .rp-toggle-card-title { font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:.08em; color:#fff; }
  .rp-toggle-card-sub   { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:1px; color:#888; }
  .rp-toggle-check { position:absolute; top:8px; right:10px; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; transition:all .18s; }

  /* ── Buttons ── */
  .rp-btn { width:100%; padding:16px; background:${GOLD}; border:none; border-radius:6px; font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:.1em; color:#000; cursor:pointer; margin-top:24px; transition:transform .2s,box-shadow .2s; display:flex; align-items:center; justify-content:center; gap:10px; }
  .rp-btn:hover    { transform:translateY(-3px); box-shadow:0 8px 24px rgba(232,184,75,.4); }
  .rp-btn:active   { transform:none; }
  .rp-btn:disabled { opacity:.35; pointer-events:none; }
  .rp-btn.cyan-btn { background:${CYAN}; }
  .rp-btn.cyan-btn:hover { box-shadow:0 8px 24px rgba(34,211,238,.4); }

  .rp-error { font-family:'Courier Prime',monospace; font-size:12px; color:#ef4444; margin-top:10px; padding:10px; background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); border-radius:4px; letter-spacing:.04em; }
  .rp-hr { height:1px; background:#131313; margin:20px 0; }

  /* ── Room list items ── */
  .rp-room-item { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:${CARD}; border:1px solid #181818; margin-bottom:8px; border-radius:8px; transition:border-color .2s; }
  .rp-room-item:hover { border-color:#333; }
  .rp-room-join-btn    { padding:8px 16px; background:rgba(34,211,238,.08); border:1px solid rgba(34,211,238,.3); color:${CYAN}; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; letter-spacing:.1em; cursor:pointer; transition:all .2s; border-radius:4px; }
  .rp-room-join-btn:hover { background:${CYAN}; color:#000; }
  .rp-room-rejoin-btn  { padding:8px 16px; background:rgba(232,184,75,.08); border:1px solid rgba(232,184,75,.3); color:${GOLD}; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; letter-spacing:.1em; cursor:pointer; transition:all .2s; border-radius:4px; }
  .rp-room-rejoin-btn:hover { background:${GOLD}; color:#000; }

  /* ── BROWSE ROOMS (mobile-native) ── */
  .rb-shell {
    min-height: 100vh; background: #0a0a0a;
    display: flex; flex-direction: column;
    font-family: 'Barlow Condensed', sans-serif;
  }
  .rb-header {
    position: sticky; top: 0;
    background: #0a0a0a; border-bottom: 1px solid #1a1a1a;
    z-index: 20; padding: 14px 16px 10px;
  }
  .rb-header-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .rb-back-btn { background: none; border: none; color: #ccc; font-size: 20px; cursor: pointer; padding: 0 4px; flex-shrink: 0; line-height:1; }
  .rb-title-block { flex: 1; }
  .rb-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #fff; letter-spacing: 1px; line-height: 1; }
  .rb-subtitle { font-size: 12px; color: #555; margin-top: 1px; }
  .rb-icon-btn { background: none; border: 1px solid #1e1e1e; color: #888; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; flex-shrink: 0; transition: all .2s; }
  .rb-icon-btn:hover { border-color: #444; color: #ccc; }
  .rb-create-btn { background: ${GOLD}; border: none; border-radius: 8px; color: #000; font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 1px; padding: 8px 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; flex-shrink: 0; transition: filter .2s; white-space:nowrap; }
  .rb-create-btn:hover { filter: brightness(1.1); }

  .rb-sport-pills { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .rb-sport-pills::-webkit-scrollbar { display: none; }
  .rb-sport-pill { padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .18s; letter-spacing: .5px; white-space: nowrap; border: 1px solid transparent; }
  .rb-sport-pill.active { background: ${GOLD}; color: #000; }
  .rb-sport-pill:not(.active) { background: #1a1a1a; color: #888; }
  .rb-sport-pill:not(.active):hover { border-color: #333; color: #ccc; }

  .rb-tabs { display: flex; gap: 10px; margin: 0 0 12px; }
  .rb-tab {
    flex: 1; padding: 14px 12px; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: .5px;
    cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: #111; border: 1px solid #242424; border-bottom: 2px solid transparent; color: #777;
    border-radius: 12px 12px 0 0; appearance: none; -webkit-appearance: none; box-shadow: none;
  }
  .rb-tab.active { color: #fff; border-color: #3a3214; border-bottom-color: ${GOLD}; background: linear-gradient(180deg, #19150a 0%, #111 100%); }
  .rb-tab.live-tab.active { border-color: #3a1818; border-bottom-color: #ef4444; background: linear-gradient(180deg, #1a1010 0%, #111 100%); }
  .rb-tab:not(.active) { color: #666; }
  .rb-tab-count { background: #222; color: #888; font-size: 11px; padding: 1px 6px; border-radius: 10px; }
  .rb-tab.active .rb-tab-count { background: ${GOLD}22; color: ${GOLD}; }
  .rb-tab.active.live-tab .rb-tab-count { background: #ef444422; color: #ef4444; }

  .rb-name-box { padding: 0 16px 12px; }
  .rb-name-label { font-size: 10px; letter-spacing: 2px; color: #555; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .rb-name-input { width: 100%; padding: 12px 14px; background: #141414; border: 1px solid #1e1e1e; border-radius: 10px; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 16px; letter-spacing: .06em; outline: none; transition: border-color .2s; }
  .rb-name-input:focus { border-color: ${GOLD}; }
  .rb-name-input::placeholder { color: #444; }

  .rb-rooms-list { flex: 1; overflow-y: auto; padding: 0 14px 24px; }

  .rb-room-card {
    background: #111; border: 1px solid #1c1c1c; border-radius: 14px;
    padding: 14px; margin-bottom: 12px; transition: border-color .2s;
  }
  .rb-room-card:hover { border-color: #333; }

  .rb-room-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
  .rb-status-badge { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 8px; border-radius: 5px; }
  .rb-status-badge.live { background: #ef444415; color: #ef4444; border: 1px solid #ef444430; }
  .rb-status-badge.waiting { background: #22c55e15; color: #22c55e; border: 1px solid #22c55e30; }
  .rb-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .rb-status-dot.live { background: #ef4444; animation: pulse .8s ease-in-out infinite; }
  .rb-status-dot.waiting { background: #22c55e; }

  .rb-room-code { font-family: 'Courier Prime', monospace; font-size: 10px; color: #444; letter-spacing: 2px; }
  .rb-team-count { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #fff; line-height: 1; }
  .rb-team-count span { font-size: 13px; color: #555; }
  .rb-team-label { font-size: 9px; letter-spacing: 2px; color: #555; text-transform: uppercase; }

  .rb-room-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #fff; letter-spacing: 1px; line-height: 1.1; margin-bottom: 2px; }
  .rb-room-desc { font-size: 12px; color: #555; margin-bottom: 10px; }

  .rb-team-bubbles { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .rb-team-bubble { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 9px; letter-spacing: .5px; flex-shrink: 0; cursor: default; }

  .rb-join-btn {
    width: 100%; padding: 13px; background: ${GOLD}; border: none; border-radius: 10px;
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 2px; color: #000;
    cursor: pointer; transition: filter .18s, transform .12s; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .rb-join-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .rb-join-btn:active { transform: scale(.97); }
  .rb-join-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }

  .rb-spectate-btn {
    width: 100%; padding: 11px; background: transparent; border: 1px solid #282828; border-radius: 10px;
    font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 1px; color: #888;
    cursor: pointer; transition: all .18s; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .rb-spectate-btn:hover { border-color: #555; color: #ccc; }

  .rb-empty { text-align: center; padding: 60px 20px; color: #666; font-size: 14px; letter-spacing: 1px; }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

  /* ── Join row ── */
  .rp-join-row { display:flex; gap:10px; margin-top:5px; align-items:flex-start; }
  .rp-join-row .rp-input { flex:1; min-width:0; }
  .rp-join-row .rp-btn   { width:auto; padding:15px 24px; margin-top:0; font-size:1.4rem; flex-shrink:0; }

  /* ── LOBBY ── 3-column layout ── */
  .lobby-shell {
    min-height:100vh; padding-top:60px; padding-bottom:80px;
    display:grid; grid-template-columns:280px 1fr 260px; gap:0;
    align-items:start; background:${BG};
  }
  @media(max-width:1100px){ .lobby-shell{grid-template-columns:240px 1fr 220px} }
  @media(max-width:900px){  .lobby-shell{grid-template-columns:1fr; padding:60px 14px 88px} }

  .lobby-col { padding:24px; height:100%; }
  .lobby-col-left  { border-right:1px solid #111; }
  .lobby-col-right { border-left:1px solid #111; }
  .lobby-col-center { padding:24px 20px; }

  .lobby-section-label { font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:3px; color:#888; text-transform:uppercase; margin-bottom:12px; }

  /* ── Code block ── */
  .lobby-code-chip { font-family:'Bebas Neue',sans-serif; font-size:2.4rem; letter-spacing:.28em; color:${CYAN}; background:rgba(34,211,238,.06); border:1px solid rgba(34,211,238,.2); padding:8px 18px; border-radius:8px; cursor:pointer; transition:background .2s,box-shadow .2s; display:inline-block; }
  .lobby-code-chip:hover { background:rgba(34,211,238,.12); box-shadow:0 0 16px rgba(34,211,238,.2); }
  .lobby-copy-btn { padding:9px 16px; background:rgba(34,211,238,.1); border:1px solid rgba(34,211,238,.3); border-radius:6px; color:${CYAN}; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; letter-spacing:.1em; cursor:pointer; transition:all .2s; }
  .lobby-copy-btn:hover { background:${CYAN}; color:#000; }
  .lobby-wa-btn { padding:9px 16px; background:rgba(37,211,102,.1); border:1px solid rgba(37,211,102,.3); border-radius:6px; color:#25D366; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; letter-spacing:.1em; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
  .lobby-wa-btn:hover { background:#25D366; color:#000; }

  /* ── Player list ── */
  .lobby-player-row { display:flex; align-items:center; gap:10px; padding:10px 12px; background:${CARD}; border:1px solid #181818; border-radius:8px; margin-bottom:6px; animation:slideIn .3s ease both; }
  .lobby-player-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .lobby-player-badge { font-family:'Bebas Neue',sans-serif; font-size:.8rem; padding:2px 6px; border-radius:3px; letter-spacing:.05em; }

  /* ── Franchise grid ── */
  .franchise-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
  @media(max-width:900px){ .franchise-grid{ grid-template-columns:repeat(5,1fr) } }
  @media(max-width:560px){ .franchise-grid{ grid-template-columns:repeat(3,1fr) } }

  .franchise-tile {
    border-radius:10px; border:2px solid #1c1c1c; cursor:pointer; padding:16px 8px;
    text-align:center; position:relative; overflow:hidden;
    transition:transform .2s, border-color .2s, box-shadow .2s;
    display:flex; flex-direction:column; align-items:center; gap:5px;
  }
  .franchise-tile:not(.ft-taken):hover { transform:translateY(-6px); }
  .franchise-tile.ft-mine  { transform:translateY(-4px); }
  .franchise-tile.ft-taken { cursor:not-allowed; opacity:.5; filter:grayscale(0.8) brightness(0.7); }
  .franchise-tile .taken-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.4);
    z-index:2;
  }

  .franchise-short { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:.04em; }
  .franchise-name  { font-family:'Courier Prime',monospace; font-size:7px; line-height:1.3; color:#94A3B8; }
  .franchise-mine-badge { font-family:'Courier Prime',monospace; font-size:8px; letter-spacing:1px; font-weight:700; }

  /* ── RIGHT col stats ── */
  .lobby-stat-card { background:${CARD}; border:1px solid #181818; border-radius:10px; padding:16px; margin-bottom:10px; }
  .lobby-stat-val  { font-family:'Bebas Neue',sans-serif; font-size:1.8rem; letter-spacing:.05em; line-height:1; }
  .lobby-stat-lbl  { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:2px; color:#888; margin-top:3px; }

  /* ── Fixed bottom start bar ── */
  .lobby-bottom-bar {
    position:fixed; bottom:0; left:0; right:0; z-index:50;
    background:${BG}f0; border-top:1px solid #111; backdrop-filter:blur(12px);
    padding:12px 24px; display:flex; align-items:center; justify-content:center; gap:16px;
  }
  .lobby-start-btn {
    padding:14px 48px; border:none; border-radius:6px; font-family:'Bebas Neue',sans-serif;
    font-size:1.3rem; letter-spacing:.1em; cursor:pointer; color:#000; background:${GOLD};
    transition:transform .2s, box-shadow .2s; min-width:240px;
  }
  .lobby-start-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,184,75,.4); }
  .lobby-start-btn:disabled { opacity:.4; cursor:not-allowed; }
  .lobby-waiting { font-family:'Courier Prime',monospace; font-size:13px; color:#888; letter-spacing:.1em; text-align:center; padding:14px 32px; border:1px dashed #222; border-radius:6px; animation:pulse 2.5s ease-in-out infinite; }

  /* ── Marquee ── */
  .rp-marquee-container { position:fixed; bottom:0; left:0; width:100%; overflow:hidden; background:#000; border-top:1px solid #0d0d0d; z-index:10; padding:6px 0; }
  .rp-marquee-track { display:flex; white-space:nowrap; width:max-content; animation:scrollMq 30s linear infinite; }
  .rp-marquee-item { font-family:'Bebas Neue',sans-serif; font-size:1.3rem; color:#1a1a1a; margin:0 36px; letter-spacing:4px; }

  @media(max-width:600px){
    .rp-h1 { font-size:3rem; }
    .lobby-section-label { font-size:9px; }
    .franchise-grid { gap:6px; }
    .franchise-tile { padding:12px 4px; }
    .franchise-short { font-size:1.1rem; }
    .lobby-bottom-bar { padding:10px 14px; }
    .lobby-start-btn { padding:12px 20px; min-width:0; font-size:1.1rem; width:100%; }
    .lobby-waiting { padding:12px 14px; font-size:11px; width:100%; }
  }
`;

// ─── Check icon ─────────────────────────────────────────────────────────────
function CheckIcon({ color = GOLD }) {
  return (
    <div style={{ width:16, height:16, borderRadius:'50%', background:`${color}25`, border:`1px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>
      ✓
    </div>
  );
}

// ─── Toggle Card ────────────────────────────────────────────────────────────
function ToggleCard({ selected, onSelect, accentColor = GOLD, title, sub, icon }) {
  const cls = selected ? (accentColor === CYAN ? 'rp-toggle-card selected-cyan' : 'rp-toggle-card selected-gold') : 'rp-toggle-card';
  return (
    <div className={cls} onClick={onSelect}>
      <div className="rp-toggle-check">
        {selected && <CheckIcon color={accentColor} />}
      </div>
      {icon && <div style={{ marginBottom: 6, opacity: selected ? 1 : 0.4, transition: 'opacity 0.2s', color: selected ? accentColor : '#666' }}>{icon}</div>}
      <div className="rp-toggle-card-title" style={{ color: selected ? accentColor : '#bbb' }}>{title}</div>
      <div className="rp-toggle-card-sub">{sub}</div>
    </div>
  );
}

// ─── BrowseRooms ─────────────────────────────────────────────────────────────
const TEAM_COLORS = {
  CSK:'#F9CA24', MI:'#4FC3F7', RCB:'#FF5252', KKR:'#CE93D8',
  SRH:'#FF8A65', DC:'#64B5F6', PBKS:'#EF9A9A', RR:'#F48FB1',
  GT:'#4DD0E1', LSG:'#81D4FA',
};
const ALL_TEAM_IDS = ['MI','CSK','RCB','KKR','DC','PBKS','RR','SRH','GT','LSG'];

function BrowseRooms({ name, setName, nameRef, serverRooms, completedRooms, fetchRooms, loading, error, doJoin, onViewCompleted, liveStats, onBack, onCreate, TEAMS, GOLD, CYAN }) {
  const [activeTab, setActiveTab] = useState('waiting'); // Show joinable rooms first!

  // Filter logic
  const liveRooms    = serverRooms.filter(r => r.status === 'active');
  const waitingRooms = serverRooms.filter(r => r.status === 'lobby');
  const archivedRooms = completedRooms || [];
  const displayRooms = activeTab === 'live'
    ? liveRooms
    : activeTab === 'completed'
      ? archivedRooms
      : waitingRooms;

  return (
    <div className="rb-shell" style={{ position: 'relative', zIndex: 5, animation: 'fadeIn .4s ease' }}>
      {/* ── Header ── */}
      <div className="rb-header" style={{ borderBottom: '1px solid #111', background: '#0a0a0aee', backdropFilter: 'blur(12px)', padding: '16px 24px 0' }}>
        <div className="rb-header-row" style={{ marginBottom: 16 }}>
          <button className="rb-back-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
            <span style={{ fontSize: 18 }}>←</span> BACK
          </button>
          <div className="rb-title-block">
            <div className="rb-title" style={{ fontSize: 26, letterSpacing: 2 }}>BROWSING <span style={{ color: GOLD }}>ROOMS</span></div>
            <div className="rb-subtitle" style={{ fontSize: 10, letterSpacing: 2, color: '#444' }}>{liveStats.rooms} PUBLIC LOBBIES ACTIVE</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="rb-icon-btn" onClick={fetchRooms} title="Refresh" style={{ background: '#111' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
            <button className="rb-create-btn" onClick={onCreate} style={{ height: 36, padding: '0 18px' }}>
              NEW ROOM
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="rb-tabs" style={{ marginBottom: 0, border: 'none' }}>
          <button className={`rb-tab${activeTab === 'waiting' ? ' active' : ''}`} 
            onClick={() => setActiveTab('waiting')}
            style={{ paddingBottom: 14 }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 1 }}>JOINABLE</span>
            <span className="rb-tab-count" style={{ marginLeft: 6 }}>{waitingRooms.length}</span>
          </button>
          <button className={`rb-tab live-tab${activeTab === 'live' ? ' active' : ''}`} 
            onClick={() => setActiveTab('live')}
            style={{ paddingBottom: 14 }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 1 }}>IN PROGRESS</span>
            <span className="rb-tab-count" style={{ marginLeft: 6, background: '#ef444422', color: '#ef4444' }}>{liveRooms.length}</span>
          </button>
          <button className={`rb-tab${activeTab === 'completed' ? ' active' : ''}`} 
            onClick={() => setActiveTab('completed')}
            style={{ paddingBottom: 14 }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 1 }}>COMPLETED ROOMS</span>
            <span className="rb-tab-count" style={{ marginLeft: 6, background: '#22c55e22', color: '#22c55e' }}>{archivedRooms.length}</span>
          </button>
        </div>
      </div>

      {/* ── Name input ── */}
      <div className="rb-name-box" style={{ background: '#0d0d0d', borderBottom: '1px solid #111', padding: '24px 32px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <label className="rb-name-label" style={{ color: '#555', fontSize: 9 }}>YOUR IDENTITY</label>
          <input
            ref={nameRef}
            className="rb-name-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What should we call you?"
            style={{ background: '#080808', padding: '16px 20px', fontSize: 18, borderRadius: 8 }}
          />
          {error && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 8, letterSpacing: 1, paddingLeft: 4 }}>⚠️ {error}</div>}
        </div>
      </div>

      {/* ── Rooms list ── */}
      <div className="rb-rooms-list" style={{ padding: '32px 32px 60px', background: '#080808' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {displayRooms.length === 0 ? (
            <div className="rb-empty" style={{ padding: '80px 20px', border: '1px dashed #222', borderRadius: 20 }}>
               <div style={{ fontSize: 40, marginBottom: 16 }}>{activeTab === 'live' ? '🍿' : activeTab === 'completed' ? '🏁' : '🏟️'}</div>
               <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 2, color: '#444' }}>
                {activeTab === 'live' ? 'NO LIVE MATCHES' : activeTab === 'completed' ? 'NO COMPLETED ROOMS YET' : 'NO PUBLIC LOBBIES'}
               </div>
               <div style={{ fontSize: 11, color: '#222', marginTop: 8, letterSpacing: 2 }}>
                {activeTab === 'completed' ? 'FINISHED PUBLIC AUCTIONS STAY HERE FOR 48 HOURS' : 'BE THE FIRST TO START THE EXCITEMENT'}
               </div>
               {activeTab !== 'completed' && (
                 <button className="rp-btn" onClick={onCreate} style={{ maxWidth: 200, margin: '24px auto 0', height: 44, fontSize: 16 }}>
                  CREATE LOBBY
                 </button>
               )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {displayRooms.map((room, i) => {
                const isActive = room.status === 'active';
                const isCompleted = room.status === 'finished';
                const teamCount = room.players || 0;
                
                return (
                  <div key={i} className="rb-room-card" 
                    style={{ 
                      animation: `fadeUp .4s ease ${i * 0.05}s both`,
                      background: '#0d0d0d',
                      border: '1px solid #1a1a1a',
                      borderRadius: 16,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 180
                    }}>
                    
                    <div className="rb-room-card-header" style={{ marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className={`rb-status-dot ${isActive ? 'live' : 'waiting'}`} />
                          <div className="rb-room-code" style={{ fontSize: 12, color: GOLD, background: `${GOLD}11`, padding: '2px 8px', borderRadius: 4 }}>{room.code}</div>
                        <div style={{ fontSize: 9, color: '#444', letterSpacing: 1, textTransform: 'uppercase' }}>{(room.mode || 'MEGA').toUpperCase()}</div>
                        {isCompleted && <div style={{ fontSize: 9, color: '#22c55e', letterSpacing: 1, textTransform: 'uppercase' }}>RESULTS READY</div>}
                        </div>
                        <div className="rb-room-name" style={{ fontSize: 28, letterSpacing: 1 }}>{room.name || 'Mega Auction'}</div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div className="rb-team-count" style={{ color: teamCount >= 10 ? '#ef4444' : '#fff' }}>{teamCount}<span>/10</span></div>
                        <div className="rb-team-label" style={{ fontSize: 8 }}>PARTICIPANTS</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                       <div style={{ fontSize: 11, color: '#555', letterSpacing: 1 }}>
                          {isCompleted
                            ? <>Finished {room.finishedAt ? new Date(room.finishedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'recently'}</>
                            : <>Hosted by <span style={{ color: '#888', fontWeight: 700 }}>{room.host}</span></>
                          }
                       </div>
                       <button 
                        className="rb-join-btn" 
                        onClick={() => isCompleted ? onViewCompleted(room) : doJoin(room.code)}
                        style={{ width: 'auto', padding: '10px 24px', borderRadius: 8, background: isCompleted ? '#22c55e18' : isActive ? '#22D3EE15' : GOLD, color: isCompleted ? '#22c55e' : isActive ? '#22D3EE' : '#000', border: isCompleted ? '1px solid #22c55e40' : isActive ? '1px solid #22D3EE40' : 'none' }}>
                        {isCompleted ? 'VIEW RESULTS' : isActive ? 'JOIN LIVE ROOM' : 'JOIN LOBBY'}
                      </button>
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

// ─── Main RoomContent ────────────────────────────────────────────────────────
function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const {
    emit, on, playerId,
    roomCode, setRoomCode, lobbyPlayers, setLobbyPlayers,
    isHost, setIsHost, myName, setMyName, setPlayMode,
    lobbyMode, setLobbyMode, multiGS, setMultiGS, startMultiAuction, isSpectator, setIsSpectator,
  } = useGame();

  const [phase,       setPhase]       = useState('home');
  const [name,        setName]        = useState('');
  const [isPrivate,   setIsPrivate]   = useState(false);
  const [joinCode,    setJoinCode]    = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [aMode,       setAMode]       = useState('mega');
  const [serverRooms, setServerRooms] = useState([]);
  const [completedRooms, setCompletedRooms] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [liveStats,   setLiveStats]   = useState({ rooms: 0, players: 0 });
  const [dialog,      setDialog]      = useState(null);
  const nameRef = useRef(null);
  const closeDialog = useCallback(() => setDialog(null), []);

  // ── Restore name from localStorage ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ipl_player_name');
      if (saved) setName(saved);
      const savedRecent = JSON.parse(localStorage.getItem('ipl_recent_rooms') || '[]');
      setRecentRooms(savedRecent);
    }
  }, []);

  // ── Persist name whenever it changes ──
  useEffect(() => {
    if (name.trim() && typeof window !== 'undefined') {
      localStorage.setItem('ipl_player_name', name.trim());
    }
  }, [name]);

  // ── Auto-focus name input ──
  useEffect(() => {
    if (phase === 'join' || phase === 'join-code' || phase === 'create-form') nameRef.current?.focus();
  }, [phase]);

  // ── URL action param ──
  useEffect(() => {
    if (action === 'create') setPhase('create-form');
    if (action === 'join' || action === 'join-code') setPhase('join-code');
    if (action === 'browse') setPhase('join');
  }, [action]);

  // ── Fetch public rooms ──
  const fetchRooms = useCallback(() => {
    emit('get-rooms', (data) => {
      console.log("[SOCKET] Received Rooms:", data);
      setServerRooms(data?.active || []);
      setCompletedRooms(data?.completed || []);
      setLiveStats({ rooms: data?.totalRooms || 0, players: data?.totalPlayers || 0 });
    });
  }, [emit]);

  useEffect(() => {
    if (phase === 'home' || phase === 'join') {
      fetchRooms();
      const t = setInterval(fetchRooms, 8000);
      const off = on('public-rooms-updated', fetchRooms);
      return () => {
        clearInterval(t);
        if (off) off();
      };
    }
  }, [phase, fetchRooms, on]);

  // ── Helpers ──
  const saveRecentRoom = (code, roomName) => {
    if (typeof window === 'undefined') return;
    try {
      let recents = JSON.parse(localStorage.getItem('ipl_recent_rooms') || '[]');
      recents = [{ code, name: roomName }, ...recents.filter(r => r.code !== code)].slice(0, 3);
      localStorage.setItem('ipl_recent_rooms', JSON.stringify(recents));
      setRecentRooms(recents);
    } catch(e) {}
  };

  const viewCompletedRoom = useCallback((room) => {
    if (!room?.code) return;
    const params = new URLSearchParams({ room: room.code });
    if (room.mode) params.set('mode', room.mode);
    params.set('completed', '1');
    router.push(`/results?${params.toString()}`);
  }, [router]);

  // ── Handlers ──
  const handleCreate = () => {
    if (!name.trim()) { setError('Enter your name first'); return; }
    setLoading(true); setError('');
    const roomName = `${name.trim()}'s Room`;
    emit('create-room', { playerName: name.trim(), isPrivate, roomName, playerId }, (res) => {
      setLoading(false);
      if (!res?.ok) { setError(res?.error || 'Failed to create room'); return; }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ipl_room_code',   res.code);
        localStorage.setItem('ipl_player_name', name.trim());
        localStorage.setItem('ipl_play_mode',   'multi');
      }
      saveRecentRoom(res.code, roomName);
      setRoomCode(res.code);
      setIsHost(true);
      setMyName(name.trim());
      setLobbyPlayers(res.players || []);
      setPlayMode('multi');
      setIsSpectator(false);
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
      if (!res?.ok) {
        setError(res?.error === 'Room not found' ? 'Room not found or already expired.' : (res?.error || 'Room not found'));
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ipl_room_code',   code);
        localStorage.setItem('ipl_player_name', name.trim());
        localStorage.setItem('ipl_play_mode',   'multi');
      }
      const hostP   = (res.players || []).find(p => p.id === res.hostId);
      const roomName = hostP ? `${hostP.name}'s Room` : `Room ${code}`;
      saveRecentRoom(res.code || code, roomName);
      setRoomCode(res.code || code);
      setIsHost(res.hostId === playerId);
      setMyName(name.trim());
      setLobbyPlayers(res.players || []);
      setPlayMode('multi');
      setIsSpectator(!!res.isSpectator);
      if (res.auctionMode) { setLobbyMode(res.auctionMode); setAMode(res.auctionMode); }
      if (res.roomStatus === 'active') {
        setMultiGS(res.gameState);
        const myP = (res.players || []).find(p => p.id === playerId);
        if (res.isSpectator || (myP && myP.teamId)) {
          router.push(`/auction?room=${code}${res.auctionMode ? `&mode=${res.auctionMode}` : ''}${res.isSpectator ? '&spectator=1' : ''}`);
        } else {
          setPhase('lobby'); // Participant but no team -> pick one first
        }
      } else if (res.roomStatus === 'finished') {
        setMultiGS(res.gameState); router.push(`/results?room=${code}${res.auctionMode ? `&mode=${res.auctionMode}` : ''}`);
      } else { setPhase('lobby'); }
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
    const activePlayers = lobbyPlayers.filter(p => !p.isSpectator && !p.offline);
    if (activePlayers.length < 2) {
      setDialog({
        title: 'More Players Needed',
        message: 'At least 2 active players must join the room before the auction can start.',
        tone: 'info',
        actions: [{ label: 'OK', onClick: closeDialog }],
      });
      return;
    }

    startMultiAuction({
      onError: (message) => {
        setDialog({
          title: 'Cannot Start Auction',
          message,
          tone: 'info',
          actions: [{ label: 'OK', onClick: closeDialog }],
        });
      },
    });
  };

  const shareUrl  = typeof window !== 'undefined' ? `${window.location.origin}/join/${roomCode}` : '';
  const copyCode  = () => { navigator.clipboard.writeText(roomCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); };
  const copyUrl   = () => { navigator.clipboard.writeText(shareUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };
  const myTeamId  = lobbyPlayers.find(p => p.name === myName)?.teamId;
  const takenMap  = Object.fromEntries(
    lobbyPlayers.filter(p => p.teamId).map(p => [p.teamId, p.name])
  );
  const canStart  = isHost && lobbyPlayers.length >= 1 && !!aMode;

  return (
    <>
      <style>{globalStyles}</style>
      <AppDialog
        isOpen={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        tone={dialog?.tone}
        actions={dialog?.actions || []}
        onClose={closeDialog}
      />

      {/* Particles */}
      <div className="rp-particles">
        {['p1','p2','p3','p4','p5'].map(c => <div key={c} className={`particle ${c}`} />)}
      </div>

      {/* ── Navbar — hidden in join phase (BrowseRooms has its own header) ── */}
      {phase !== 'join' && (
        <nav className="rp-nav">
          <button className="rp-back" onClick={() => {
            if (phase === 'lobby' || phase === 'create-form') setPhase('home');
            else router.push('/');
          }}>← Back</button>
          <div className="rp-brand">IPL <span>AUCTION ONLINE</span></div>
        </nav>
      )}

      {/* ══════════ HOME ══════════ */}
      {phase === 'home' && (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 24px 60px', position:'relative', zIndex:5 }}>
          <div style={{ width:'100%', maxWidth:780, animation:'fadeUp .4s ease both' }}>
            <span className="rp-eyebrow">Multiplayer</span>
            <h1 className="rp-h1">JOIN THE<br /><span>AUCTION ROOM</span></h1>
            <div className="rp-live-counter">
              <div className="rp-live-dot" />
              {liveStats.rooms > 0
                ? `${liveStats.rooms} ROOM${liveStats.rooms !== 1 ? 'S' : ''} ACTIVE • ${liveStats.players} PLAYER${liveStats.players !== 1 ? 'S' : ''} ONLINE`
                : 'NO ACTIVE ROOMS — CREATE ONE!'}
            </div>

            <div className="rp-choices">
              <div className="rp-choice create-card" onClick={() => { setError(''); setPhase('create-form'); }}>
                <div className="rp-choice-label" style={{ color: GOLD }}>HOST</div>
                <div className="rp-choice-title">CREATE ROOM</div>
                <div className="rp-choice-desc">Set up a private or public room. Invite friends with a code.</div>
              </div>
              <div className="rp-choice join-card" onClick={() => { setError(''); setPhase('join-code'); }}>
                <div className="rp-choice-label" style={{ color: CYAN }}>PLAYER</div>
                <div className="rp-choice-title">JOIN ROOM</div>
                <div className="rp-choice-desc">Enter a private room code to join an ongoing auction.</div>
              </div>
              <div className="rp-choice browse-card" onClick={() => { setError(''); setPhase('join'); }} style={{ position: 'relative' }}>
                <div className="rp-choice-label" style={{ color: '#818cf8' }}>EXPLORE</div>
                <div className="rp-choice-title">BROWSE ROOMS</div>
                {liveStats.rooms > 0 && (
                   <div style={{ position: 'absolute', top: -8, right: -8, background: '#818cf8', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, boxShadow: '0 4px 12px rgba(129, 140, 248, 0.4)', animation: 'pulse 2s infinite' }}>
                    {liveStats.rooms} Lobbies
                   </div>
                )}
                <div className="rp-choice-desc">Pick from active public lobbies to spectate or play.</div>
              </div>
            </div>

            {/* Public lobbies preview */}
            {serverRooms.length > 0 && (
              <div style={{ marginTop:28 }}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:3, color:'#888', textTransform:'uppercase', marginBottom:10, borderBottom:'1px solid #111', paddingBottom:8 }}>PUBLIC LOBBIES</div>
                {serverRooms.slice(0,3).map((r, i) => (
                  <div key={i} className="rp-room-item">
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:16, color:'#eee' }}>{r.name}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:'#94A3B8', marginTop:2 }}>Host: {r.host} · {r.players}/10</div>
                    </div>
                    <button className="rp-room-join-btn" onClick={() => { setJoinCode(r.code); setPhase('join-code'); }}>QUICK JOIN</button>
                  </div>
                ))}
              </div>
            )}

            {/* Recent rooms */}
            {recentRooms.length > 0 && (
              <div style={{ marginTop:24 }}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:3, color:'#888', textTransform:'uppercase', marginBottom:10, borderBottom:'1px solid #111', paddingBottom:8 }}>RECENT ROOMS</div>
                {recentRooms.map((r, i) => (
                  <div key={i} className="rp-room-item">
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:16, color:'#aaa' }}>{r.name}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:'#94A3B8', marginTop:2 }}>Code: {r.code}</div>
                    </div>
                    <button className="rp-room-rejoin-btn" onClick={() => { setJoinCode(r.code); setPhase('join-code'); }}>REJOIN</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ CREATE FORM ══════════ */}
      {phase === 'create-form' && (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 24px 40px', position:'relative', zIndex:5 }}>
          <div style={{ width:'100%', maxWidth:480, animation:'fadeUp .35s ease both' }}>
            <span className="rp-eyebrow">Create Room</span>
            <h1 className="rp-h1" style={{ fontSize:'clamp(2rem,7vw,3.8rem)', marginBottom:4 }}>SET UP YOUR<br /><span>ROOM</span></h1>
            <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:'#94A3B8', margin:'8px 0 4px', lineHeight:1.6 }}>Configure your auction room and invite up to 10 friends.</p>

            <label className="rp-label">Your Name</label>
            <input
              ref={nameRef}
              className="rp-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul"
              maxLength={20}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />

            <label className="rp-label">Visibility</label>
            <div className="rp-toggle-grid">
              <ToggleCard
                selected={!isPrivate} onSelect={() => setIsPrivate(false)}
                accentColor={GOLD} title="PUBLIC" sub="Open to all players" 
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} 
              />
              <ToggleCard
                selected={isPrivate} onSelect={() => setIsPrivate(true)}
                accentColor={GOLD} title="PRIVATE" sub="Invite code only" 
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} 
              />
            </div>

            <label className="rp-label">Auction Mode</label>
            <div className="rp-toggle-grid">
              <ToggleCard
                selected={aMode === 'mega'} onSelect={() => setAMode('mega')}
                accentColor={GOLD} title="MEGA" sub="500+ players · Full season" />
              <ToggleCard
                selected={aMode === 'mini'} onSelect={() => setAMode('mini')}
                accentColor={CYAN} title="MINI" sub="~200 players · Fast format" />
            </div>

            {error && <div className="rp-error">{error}</div>}
            <button className="rp-btn" onClick={handleCreate} disabled={loading}>
              {loading ? 'CREATING ROOM…' : 'CREATE ROOM →'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ JOIN WITH CODE ══════════ */}
      {phase === 'join-code' && (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 24px 40px', position:'relative', zIndex:5 }}>
          <div style={{ width:'100%', maxWidth:480, animation:'fadeUp .35s ease both' }}>
            <span className="rp-eyebrow">Private Room</span>
            <h1 className="rp-h1" style={{ fontSize:'clamp(2rem,7vw,3.8rem)', marginBottom:4 }}>JOIN WITH<br /><span>CODE</span></h1>
            
            <label className="rp-label">Your Name</label>
            <input
              ref={nameRef}
              className="rp-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul"
              maxLength={20}
            />

            <label className="rp-label">Room Code</label>
            <input
              className="rp-input code-input"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. X9QWL"
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && doJoin(joinCode)}
            />

            {error && <div className="rp-error">{error}</div>}
            <button className="rp-btn cyan-btn" onClick={() => doJoin(joinCode)} disabled={loading}>
              {loading ? 'JOINING…' : 'JOIN ROOM →'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ JOIN — Browse Live Auction Rooms ══════════ */}
      {phase === 'join' && (
        <BrowseRooms
          name={name}
          setName={setName}
          nameRef={nameRef}
          serverRooms={serverRooms}
          completedRooms={completedRooms}
          fetchRooms={fetchRooms}
          loading={loading}
          error={error}
          doJoin={doJoin}
          onViewCompleted={viewCompletedRoom}
          liveStats={liveStats}
          onBack={() => setPhase('home')}
          onCreate={() => setPhase('create-form')}
          TEAMS={TEAMS}
          GOLD={GOLD}
          CYAN={CYAN}
        />
      )}

      {/* ══════════ LOBBY ══════════ */}
      {phase === 'lobby' && roomCode && (
        <div className="lobby-shell" style={{ position:'relative', zIndex:5 }}>

          {/* ── LEFT: Code + Players ── */}
          <div className="lobby-col lobby-col-left">
            <div style={{ animation:'fadeUp .35s ease both' }}>
              {/* Room code */}
              <div className="lobby-section-label">ROOM CODE</div>
              <div style={{ marginBottom:10 }}>
                <div className="lobby-code-chip" onClick={copyCode} title="Click to copy code">{roomCode}</div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                <button className="lobby-copy-btn" onClick={copyCode}>{copiedCode ? '✓ COPIED' : 'COPY CODE'}</button>
                <button className="lobby-copy-btn" onClick={copyUrl}>{copiedLink ? '✓ COPIED' : 'COPY LINK'}</button>
                <a className="lobby-wa-btn"
                   href={`https://wa.me/?text=${encodeURIComponent(`Join my IPL Auction! 🏏\n\nLink: ${shareUrl}\nCode: ${roomCode}`)}`}
                   target="_blank" rel="noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 2 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg> SHARE
                </a>
              </div>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:'#666', wordBreak:'break-all', marginBottom:20 }}>{shareUrl}</div>

              <div className="rp-hr" />

              {/* Auction mode */}
              {isHost ? (
                <>
                  <div className="lobby-section-label">AUCTION MODE</div>
                  <div className="rp-toggle-grid" style={{ marginBottom:20 }}>
                    <ToggleCard selected={aMode==='mega'} onSelect={() => changeMode('mega')} accentColor={GOLD} title="MEGA" sub="500+ players" />
                    <ToggleCard selected={aMode==='mini'} onSelect={() => changeMode('mini')} accentColor={CYAN} title="MINI" sub="~200 players" />
                  </div>
                </>
              ) : (
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, color:'#888', marginBottom:16 }}>
                  Mode: <span style={{ color: (lobbyMode || aMode) === 'mega' ? GOLD : CYAN }}>{(lobbyMode || aMode || 'mega').toUpperCase()} AUCTION</span>
                </div>
              )}

              <div className="rp-hr" />

              {/* Players */}
              <div className="lobby-section-label">PLAYERS ({lobbyPlayers.length}/10)</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {lobbyPlayers.map((p, i) => {
                  const team = TEAMS.find(t => t.id === p.teamId);
                  return (
                    <div key={p.id || i} className="lobby-player-row" style={{ animationDelay:`${i * 0.04}s` }}>
                      <div className="lobby-player-dot" style={{ background: team?.color || '#333' }} />
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color: team?.color || '#ddd', flex:1, letterSpacing:'.04em' }}>
                        {p.name}
                        {p.isHost && <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:GOLD, marginLeft:6, letterSpacing:'2px' }}>HOST</span>}
                      </span>
                      {team && (
                        <span className="lobby-player-badge" style={{ background:`${team.color}18`, color:team.color, border:`1px solid ${team.color}50` }}>
                          {team.short}
                        </span>
                      )}
                    </div>
                  );
                })}
                {/* Placeholder slots */}
                {Array.from({ length: Math.max(0, 1 - lobbyPlayers.length) }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ padding:'10px 12px', border:'1px dashed #111', borderRadius:8, height:42 }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER: Franchise grid ── */}
          <div className="lobby-col lobby-col-center">
            <div style={{ animation:'fadeUp .4s ease both' }}>
              <div style={{ marginBottom:4 }}>
                <span className="rp-eyebrow" style={{ fontSize:10 }}>Lobby · {roomCode}</span>
              </div>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.6rem,4vw,2.8rem)', color:'#fff', letterSpacing:2, marginBottom:6 }}>
                PICK YOUR <span style={{ color:GOLD }}>FRANCHISE</span>
              </h2>
              <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:'#888', marginBottom:24, lineHeight:1.6 }}>
                Select the IPL team you want to bid for. Each franchise can only be claimed by one player.
                {myTeamId && <span style={{ color:GOLD }}> You picked <strong>{TEAMS.find(t=>t.id===myTeamId)?.name}</strong>.</span>}
              </p>

              <div className="franchise-grid">
                {TEAMS.map(t => {
                  const isMine  = t.id === myTeamId;
                  const takenBy = takenMap[t.id];
                  const taken   = !!takenBy && !isMine;
                  let cls = 'franchise-tile';
                  if (isMine)  cls += ' ft-mine';
                  if (taken)   cls += ' ft-taken';

                  return (
                    <div
                      key={t.id}
                      className={cls}
                      style={{
                        borderColor: isMine ? t.color : taken ? '#1c1c1c' : '#242424',
                        background: isMine
                          ? `linear-gradient(160deg, ${t.color}18, ${t.color}08)`
                          : taken ? '#0a0a0a' : `${t.color}06`,
                        boxShadow: isMine ? `0 0 20px ${t.color}28, inset 0 0 20px ${t.color}08` : 'none',
                      }}
                      onClick={() => !taken && selectTeam(t.id)}
                    >
                      {/* TAKEN overlay */}
                      {taken && <div className="taken-overlay" />}

                      {/* Team color accent top bar */}
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background: isMine ? t.color : `${t.color}40`, borderRadius:'8px 8px 0 0' }} />

                      <div className="franchise-short" style={{ color: isMine ? t.color : taken ? '#333' : t.color }}>
                        {t.short}
                      </div>
                      <div className="franchise-name">{t.name}</div>

                      {isMine && (
                        <div className="franchise-mine-badge" style={{ color: t.color, marginTop:4 }}>
                          ✓ YOUR PICK
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && <div className="rp-error" style={{ marginTop:16 }}>{error}</div>}
            </div>
          </div>

          {/* ── RIGHT: Live stats ── */}
          <div className="lobby-col lobby-col-right">
            <div style={{ animation:'fadeUp .45s ease both' }}>
              <div className="lobby-section-label">LOBBY STATS</div>

              <div className="lobby-stat-card">
                <div className="lobby-stat-val" style={{ color:GOLD }}>
                  {lobbyPlayers.filter(p => p.teamId).length}/{lobbyPlayers.length}
                </div>
                <div className="lobby-stat-lbl">PLAYERS WITH TEAM</div>
              </div>

              <div className="lobby-stat-card">
                <div className="lobby-stat-val" style={{ color:CYAN }}>
                  {10 - lobbyPlayers.length}
                </div>
                <div className="lobby-stat-lbl">SLOTS REMAINING</div>
              </div>

              <div className="lobby-stat-card">
                <div className="lobby-stat-val" style={{ color:GREEN }}>
                  {lobbyPlayers.length >= 1 && lobbyPlayers.every(p => p.teamId) ? 'READY' : 'WAITING'}
                </div>
                <div className="lobby-stat-lbl">ROOM STATUS</div>
              </div>

              <div className="rp-hr" />

              {/* Claimed franchises summary */}
              <div className="lobby-section-label">CLAIMED FRANCHISES</div>
              {Object.entries(takenMap).length === 0 ? (
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:'#666', lineHeight:1.8 }}>
                  No franchise selected yet.<br />Be the first!
                </div>
              ) : (
                TEAMS.filter(t => takenMap[t.id]).map(t => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, padding:'8px 12px', background:`${t.color}08`, border:`1px solid ${t.color}25`, borderRadius:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:t.color, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', color:t.color, letterSpacing:1 }}>{t.short}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:'#888' }}>{takenMap[t.id]}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed bottom start bar (lobby only) ── */}
      {phase === 'lobby' && (
        <div className="lobby-bottom-bar">
          {isHost ? (
            <>
              <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:'#888', letterSpacing:2 }}>
                {multiGS ? 'Auction is ongoing' : (canStart ? 'Ready to go!' : 'Waiting for players…')}
              </span>
              <button
                className="lobby-start-btn"
                onClick={multiGS ? () => router.push(`/auction?room=${roomCode}`) : handleStart}
                disabled={!multiGS && !canStart}
              >
                {multiGS ? 'ENTER AUCTION →' : 'START AUCTION →'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center' }}>
               {!myTeamId ? (
                 <div className="lobby-waiting">⏳ Select your franchise to join the auction…</div>
               ) : (
                 <button
                   className="lobby-start-btn"
                   onClick={() => router.push(`/auction?room=${roomCode}${isSpectator?'&spectator=1':''}`)}
                 >
                   {multiGS ? 'ENTER AUCTION →' : 'WAITING FOR HOST…'}
                 </button>
               )}
            </div>
          )}
        </div>
      )}

      {/* Marquee - hidden during lobby to make room for bottom bar */}
      {phase !== 'lobby' && (
        <div className="rp-marquee-container">
          <div className="rp-marquee-track">
            {[...TEAMS, ...TEAMS].map((t, i) => (
              <span key={i} className="rp-marquee-item" style={{ color:t.color }}>{t.short}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div style={{ background:'#080808', height:'100vh' }} />}>
      <RoomContent />
    </Suspense>
  );
}
