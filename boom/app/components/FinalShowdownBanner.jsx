'use client';

import { useEffect } from 'react';

export default function FinalShowdownBanner() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        const { default: confetti } = await import('canvas-confetti');
        if (cancelled) return;

        const colors = ['#ff5252', '#f48fb1', '#e8b84b', '#ffffff', '#22d3ee'];
        confetti({
          particleCount: 76,
          spread: 64,
          startVelocity: 42,
          angle: 60,
          origin: { x: 0.06, y: 0.08 },
          colors,
        });
        confetti({
          particleCount: 76,
          spread: 64,
          startVelocity: 42,
          angle: 120,
          origin: { x: 0.94, y: 0.08 },
          colors,
        });
        confetti({
          particleCount: 52,
          spread: 105,
          startVelocity: 26,
          scalar: 0.82,
          ticks: 180,
          gravity: 0.85,
          origin: { x: 0.5, y: 0.02 },
          colors,
        });
      } catch {
        // Celebration is decorative; keep the site working if the effect cannot load.
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <aside className="final-showdown-banner" aria-label="IPL final showdown banner">
      <div className="final-showdown-glow final-showdown-glow-rcb" />
      <div className="final-showdown-glow final-showdown-glow-rr" />

      <div className="final-showdown-track" aria-hidden="true">
        <span>FINAL SHOWDOWN TODAY</span>
        <span>RCB VS RR</span>
        <span>FINAL SHOWDOWN TODAY</span>
        <span>RCB VS RR</span>
      </div>

      <div className="final-showdown-inner">
        <div className="final-showdown-team final-showdown-team-rcb">
          <img src="/assets/RCB.png" alt="" className="final-showdown-logo" />
          <span>RCB</span>
        </div>

        <div className="final-showdown-center">
          <span className="final-showdown-label">It's the Final Showdown</span>
          <strong>RCB vs RR</strong>
          <a href="/schedule" className="final-showdown-link">View schedule</a>
        </div>

        <div className="final-showdown-vs" aria-hidden="true">VS</div>

        <div className="final-showdown-team final-showdown-team-rr">
          <span>RR</span>
          <img src="/assets/RR.png" alt="" className="final-showdown-logo" />
        </div>
      </div>
    </aside>
  );
}
