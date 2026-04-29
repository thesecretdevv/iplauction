'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BrandLink from '../components/BrandLink';
import { getBackendUrl } from '../lib/backendUrl';

const GOLD = '#E8B84B';
const CYAN = '#22D3EE';

const MONTH_LABELS = {
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
};

function formatDateLine(match) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(match.startAt));
}

function formatTimeLine(match) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(match.startAt));
}

function getMonthKey(match) {
  return String(match.date).slice(0, 7);
}

function getMatchState(match, nowMs) {
  const openMs = new Date(match.auctionOpensAt).getTime();
  const startMs = new Date(match.startAt).getTime();
  const endMs = new Date(match.endAt).getTime();
  if (nowMs >= endMs) return 'completed';
  if (nowMs >= startMs) return 'live';
  if (nowMs >= openMs) return 'auction open';
  return 'upcoming';
}

export default function SchedulePage() {
  const [matches, setMatches] = useState([]);
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    fetch(`${getBackendUrl()}/api/rivals/matches`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          const sorted = [...(data?.matches || [])].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
          setMatches(sorted);
        }
      })
      .catch(() => {
        if (!cancelled) setMatches([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedMatches = useMemo(() => {
    const groups = new Map();
    matches.forEach((match) => {
      const monthKey = getMonthKey(match);
      if (!groups.has(monthKey)) groups.set(monthKey, []);
      groups.get(monthKey).push(match);
    });
    return Array.from(groups.entries());
  }, [matches]);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#fff' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)', background: 'rgba(6,10,16,0.82)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BrandLink compact={true} />
            <div>
            <div style={{ color: GOLD, fontSize: 11, letterSpacing: 3, fontWeight: 800, marginBottom: 6 }}>IPL 2026</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 1.5 }}>FULL SCHEDULE</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/" style={{ border: '1px solid #272727', color: '#fff', textDecoration: 'none', borderRadius: 999, padding: '11px 16px', fontWeight: 800, letterSpacing: 1 }}>HOME</Link>
            <Link href="/how-to-play" style={{ border: '1px solid #272727', color: '#fff', textDecoration: 'none', borderRadius: 999, padding: '11px 16px', fontWeight: 800, letterSpacing: 1 }}>HOW TO PLAY</Link>
            <Link href="/room?action=browse" style={{ border: 'none', background: `linear-gradient(135deg, ${GOLD}, #c8921b)`, color: '#000', textDecoration: 'none', borderRadius: 999, padding: '11px 16px', fontWeight: 900, letterSpacing: 1 }}>LIVE AUCTIONS</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
          <div style={{ padding: '18px 18px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(160deg, rgba(232,184,75,0.18), rgba(11,14,21,0.94))' }}>
            <div style={{ color: '#8b8b8b', fontSize: 11, letterSpacing: 2 }}>SEASON WINDOW</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: GOLD }}>28 MAR - 24 MAY</div>
          </div>
          <div style={{ padding: '18px 18px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(160deg, rgba(34,211,238,0.18), rgba(11,14,21,0.94))' }}>
            <div style={{ color: '#8b8b8b', fontSize: 11, letterSpacing: 2 }}>TOTAL MATCHES</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: CYAN }}>{matches.length || 70}</div>
          </div>
          <div style={{ padding: '18px 18px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(11,14,21,0.94))' }}>
            <div style={{ color: '#8b8b8b', fontSize: 11, letterSpacing: 2 }}>MATCH WINDOWS</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32 }}>3:30 PM / 7:30 PM</div>
          </div>
        </div>

        {groupedMatches.map(([monthKey, monthMatches]) => (
          <section key={monthKey} style={{ marginBottom: 34 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 6, height: 42, borderRadius: 999, background: GOLD }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 1.4 }}>{MONTH_LABELS[monthKey] || monthKey}</div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {monthMatches.map((match) => {
                const state = getMatchState(match, nowMs);
                return (
                  <div key={match.key} style={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr) auto', gap: 18, alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,14,21,0.9)', borderRadius: 20, padding: '18px 18px', backdropFilter: 'blur(12px)' }}>
                    <div>
                      <div style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1 }}>#{match.matchNumber}</div>
                      <div style={{ color: '#7f8794', fontSize: 11, letterSpacing: 1.4 }}>MATCH</div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                        <img src={`/assets/${match.homeTeam}.png`} alt={match.homeTeam} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1.3 }}>{match.homeTeam}</div>
                        <div style={{ color: '#7f8794', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 3 }}>VS</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1.3 }}>{match.awayTeam}</div>
                        <img src={`/assets/${match.awayTeam}.png`} alt={match.awayTeam} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        {match.isHighProfile && <div style={{ fontSize: 10, letterSpacing: 2, color: GOLD, border: `1px solid ${GOLD}50`, background: `${GOLD}12`, borderRadius: 999, padding: '5px 9px' }}>HIGHLIGHT</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', color: '#a0a7b4', fontSize: 13, letterSpacing: 0.3 }}>
                        <span>{formatDateLine(match)}</span>
                        <span>{formatTimeLine(match)} IST</span>
                        <span>{match.venue}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, letterSpacing: 2, color: state === 'live' ? '#ef4444' : state === 'auction open' ? '#4ade80' : '#7f8794', fontWeight: 800, textTransform: 'uppercase' }}>
                        {state}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
