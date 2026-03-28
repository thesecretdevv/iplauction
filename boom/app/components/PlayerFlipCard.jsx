import React, { useState } from 'react';
import BorderGlow from './BorderGlow';
import './PlayerFlipCard.css';

export default function PlayerFlipCard({ player }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Parse stats with fallbacks
  const stats = player.stats || {};
  const { name, role, ipl_team_code, base_price, photo_url } = player;

  // Choose role text & color
  let roleText = 'AR';
  let roleColor = '#4caf50'; // green for AR
  if (role === 'batsman') { roleText = 'BAT'; roleColor = '#2196f3'; } // blue
  else if (role === 'bowler') { roleText = 'BOWL'; roleColor = '#f44336'; } // red
  else if (role === 'wicket_keeper') { roleText = 'WK'; roleColor = '#00bcd4'; } // cyan

  // Special team coloring to match CricBid style slightly closer
  let teamColor = '#E8B84B'; // default gold
  if (ipl_team_code === 'CSK') teamColor = '#F9CD05';
  else if (ipl_team_code === 'RCB') teamColor = '#EC1C24';
  else if (ipl_team_code === 'MI') teamColor = '#004BA0';
  else if (ipl_team_code === 'DC') teamColor = '#00008B';
  else if (ipl_team_code === 'PBKS') teamColor = '#DD1F2D';
  else if (ipl_team_code === 'KKR') teamColor = '#3A225D';
  else if (ipl_team_code === 'SRH') teamColor = '#F26522';
  else if (ipl_team_code === 'RR') teamColor = '#EA1A85';
  else if (ipl_team_code === 'LSG') teamColor = '#00BFFF';
  else if (ipl_team_code === 'GT') teamColor = '#0B4973';

  // Base price
  const priceCr = (base_price / 100).toFixed(2) + 'Cr';
  const displayImage = photo_url || '/assets/Kohli.avif';

  // Max values for progress bars to scale accurately
  const MAX_RUNS = 8500;
  const MAX_AVG = 60;
  const MAX_SR = 250;
  const MAX_WKT = 220;
  const MAX_ECO = 15;
  const MAX_MAT = 300;

  const runPct = Math.min((stats.runs || 0) / MAX_RUNS * 100, 100);
  const avgPct = Math.min((stats.avg || 0) / MAX_AVG * 100, 100);
  const srPct = Math.min((stats.sr || 0) / MAX_SR * 100, 100);
  const wktPct = Math.min((stats.wickets || 0) / MAX_WKT * 100, 100);
  const ecoPct = Math.min((stats.econ || 0) / MAX_ECO * 100, 100);
  const matPct = Math.min((stats.matches || 0) / MAX_MAT * 100, 100);

  return (
    <div className="flip-container" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flipper ${isFlipped ? 'flipped' : ''}`}>
        
        {/* FRONT */}
        <div className="card-face front">
          <BorderGlow
            backgroundColor="#111"
            glowColor="40 80 80"
            borderRadius={16}
            glowIntensity={0.8}
            className="player-card-glow"
          >
             <div className="p-card-content">
               <div className="p-card-header">
                 <span className="p-role-pill" style={{ color: roleColor, borderColor: roleColor }}>{roleText}</span>
                 <span className="p-price">₹{priceCr}</span>
               </div>
               
               <div className="p-avatar-wrapper">
                 <img src={displayImage} alt={name} className="p-avatar" />
               </div>
               
               <div className="p-primary-info">
                 <div className="p-name">{name}</div>
                 <div className="p-subtitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                   <span className="p-team" style={{ color: teamColor }}>{ipl_team_code}</span> &bull; <span className="p-sub-role">{roleText}</span>
                   {player.country && player.country.toLowerCase() !== 'india' && (
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
                       <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L2.5 8.5l9 5.5-3.5 3.5-4-1-1.5 1.5 5 2.5 2.5 5 1.5-1.5-1-4 3.5-3.5 5.5 9 1.7-1.2c.4-.2.7-.6.6-1.1z"/>
                     </svg>
                   )}
                 </div>
               </div>
               
               <div className="p-stats-row">
                 {(role === 'batsman' || role === 'wicket_keeper' || role === 'all_rounder') && (
                   <>
                     <div className="p-stat-box">
                       <div className="p-stat-val">{stats.runs || 0}</div>
                       <div className="p-stat-lbl">RUNS</div>
                     </div>
                     <div className="p-stat-box">
                       <div className="p-stat-val">{stats.avg || 0}</div>
                       <div className="p-stat-lbl">AVG</div>
                     </div>
                   </>
                 )}
                 {(role === 'bowler' || role === 'all_rounder') && (
                   <>
                     <div className="p-stat-box">
                       <div className="p-stat-val">{stats.wickets || 0}</div>
                       <div className="p-stat-lbl">WKTS</div>
                     </div>
                     <div className="p-stat-box">
                       <div className="p-stat-val">{stats.econ || 0}</div>
                       <div className="p-stat-lbl">ECON</div>
                     </div>
                   </>
                 )}
               </div>
             </div>
          </BorderGlow>
        </div>

        {/* BACK */}
        <div className="card-face back">
          <BorderGlow
            backgroundColor="#111"
            glowColor="40 80 80"
            borderRadius={16}
            glowIntensity={0.8}
            className="player-card-glow"
          >
             <div className="p-card-content">
               <div className="p-primary-info" style={{ marginTop: '16px' }}>
                 <div className="p-name">{name}</div>
                 <div className="p-subtitle">
                   <span className="p-team" style={{ color: teamColor }}>{ipl_team_code}</span> &bull; <span>{roleText}</span>
                 </div>
               </div>
               
               <div className="p-bars-container">
                 <div className="p-bar-row">
                   <span className="p-bar-lbl">RUN</span>
                   <div className="p-bar-track">
                     <div className="p-bar-fill" style={{ width: `${runPct}%`, background: '#FFC107' }} />
                   </div>
                   <span className="p-bar-val">{stats.runs || 0}</span>
                 </div>
                 
                 <div className="p-bar-row">
                   <span className="p-bar-lbl">AVG</span>
                   <div className="p-bar-track">
                     <div className="p-bar-fill" style={{ width: `${avgPct}%`, background: '#4CAF50' }} />
                   </div>
                   <span className="p-bar-val">{stats.avg || 0}</span>
                 </div>
                 
                 <div className="p-bar-row">
                   <span className="p-bar-lbl">SR</span>
                   <div className="p-bar-track">
                     <div className="p-bar-fill" style={{ width: `${srPct}%`, background: '#2196F3' }} />
                   </div>
                   <span className="p-bar-val">{stats.sr || 0}</span>
                 </div>
                 
                 <div className="p-bar-row">
                   <span className="p-bar-lbl">WKT</span>
                   <div className="p-bar-track">
                     <div className="p-bar-fill" style={{ width: `${wktPct}%`, background: '#F44336' }} />
                   </div>
                   <span className="p-bar-val">{stats.wickets || 0}</span>
                 </div>
                 
                 <div className="p-bar-row">
                   <span className="p-bar-lbl">ECO</span>
                   <div className="p-bar-track">
                     <div className="p-bar-fill" style={{ width: `${ecoPct}%`, background: '#9C27B0' }} />
                   </div>
                   <span className="p-bar-val">{stats.econ || 0}</span>
                 </div>
                 
                 <div className="p-bar-row">
                   <span className="p-bar-lbl">MAT</span>
                   <div className="p-bar-track">
                     <div className="p-bar-fill" style={{ width: `${matPct}%`, background: '#00BCD4' }} />
                   </div>
                   <span className="p-bar-val">{stats.matches || 0}</span>
                 </div>
               </div>
               
               <div className="p-back-footer">
                 <div className="p-price-large">₹{priceCr}</div>
                 <div className="p-back-footer-lbl">BASE PRICE</div>
               </div>
             </div>
          </BorderGlow>
        </div>
        
      </div>
    </div>
  );
}
