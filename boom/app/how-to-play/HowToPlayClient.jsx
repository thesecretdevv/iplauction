'use client';

import Link from 'next/link';

const GOLD = '#E8B84B';
const CYAN = '#22D3EE';
const CARD = '#0d0f14';
const BORDER = '#1d2330';

const quickFacts = [
  { label: 'Franchises', value: '10' },
  { label: 'Starting Purse', value: '₹120 Cr' },
  { label: 'Game Types', value: 'Mega + Mini' },
  { label: 'Live Ratings', value: 'Hidden During Auction' },
];

const steps = [
  {
    title: 'Create or join a room',
    body: 'The host creates a room and shares the code. Friends can join from the join page or browse public rooms. Spectators can watch without bidding.',
  },
  {
    title: 'Choose the auction mode',
    body: 'Pick Mega Auction for a larger squad-building challenge or Mini Auction for a tighter, results-focused format.',
  },
  {
    title: 'Select your franchise',
    body: 'Every active bidder must lock a team before the host can start the room. Spectators do not count as bidders.',
  },
  {
    title: 'Bid player by player',
    body: 'Each player enters the auction with a base price. Teams bid in real time while managing purse, overseas balance, and squad shape.',
  },
  {
    title: 'Build the best XI',
    body: 'Once the auction ends, the platform evaluates your Playing XI and ranks every team on the leaderboard.',
  },
];

const rules = [
  'Each franchise starts with a fixed purse of ₹120 Cr.',
  'A player is sold to the highest bidder when the timer expires.',
  'The host can start a multiplayer auction with 1 active player, but the app shows a warning until more bidders join.',
  'Spectators can watch the auction but do not bid and do not count toward start requirements.',
  'Player ratings are intentionally hidden during the live auction to make bidding more strategic and realistic.',
  'Ratings are revealed later in Results and Leaderboard views.',
];

const modes = [
  {
    title: 'Mega Auction',
    body: 'Best for a full squad-building experience. You buy across a much larger pool and then the game evaluates the strength of your team based on the final XI.',
  },
  {
    title: 'Mini Auction',
    body: 'Best for quicker rooms and tighter competition. Mini mode focuses on the strongest possible Playing XI and applies balance checks more strictly in the final ranking.',
  },
];

const scoringPoints = [
  {
    title: 'Player rating system',
    body: 'Every player has a hidden internal rating out of 100. These ratings are used after the auction for squad analysis, final results, and leaderboard ranking.',
  },
  {
    title: 'Total score',
    body: 'A team’s total score is the sum of the ratings of the players in its evaluated Playing XI.',
  },
  {
    title: 'Average score',
    body: 'Average score is total score divided by the number of players used in the XI calculation. This helps compare overall squad quality and balance.',
  },
  {
    title: 'Mini Auction validation',
    body: 'Mini mode expects a balanced XI. Teams can be disqualified if they fail minimum role requirements such as batsmen, bowlers, or wicketkeeper coverage.',
  },
  {
    title: 'Mega Auction XI selection',
    body: 'If a final XI is not already submitted, the system can auto-select the best available XI from the squad using player ratings and team-balance rules.',
  },
];

const resultsCards = [
  {
    title: 'Squad Results',
    body: 'See your final team, purse used, purse left, total rating, average rating, and player-by-player value after the auction is complete.',
  },
  {
    title: 'Leaderboard',
    body: 'Compare every franchise side by side. The leaderboard ranks teams by Playing XI strength and expands to show the player scorecard behind each total.',
  },
  {
    title: 'Hidden ratings reveal',
    body: 'Because ratings are hidden during bidding, the results screen becomes the reveal moment where strategy, risk, and value picks finally get judged.',
  },
];

const strategyTips = [
  'Do not spend too early just because a star player appears first.',
  'Track purse pressure across rivals before entering a bidding war.',
  'A balanced XI usually beats an expensive but lopsided squad.',
  'Use the hidden-rating format to buy undervalued players, not just famous ones.',
  'In multiplayer rooms, timing matters almost as much as budget.',
];

const faqs = [
  {
    q: 'How do points work in IPL Auction Online?',
    a: 'Each player has an internal rating out of 100. After the auction, the game uses those ratings to score your final Playing XI. Team totals and averages appear in results and leaderboard views.',
  },
  {
    q: 'Are ratings visible during the auction?',
    a: 'No. Ratings are hidden during live bidding to make the auction more strategic and realistic. They are shown after the auction in the results experience.',
  },
  {
    q: 'How many players are needed to start a multiplayer room?',
    a: 'A host can start with 1 active non-spectator player, though the app warns when only one bidder is present.',
  },
  {
    q: 'What happens on the results page?',
    a: 'The results page shows squad strength, purse summary, total team rating, average rating, player-level scores, and the full leaderboard ranking of all teams.',
  },
  {
    q: 'What is the difference between Mega and Mini Auction?',
    a: 'Mega Auction is the broader squad-building mode, while Mini Auction is tighter and more XI-focused, with stricter balance checks in final ranking.',
  },
];

function SectionKicker({ children }) {
  return <div className="htp-kicker">{children}</div>;
}

function BulletList({ items, icon = '•', color = GOLD }) {
  return (
    <div className="htp-list">
      {items.map((item) => (
        <div key={item} className="htp-list-row">
          <span className="htp-list-icon" style={{ color }}>{icon}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function HowToPlayClient({ faqSchemaJson }) {
  return (
    <div className="htp-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchemaJson }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        .htp-page {
          min-height: 100vh;
          background: #000;
          color: #f7f7f7;
          font-family: 'Rajdhani', sans-serif;
        }
        .htp-shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }
        .htp-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(14px);
          background: rgba(8,8,8,0.84);
          border-bottom: 1px solid ${BORDER};
        }
        .htp-topbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          flex-wrap: wrap;
        }
        .htp-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .htp-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          letter-spacing: .16em;
          text-decoration: none;
          color: #fff;
        }
        .htp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: .08em;
          font-size: 1.05rem;
          text-decoration: none;
          transition: transform .18s ease, filter .18s ease;
        }
        .htp-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
        .htp-hero {
          padding: 48px 0 10px;
        }
        .htp-kicker {
          color: ${CYAN};
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          letter-spacing: .22em;
          text-transform: uppercase;
        }
        .htp-title {
          margin-top: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.2rem, 8vw, 6.2rem);
          line-height: .9;
          letter-spacing: .04em;
          color: #fff;
        }
        .htp-subtitle {
          max-width: 860px;
          margin-top: 18px;
          color: #d1d5db;
          font-size: 1.12rem;
          line-height: 1.9;
          letter-spacing: 0.01em;
        }
        .htp-facts {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 28px;
        }
        .htp-fact {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
          border: 1px solid ${BORDER};
          border-radius: 18px;
          padding: 16px;
        }
        .htp-fact-label {
          color: #70798a;
          font-size: .8rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .htp-fact-value {
          margin-top: 10px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: ${GOLD};
          letter-spacing: .04em;
          line-height: .95;
        }
        .htp-stack-wrap {
          display: grid;
          gap: 24px;
          padding-bottom: 80px;
        }
        .htp-card {
          background:
            linear-gradient(180deg, rgba(12,12,12,0.98), rgba(6,6,6,0.98)),
            ${CARD};
          border: 1px solid ${BORDER};
          border-radius: 30px;
          padding: 30px;
          min-height: 34rem;
          overflow: hidden;
        }
        .htp-card-grid {
          display: grid;
          gap: 16px;
        }
        .htp-card-grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .htp-card-grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .htp-card-grid.four {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .htp-card-title {
          margin-top: 10px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          letter-spacing: .02em;
          color: ${GOLD};
          line-height: 1;
          text-transform: uppercase;
        }
        .htp-card-copy {
          color: #d1d5db;
          line-height: 1.85;
          font-size: 1.05rem;
          margin-top: 14px;
          max-width: 840px;
        }
        .htp-mini-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
        }
        .htp-mini-title {
          color: #fff;
          font-size: 1.28rem;
          font-weight: 700;
          line-height: 1.35;
        }
        .htp-mini-copy {
          color: #d1d5db;
          line-height: 1.8;
          margin-top: 10px;
          font-size: 1.02rem;
        }
        .htp-step-number {
          font-family: 'Bebas Neue', sans-serif;
          color: ${GOLD};
          font-size: 2rem;
          letter-spacing: .08em;
        }
        .htp-list {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }
        .htp-list-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #d1d5db;
          line-height: 1.85;
          font-size: 1.02rem;
        }
        .htp-list-icon {
          width: 18px;
          flex: 0 0 18px;
          font-weight: 700;
          transform: translateY(2px);
        }
        .htp-faq {
          padding: 20px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
        }
        .htp-faq-q {
          color: #fff;
          font-weight: 700;
          font-size: 1.14rem;
          line-height: 1.45;
        }
        .htp-faq-a {
          margin-top: 10px;
          color: #d1d5db;
          line-height: 1.8;
          font-size: 1rem;
        }
        @media (max-width: 980px) {
          .htp-facts,
          .htp-card-grid.two,
          .htp-card-grid.three,
          .htp-card-grid.four {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 720px) {
          .htp-hero {
            padding-top: 34px;
          }
          .htp-facts,
          .htp-card-grid.two,
          .htp-card-grid.three,
          .htp-card-grid.four {
            grid-template-columns: 1fr;
          }
          .htp-card {
            min-height: auto;
            padding: 20px;
          }
          .htp-topbar-inner {
            align-items: stretch;
          }
          .htp-actions {
            width: 100%;
          }
          .htp-btn {
            flex: 1 1 140px;
          }
        }
      `}</style>

      <header className="htp-topbar">
        <div className="htp-shell htp-topbar-inner">
          <Link href="/" className="htp-brand">
            IPL <span style={{ color: GOLD }}>AUCTION ONLINE</span>
          </Link>
          <div className="htp-actions">
            <Link href="/" className="htp-btn" style={{ border: `1px solid ${BORDER}`, color: '#d5d8de', background: '#10131a' }}>Home</Link>
            <Link href="/support" className="htp-btn" style={{ border: `1px solid ${BORDER}`, color: '#d5d8de', background: '#10131a' }}>Support</Link>
            <Link href="/room?action=create" className="htp-btn" style={{ background: GOLD, color: '#000' }}>Create Room</Link>
            <Link href="/room?action=browse" className="htp-btn" style={{ border: `1px solid ${CYAN}55`, color: CYAN, background: `${CYAN}12` }}>Live Auctions</Link>
          </div>
        </div>
      </header>

      <main className="htp-shell">
        <section className="htp-hero">
          <SectionKicker>Complete Guide</SectionKicker>
          <h1 className="htp-title">HOW TO PLAY IPL AUCTION ONLINE</h1>
          <p className="htp-subtitle">
            Learn how the IPL auction game works from room setup to final leaderboard scoring. This IPL Auction Online guide covers
            auction rules, bidding strategy, purse management, franchise selection, Mega Auction vs Mini Auction formats,
            hidden player ratings, results breakdown, and multiplayer cricket auction tactics in one place.
          </p>
          <div className="htp-facts">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="htp-fact">
                <div className="htp-fact-label">{fact.label}</div>
                <div className="htp-fact-value">{fact.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="htp-stack-wrap">
          <div className="htp-card">
            <SectionKicker>Getting Started</SectionKicker>
            <div className="htp-card-title">How the game flow works</div>
            <div className="htp-card-grid two" style={{ marginTop: 18 }}>
              {steps.map((step, index) => (
                <div key={step.title} className="htp-mini-card">
                  <div className="htp-step-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="htp-mini-title" style={{ marginTop: 10 }}>{step.title}</div>
                  <div className="htp-mini-copy">{step.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="htp-card">
            <SectionKicker>Auction Rules</SectionKicker>
            <div className="htp-card-title">Core rules every player should know</div>
            <div className="htp-card-copy">
              The live auction is built to feel competitive and readable. These are the rules that shape every room before results are calculated.
            </div>
            <BulletList items={rules} />
          </div>

          <div className="htp-card">
            <SectionKicker>Modes</SectionKicker>
            <div className="htp-card-title">Mega vs Mini Auction</div>
            <div className="htp-card-grid two" style={{ marginTop: 18 }}>
              {modes.map((mode) => (
                <div key={mode.title} className="htp-mini-card">
                  <div className="htp-mini-title">{mode.title}</div>
                  <div className="htp-mini-copy">{mode.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="htp-card">
            <SectionKicker>Scoring & Results</SectionKicker>
            <div className="htp-card-title">How points are calculated</div>
            <div className="htp-card-copy">
              The live auction is intentionally a blind-value experience. You do not see player ratings while bidding.
              Once the auction finishes, the platform evaluates every team using internal player ratings and final XI logic.
              That is what powers the results page and the leaderboard.
            </div>
            <div className="htp-card-grid two" style={{ marginTop: 18 }}>
              {scoringPoints.map((item) => (
                <div key={item.title} className="htp-mini-card">
                  <div className="htp-mini-title">{item.title}</div>
                  <div className="htp-mini-copy">{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="htp-card">
            <SectionKicker>After the Auction</SectionKicker>
            <div className="htp-card-title">What you see on the results page</div>
            <div className="htp-card-grid three" style={{ marginTop: 18 }}>
              {resultsCards.map((card) => (
                <div key={card.title} className="htp-mini-card">
                  <div className="htp-mini-title">{card.title}</div>
                  <div className="htp-mini-copy">{card.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="htp-card">
            <SectionKicker>Strategy</SectionKicker>
            <div className="htp-card-title">Tips to win more rooms</div>
            <BulletList items={strategyTips} icon="↗" color={CYAN} />
          </div>

          <div className="htp-card">
            <SectionKicker>Frequently Asked Questions</SectionKicker>
            <div className="htp-card-title">FAQ</div>
            <div className="htp-card-grid two" style={{ marginTop: 18 }}>
              {faqs.map((item) => (
                <div key={item.q} className="htp-faq">
                  <div className="htp-faq-q">{item.q}</div>
                  <div className="htp-faq-a">{item.a}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="htp-card">
            <SectionKicker>Ready to Play</SectionKicker>
            <div className="htp-card-title">Start your next auction room</div>
            <div className="htp-card-copy">
              Create a room for friends, browse live rooms, or jump into a private code.
              The live auction hides ratings, the results reveal everything, and the leaderboard decides who actually built the best squad.
            </div>
            <div className="htp-actions" style={{ marginTop: 22 }}>
              <Link href="/room?action=create" className="htp-btn" style={{ background: GOLD, color: '#000' }}>Create Room</Link>
              <Link href="/room?action=join-code" className="htp-btn" style={{ border: `1px solid ${BORDER}`, color: '#d5d8de', background: '#10131a' }}>Join Room</Link>
              <Link href="/room?action=browse" className="htp-btn" style={{ border: `1px solid ${CYAN}55`, color: CYAN, background: `${CYAN}12` }}>Browse Live Auctions</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
