import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../components/JsonLd';
import { SQUADS } from '../../data/squads';
import { breadcrumbSchema, createMetadata, slugify } from '../../lib/seo';

function findTeam(slug) {
  return SQUADS.find((team) => slugify(team.name) === slug || team.id.toLowerCase() === slug);
}

export function generateStaticParams() {
  return SQUADS.map((team) => ({ team: slugify(team.name) }));
}

export function generateMetadata({ params }) {
  const team = findTeam(params.team);
  if (!team) return {};

  return createMetadata({
    title: `${team.name} IPL Squad - Auction Team Builder and Players`,
    description: `Explore ${team.name} IPL squad details, captain, coach, home ground, player roles, and auction team-building ideas for IPL Auction Simulator.`,
    path: `/teams/${slugify(team.name)}`,
    keywords: [`${team.name} squad`, `${team.id} IPL team`, `${team.name} auction players`],
  });
}

export default function TeamPage({ params }) {
  const team = findTeam(params.team);
  if (!team) notFound();

  const groups = [
    ['Batters and Wicketkeepers', team.batters],
    ['All-Rounders', team.allRounders],
    ['Bowlers', team.bowlers],
  ];

  return (
    <main className="team-seo-page" style={{ minHeight: '100vh', background: '#080808', color: '#fff', padding: '84px 24px', fontFamily: "'Rajdhani', sans-serif" }}>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Teams', path: '/teams' }, { name: team.name, path: `/teams/${slugify(team.name)}` }])} />
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/teams" style={{ color: '#E8B84B', textDecoration: 'none', fontWeight: 700 }}>All IPL teams</Link>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28, alignItems: 'center', marginTop: 24 }}>
          <Image src={`/assets/${team.id}.png`} alt={`${team.name} logo`} width={160} height={160} style={{ objectFit: 'contain' }} />
          <div>
            <p style={{ color: team.primaryColor, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 800 }}>IPL Franchise</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, margin: '8px 0', letterSpacing: 0 }}>{team.name}</h1>
            <p style={{ color: '#c7d0db', fontSize: '1.1rem', lineHeight: 1.65 }}>
              Review the {team.name} squad before you build a fantasy IPL team or start a mock IPL auction room.
            </p>
          </div>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, margin: '34px 0' }}>
          {[
            ['Captain', team.captain],
            ['Coach', team.coach],
            ['Home Ground', team.home],
          ].map(([label, value]) => (
            <article key={label} style={{ border: '1px solid rgba(255,255,255,0.1)', borderLeft: `4px solid ${team.primaryColor}`, borderRadius: 8, padding: 18, background: 'rgba(12,16,24,0.86)' }}>
              <h2 style={{ color: '#94A3B8', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</h2>
              <p style={{ marginTop: 8, fontSize: '1.1rem', fontWeight: 700 }}>{value}</p>
            </article>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {groups.map(([title, players]) => (
            <article key={title} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 20, background: 'rgba(12,16,24,0.86)' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 0, fontSize: '2rem', color: team.primaryColor }}>{title}</h2>
              <ul style={{ margin: '14px 0 0', paddingLeft: 18, lineHeight: 1.8, color: '#d7dde7' }}>
                {players.map((player) => (
                  <li key={player}>{player}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}>
          <Link href="/room?action=create" style={{ background: '#E8B84B', color: '#000', padding: '12px 16px', textDecoration: 'none', fontWeight: 800 }}>Create Auction Room</Link>
          <Link href="/players" style={{ border: '1px solid rgba(232,184,75,0.45)', color: '#E8B84B', padding: '12px 16px', textDecoration: 'none', fontWeight: 800 }}>Browse Players</Link>
        </nav>
      </section>
    </main>
  );
}
