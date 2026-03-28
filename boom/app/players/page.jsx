"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import playersData from '../data/Players.json';
import PlayerFlipCard from '../components/PlayerFlipCard';

const ROLES = ['ALL', 'BAT', 'BOWL', 'WK', 'AR'];
const NATIONS = ['ALL', 'INDIAN', 'OVERSEAS'];

export default function PlayersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterNation, setFilterNation] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(24);
  
  const filteredPlayers = playersData.filter(p => {
    // 1. Search Query
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    
    // 2. Role Filter Matches
    let baseRole = 'AR';
    if (p.role === 'wicket_keeper') baseRole = 'WK';
    if (p.role === 'batsman') baseRole = 'BAT';
    if (p.role === 'bowler') baseRole = 'BOWL';

    const matchesRole = filterRole === 'ALL' || baseRole === filterRole;

    // 3. Nationality Matches
    const isIndian = p.country.toLowerCase() === 'india';
    const matchesNation = filterNation === 'ALL' || 
      (filterNation === 'INDIAN' && isIndian) || 
      (filterNation === 'OVERSEAS' && !isIndian);

    return matchesSearch && matchesRole && matchesNation;
  });

  const displayedPlayers = filteredPlayers.slice(0, visibleCount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080808', color: '#fff', fontFamily: "'Courier Prime', monospace", minHeight: '100vh', padding: '24px 5vw' }}>
      <div style={{ width: '100%', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #222', paddingBottom: '24px', gap: '24px' }}>
          <button 
            onClick={() => router.push('/')}
            style={{ color: '#E8B84B', cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px', textTransform: 'uppercase' }}
            onMouseOver={e => e.target.style.color = '#fff'}
            onMouseOut={e => e.target.style.color = '#E8B84B'}
          >
            ← BACK TO HOME
          </button>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.5rem', margin: 0, letterSpacing: '4px', color: '#E8B84B' }}>
            PLAYER <span style={{ color: '#fff' }}>DIRECTORY</span>
          </h1>
          <div style={{ color: '#555', fontSize: '0.875rem' }}>{filteredPlayers.length} matches / {playersData.length} total</div>
        </header>

        {/* Filters Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', backgroundColor: '#111', padding: '24px', border: '1px solid #222', borderRadius: '8px' }}>
          
          {/* Search Row */}
          <input 
            type="text" 
            placeholder="Search players by name..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(24); }}
            style={{ width: '100%', backgroundColor: '#050505', border: '1px solid #333', color: '#fff', padding: '16px 20px', fontSize: '1.2rem', borderRadius: '4px', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#E8B84B'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />

          <div className="filters-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
            {/* Roles Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#777', marginRight: '8px', fontSize: '0.9rem' }}>ROLE:</span>
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => { setFilterRole(role); setVisibleCount(24); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: filterRole === role ? '#E8B84B' : '#333',
                    backgroundColor: filterRole === role ? '#E8B84B' : '#050505',
                    color: filterRole === role ? '#000' : '#fff',
                    cursor: 'pointer',
                    fontWeight: filterRole === role ? 'bold' : 'normal',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >{role}</button>
              ))}
            </div>

            {/* Nationality Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#777', marginRight: '8px', fontSize: '0.9rem' }}>NATION:</span>
              {NATIONS.map(nation => (
                <button
                  key={nation}
                  onClick={() => { setFilterNation(nation); setVisibleCount(24); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: filterNation === nation ? '#00BCD4' : '#333',
                    backgroundColor: filterNation === nation ? '#00BCD4' : '#050505',
                    color: filterNation === nation ? '#000' : '#fff',
                    cursor: 'pointer',
                    fontWeight: filterNation === nation ? 'bold' : 'normal',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >{nation}</button>
              ))}
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 600px) {
            .filters-container { gap: 16px !important; }
            header h1 { font-size: 2.5rem !important; }
            header { flex-direction: column; text-align: center; gap: 16px !important; }
          }
        `}} />

        {/* List */}
        <div>
          {displayedPlayers.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', backgroundColor: '#0A0A0A', border: '1px dashed #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <div style={{ color: '#888', fontSize: '1.2rem' }}>No players found matching your criteria.</div>
              <button 
                onClick={() => { setSearch(''); setFilterRole('ALL'); setFilterNation('ALL'); }}
                style={{ marginTop: '16px', padding: '8px 24px', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                onMouseOver={e => e.target.style.borderColor = '#E8B84B'}
                onMouseOut={e => e.target.style.borderColor = '#555'}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '24px',
                padding: '16px 0'
              }}>
                {displayedPlayers.map((p) => (
                  <PlayerFlipCard key={p.id} player={p} />
                ))}
              </div>
              
              {visibleCount < filteredPlayers.length && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', paddingBottom: '40px' }}>
                  <button 
                    onClick={() => setVisibleCount(v => v + 24)}
                    style={{
                      padding: '16px 40px',
                      backgroundColor: 'transparent',
                      border: '2px solid #E8B84B',
                      color: '#E8B84B',
                      fontSize: '1.1rem',
                      fontFamily: "'Courier Prime', monospace",
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.target.style.backgroundColor = '#E8B84B'; e.target.style.color = '#000'; }}
                    onMouseOut={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#E8B84B'; }}
                  >
                    LOAD MORE LISTINGS
                  </button>
                </div>
              )}
            </>
          )}
        <div style={{ marginTop: '48px', padding: '24px 0', textAlign: 'center', borderTop: '1px solid #111' }}>
          <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1px', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
            IPL Auction Online is a fan-made simulator for educational purposes. 
            Player information and data are attributed to <a href="https://www.iplt20.com" target="_blank" rel="noreferrer" style={{ color: '#E8B84B', textDecoration: 'none' }}>iplt20.com</a> & <a href="https://cricapi.com" target="_blank" rel="noreferrer" style={{ color: '#E8B84B', textDecoration: 'none' }}>CricAPI</a>.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
