"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLink from '../components/BrandLink';
import { SQUADS } from '../data/squads';

// Logo map — matches filenames in /public/assets
const TEAM_LOGOS = {
  CSK:  '/assets/CSK.png',
  MI:   '/assets/MI.png',
  RCB:  '/assets/RCB.png',
  KKR:  '/assets/KKR.png',
  SRH:  '/assets/SRH.png',
  DC:   '/assets/DC.png',
  PBKS: '/assets/PBKS.png',
  RR:   '/assets/RR.png',
  GT:   '/assets/GT.png',
  LSG:  '/assets/LSG.png',
};

export default function TeamsPage() {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    const syncSelectedTeamFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedTeamId = params.get('team');

      if (!requestedTeamId) {
        setSelectedTeam(null);
        return;
      }

      const matchedTeam = SQUADS.find((team) => team.id === requestedTeamId.toUpperCase()) || null;
      setSelectedTeam(matchedTeam);
    };

    syncSelectedTeamFromUrl();
    window.addEventListener('popstate', syncSelectedTeamFromUrl);

    return () => {
      window.removeEventListener('popstate', syncSelectedTeamFromUrl);
    };
  }, []);

  function openTeam(team) {
    setSelectedTeam(team);
    router.replace(`/teams?team=${encodeURIComponent(team.id)}`, { scroll: false });
  }

  function clearSelectedTeam() {
    setSelectedTeam(null);
    router.replace('/teams', { scroll: false });
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000', color: '#fff', fontFamily: "'Rajdhani', sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', gap: '18px', flexWrap: 'wrap' }}>
          <BrandLink compact={true} />
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)', margin: 0, letterSpacing: '4px', textAlign: 'center', flex: 1 }}>
            IPL 2026 <span style={{ color: '#E8B84B' }}>FRANCHISES</span>
          </h1>
          <button
            onClick={() => selectedTeam ? clearSelectedTeam() : router.push('/')}
            style={{ color: '#E8B84B', cursor: 'pointer', background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.25)', borderRadius: '999px', padding: '10px 16px', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}
            onMouseOver={e => e.target.style.color = '#fff'}
            onMouseOut={e => e.target.style.color = '#E8B84B'}
          >
            {selectedTeam ? 'All Franchises' : 'Back Home'}
          </button>
        </header>

        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .mobile-hide { display: none !important; }
            header { flex-direction: column; gap: 16px; text-align: center; }
            header button { order: 2; }
            header h1 { order: 1; margin-bottom: 8px; }
          }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}} />

        {selectedTeam ? (
          <TeamDetails team={selectedTeam} onBack={clearSelectedTeam} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {SQUADS.map(team => {
              const logo = TEAM_LOGOS[team.id];
              return (
                <div
                  key={team.id}
                  onClick={() => openTeam(team)}
                  style={{
                    backgroundColor: 'rgba(10, 14, 22, 0.82)',
                    border: `1px solid ${team.primaryColor}30`,
                    padding: '28px 24px',
                    borderRadius: '12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    cursor: 'pointer', transition: 'all 0.22s cubic-bezier(.175,.885,.32,1.275)',
                    position: 'relative', overflow: 'hidden',
                    background: `linear-gradient(160deg, ${team.primaryColor}12, rgba(10,14,22,0.92))`
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = team.primaryColor;
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = `0 12px 32px ${team.primaryColor}22`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = `${team.primaryColor}30`;
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top color bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: team.primaryColor }} />

                  {/* Logo */}
                  <div style={{ width: '100px', height: '100px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {logo ? (
                      <img
                        src={logo}
                        alt={team.id}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback circle */}
                    <div style={{
                      display: logo ? 'none' : 'flex',
                      width: '90px', height: '90px', borderRadius: '50%',
                      alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem',
                      backgroundColor: team.primaryColor, color: '#fff',
                    }}>{team.id}</div>
                  </div>

                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', margin: '0 0 10px 0', textAlign: 'center', color: '#fff', letterSpacing: '2px' }}>{team.name}</h2>
                  <div style={{ fontSize: '0.95rem', color: '#9ca3af', textAlign: 'center', marginBottom: '20px', lineHeight: 1.7 }}>
                    <p><span style={{ color: '#E8B84B' }}>Captain: </span>{team.captain}</p>
                    <p><span style={{ color: '#E8B84B' }}>Coach: </span>{team.coach}</p>
                  </div>
                  <button style={{
                    marginTop: 'auto', padding: '8px 28px',
                    border: `1px solid ${team.primaryColor}60`,
                    background: `${team.primaryColor}10`,
                    color: team.primaryColor, fontSize: '11px', letterSpacing: '2px',
                    textTransform: 'uppercase', cursor: 'pointer',
                    borderRadius: '4px', fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, transition: 'all .2s',
                  }}>
                    View Squad
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: '64px', padding: '24px 0', textAlign: 'center', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '1px', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto' }}>
            IPL Auction Online is a fan-made simulator for educational purposes. 
            Franchise data and player information are attributed up to <a href="https://www.iplt20.com" target="_blank" rel="noreferrer" style={{ color: '#E8B84B', textDecoration: 'none' }}>iplt20.com</a> & <a href="https://cricapi.com" target="_blank" rel="noreferrer" style={{ color: '#E8B84B', textDecoration: 'none' }}>CricAPI</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamDetails({ team, onBack }) {
  const logo = TEAM_LOGOS[team.id];
  return (
    <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '56px', alignItems: 'flex-start' }}>
        {/* Logo */}
        <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, filter: `drop-shadow(0 0 40px ${team.primaryColor}50)` }}>
          {logo ? (
            <img src={logo} alt={team.id} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '160px', height: '160px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: '4rem', backgroundColor: team.primaryColor, color: '#fff' }}>{team.id}</div>
          )}
        </div>

        <div style={{ flex: '1 1 280px' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', color: team.primaryColor, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>IPL 2026 Franchise</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem,6vw,5rem)', margin: '0 0 20px 0', color: team.primaryColor, lineHeight: 0.9 }}>
            {team.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[['Captain', team.captain], ['Head Coach', team.coach], ['Home Ground', team.home]].map(([label, val]) => (
              <div key={label} style={{ backgroundColor: 'rgba(12,16,24,0.9)', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', borderLeft: `3px solid ${team.primaryColor}` }}>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>{label}</span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: '#f3f4f6', letterSpacing: '0.4px', fontSize: '1rem' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <RoleSection title="Batters & WKs" players={team.batters} color={team.primaryColor} />
        <RoleSection title="All-Rounders" players={team.allRounders} color={team.primaryColor} />
        <RoleSection title="Bowlers" players={team.bowlers} color={team.primaryColor} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function RoleSection({ title, players, color }) {
  return (
    <div style={{ backgroundColor: 'rgba(10,14,22,0.88)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '10px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', backgroundColor: color }} />
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', margin: '0 0 20px 0', color: '#E8B84B', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {title}
        <span style={{ fontSize: '0.8rem', fontFamily: "'Barlow Condensed', sans-serif", color: '#6b7280', padding: '2px 8px', border: '1px solid #222', borderRadius: '12px' }}>{players.length}</span>
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {players.map(p => {
          const isWk = p.includes('(WK)');
          const name = p.replace('(WK)', '').trim();
          return (
            <li key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #141414', paddingBottom: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#d1d5db', fontFamily: "'Rajdhani', sans-serif", fontSize: '1rem', letterSpacing: '.3px' }}>{name}</span>
              {isWk && <span style={{ fontSize: '9px', color: '#000', backgroundColor: '#E8B84B', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold' }}>WK</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
