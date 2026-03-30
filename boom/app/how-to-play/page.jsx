import Link from 'next/link';

const GOLD = '#E8B84B';
const CYAN = '#22D3EE';
const BG = '#080808';
const CARD = '#0d0f14';
const BORDER = '#1d2330';

export const metadata = {
  title: 'How to Play IPL Auction Online | Rules, Scoring, Results & Strategy',
  description: 'Learn how IPL Auction Online works: room setup, auction rules, bidding, squad building, points calculation, leaderboard scoring, results, and strategy tips.',
  keywords: [
    'How to play IPL Auction Online',
    'IPL auction rules',
    'IPL auction points calculation',
    'IPL auction leaderboard',
    'IPL auction results',
    'cricket auction simulator rules',
    'fantasy cricket auction strategy',
  ],
  alternates: {
    canonical: '/how-to-play',
  },
  openGraph: {
    title: 'How to Play IPL Auction Online',
    description: 'Complete guide to the IPL auction simulator: rules, scoring, results, leaderboard logic, and winning strategies.',
    url: 'https://iplauction.fun/how-to-play',
    siteName: 'IPL Auction Online',
    images: [
      {
        url: '/assets/favicon.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Play IPL Auction Online',
    description: 'Auction rules, scoring system, results breakdown, leaderboard logic, and strategy tips for IPL Auction Online.',
    images: ['/assets/og-image.png'],
  },
};

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
  'The host can start a multiplayer auction only when at least 2 active players are in the room.',
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
    a: 'At least 2 active non-spectator players must be in the room before the host can start the auction.',
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function HowToPlayPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f7f7f7', fontFamily: "'Barlow Condensed', sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .htp-shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
        .htp-section { padding: 28px 0; }
        .htp-grid { display: grid; gap: 16px; }
        .htp-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
          border: 1px solid ${BORDER};
          border-radius: 18px;
          padding: 18px;
          animation: fadeUp .35s ease both;
        }
        .htp-kicker {
          color: ${CYAN};
          font-size: 11px;
          letter-spacing: .28em;
          text-transform: uppercase;
          font-family: 'Courier Prime', monospace;
        }
        .htp-title {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: .08em;
          color: ${GOLD};
        }
        .htp-link {
          text-decoration: none;
          color: inherit;
        }
        .htp-link-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 999px;
          text-decoration: none;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: .08em;
          font-size: 1.05rem;
          transition: transform .18s ease, filter .18s ease;
        }
        .htp-link-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        @media (min-width: 800px) {
          .htp-grid.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .htp-grid.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .htp-grid.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(12px)', background: 'rgba(8,8,8,0.82)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="htp-shell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
          <Link href="/" className="htp-link" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '.18em' }}>
            IPL <span style={{ color: GOLD }}>AUCTION ONLINE</span>
          </Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/" className="htp-link-btn" style={{ border: `1px solid ${BORDER}`, color: '#d5d8de', background: '#10131a' }}>
              Home
            </Link>
            <Link href="/room?action=create" className="htp-link-btn" style={{ background: GOLD, color: '#000' }}>
              Create Room
            </Link>
            <Link href="/room?action=browse" className="htp-link-btn" style={{ border: `1px solid ${CYAN}55`, color: CYAN, background: `${CYAN}12` }}>
              Live Auctions
            </Link>
          </div>
        </div>
      </header>

      <main className="htp-shell" style={{ padding: '42px 0 72px' }}>
        <section className="htp-section" style={{ paddingTop: 6 }}>
          <div className="htp-kicker">Complete Guide</div>
          <h1 className="htp-title" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: .9, marginTop: 12 }}>
            HOW TO PLAY IPL AUCTION ONLINE
          </h1>
          <p style={{ maxWidth: 860, color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.8, marginTop: 18 }}>
            IPL Auction Online is a live multiplayer cricket auction simulator where you build a franchise, manage your purse, battle rivals in real time, and then discover how strong your squad really is on the results page. This guide covers game flow, auction rules, scoring, leaderboard logic, strategy, and what happens after the auction ends.
          </p>

          <div className="htp-grid cols-4" style={{ marginTop: 26 }}>
            {quickFacts.map((fact) => (
              <div key={fact.label} className="htp-card">
                <div style={{ color: '#596170', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: "'Courier Prime', monospace" }}>
                  {fact.label}
                </div>
                <div className="htp-title" style={{ fontSize: '2rem', marginTop: 10 }}>
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="htp-section">
          <div className="htp-kicker">Getting Started</div>
          <h2 className="htp-title" style={{ fontSize: '2.3rem', marginTop: 10 }}>How the game flow works</h2>
          <div className="htp-grid cols-2" style={{ marginTop: 18 }}>
            {steps.map((step, index) => (
              <div key={step.title} className="htp-card">
                <div style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em' }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: 700, marginTop: 10 }}>{step.title}</div>
                <p style={{ color: '#9ca3af', lineHeight: 1.8, marginTop: 10 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="htp-section">
          <div className="htp-grid cols-2">
            <div className="htp-card">
              <div className="htp-kicker">Auction Rules</div>
              <h2 className="htp-title" style={{ fontSize: '2rem', marginTop: 10 }}>Core rules every player should know</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {rules.map((rule) => (
                  <div key={rule} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: GOLD, marginTop: 3 }}>●</span>
                    <span style={{ color: '#c7cdd6', lineHeight: 1.7 }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="htp-card">
              <div className="htp-kicker">Modes</div>
              <h2 className="htp-title" style={{ fontSize: '2rem', marginTop: 10 }}>Mega vs Mini Auction</h2>
              <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
                {modes.map((mode) => (
                  <div key={mode.title} style={{ padding: '14px 16px', borderRadius: 14, border: `1px solid ${BORDER}`, background: '#0f1218' }}>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{mode.title}</div>
                    <p style={{ color: '#9ca3af', lineHeight: 1.75, marginTop: 8 }}>{mode.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="htp-section">
          <div className="htp-kicker">Scoring & Results</div>
          <h2 className="htp-title" style={{ fontSize: '2.3rem', marginTop: 10 }}>How points are calculated</h2>
          <p style={{ maxWidth: 900, color: '#9ca3af', lineHeight: 1.8, marginTop: 14 }}>
            The live auction is intentionally a blind-value experience. You do not see player ratings while bidding. Once the auction finishes, the platform evaluates every team using internal player ratings and final XI logic. That is what powers the results page and the leaderboard.
          </p>

          <div className="htp-grid cols-2" style={{ marginTop: 18 }}>
            {scoringPoints.map((item) => (
              <div key={item.title} className="htp-card">
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{item.title}</div>
                <p style={{ color: '#9ca3af', lineHeight: 1.8, marginTop: 10 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="htp-section">
          <div className="htp-kicker">After the Auction</div>
          <h2 className="htp-title" style={{ fontSize: '2.3rem', marginTop: 10 }}>What you see on the results page</h2>
          <div className="htp-grid cols-3" style={{ marginTop: 18 }}>
            {resultsCards.map((card) => (
              <div key={card.title} className="htp-card">
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{card.title}</div>
                <p style={{ color: '#9ca3af', lineHeight: 1.8, marginTop: 10 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="htp-section">
          <div className="htp-grid cols-2">
            <div className="htp-card">
              <div className="htp-kicker">Strategy</div>
              <h2 className="htp-title" style={{ fontSize: '2rem', marginTop: 10 }}>Tips to win more rooms</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {strategyTips.map((tip) => (
                  <div key={tip} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: CYAN, marginTop: 3 }}>↗</span>
                    <span style={{ color: '#c7cdd6', lineHeight: 1.7 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="htp-card">
              <div className="htp-kicker">Frequently Asked Questions</div>
              <h2 className="htp-title" style={{ fontSize: '2rem', marginTop: 10 }}>FAQ</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {faqs.map((item) => (
                  <div key={item.q} style={{ padding: '14px 16px', borderRadius: 14, border: `1px solid ${BORDER}`, background: '#0f1218' }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.08rem' }}>{item.q}</div>
                    <p style={{ color: '#9ca3af', lineHeight: 1.75, marginTop: 8 }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="htp-section">
          <div className="htp-card" style={{ textAlign: 'center', padding: '26px 22px' }}>
            <div className="htp-kicker">Ready to Play</div>
            <h2 className="htp-title" style={{ fontSize: '2.4rem', marginTop: 10 }}>Start your next auction room</h2>
            <p style={{ maxWidth: 760, margin: '14px auto 0', color: '#9ca3af', lineHeight: 1.8 }}>
              Create a room for friends, browse live rooms, or jump into a private code. The live auction hides ratings, the results reveal everything, and the leaderboard decides who actually built the best squad.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
              <Link href="/room?action=create" className="htp-link-btn" style={{ background: GOLD, color: '#000' }}>
                Create Room
              </Link>
              <Link href="/room?action=join-code" className="htp-link-btn" style={{ border: `1px solid ${BORDER}`, color: '#d5d8de', background: '#10131a' }}>
                Join Room
              </Link>
              <Link href="/room?action=browse" className="htp-link-btn" style={{ border: `1px solid ${CYAN}55`, color: CYAN, background: `${CYAN}12` }}>
                Browse Live Auctions
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
