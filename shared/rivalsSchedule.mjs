export const IST_OFFSET = '+05:30';
export const IPL_SEASON_YEAR = 2026;
export const RIVALS_PURSE = 120;
export const RIVALS_PLAYING_XI_SIZE = 11;
export const RIVALS_MAX_SQUAD_SIZE = 13;
export const RIVALS_MAX_OVERSEAS = 5;
export const RIVALS_TIMER_SECONDS = 8;
export const RIVALS_WILDCARD_COUNT = 3;

const MORNING_OPEN_HOUR = 0;
const MATCH_DURATION_MINUTES = 240;

export const TEAM_DETAILS = {
  CSK: { id: 'CSK', name: 'Chennai Super Kings', short: 'CSK', color: '#F9CA24', logo: '/assets/CSK.png' },
  MI: { id: 'MI', name: 'Mumbai Indians', short: 'MI', color: '#4FC3F7', logo: '/assets/MI.png' },
  RCB: { id: 'RCB', name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#FF5252', logo: '/assets/RCB.png' },
  KKR: { id: 'KKR', name: 'Kolkata Knight Riders', short: 'KKR', color: '#CE93D8', logo: '/assets/KKR.png' },
  SRH: { id: 'SRH', name: 'Sunrisers Hyderabad', short: 'SRH', color: '#FF8A65', logo: '/assets/SRH.png' },
  DC: { id: 'DC', name: 'Delhi Capitals', short: 'DC', color: '#64B5F6', logo: '/assets/DC.png' },
  PBKS: { id: 'PBKS', name: 'Punjab Kings', short: 'PBKS', color: '#EF9A9A', logo: '/assets/PBKS.png' },
  RR: { id: 'RR', name: 'Rajasthan Royals', short: 'RR', color: '#F48FB1', logo: '/assets/RR.png' },
  GT: { id: 'GT', name: 'Gujarat Titans', short: 'GT', color: '#4DD0E1', logo: '/assets/GT.png' },
  LSG: { id: 'LSG', name: 'Lucknow Super Giants', short: 'LSG', color: '#81D4FA', logo: '/assets/LSG.png' },
};

const ROLE_MAP = {
  batsman: 'BAT',
  batter: 'BAT',
  bowler: 'BOWL',
  wicket_keeper: 'WK',
  wicketkeeper: 'WK',
  all_rounder: 'AR',
  'all-rounder': 'AR',
};

const FORM_SCORE = {
  excellent: 18,
  great: 16,
  good: 12,
  decent: 8,
  average: 6,
  poor: 2,
};

const HIGH_PROFILE_RIVALRIES = new Set([
  'CSK:RCB',
  'CSK:MI',
  'MI:RCB',
  'KKR:RCB',
  'CSK:KKR',
  'SRH:RCB',
  'GT:CSK',
  'GT:RCB',
  'RR:SRH',
]);

const RAW_IPL_2026_SCHEDULE = [
  ['2026-03-28', '19:30', 'RCB', 'SRH', 'Bengaluru'],
  ['2026-03-29', '19:30', 'MI', 'KKR', 'Mumbai'],
  ['2026-03-30', '19:30', 'RR', 'CSK', 'Guwahati'],
  ['2026-03-31', '19:30', 'PBKS', 'GT', 'New Chandigarh'],
  ['2026-04-01', '19:30', 'LSG', 'DC', 'Lucknow'],
  ['2026-04-02', '19:30', 'KKR', 'SRH', 'Kolkata'],
  ['2026-04-03', '19:30', 'CSK', 'PBKS', 'Chennai'],
  ['2026-04-04', '15:30', 'DC', 'MI', 'Delhi'],
  ['2026-04-04', '19:30', 'GT', 'RR', 'Ahmedabad'],
  ['2026-04-05', '15:30', 'SRH', 'LSG', 'Hyderabad'],
  ['2026-04-05', '19:30', 'RCB', 'CSK', 'Bengaluru'],
  ['2026-04-06', '19:30', 'KKR', 'PBKS', 'Kolkata'],
  ['2026-04-07', '19:30', 'RR', 'MI', 'Guwahati'],
  ['2026-04-08', '19:30', 'DC', 'GT', 'Delhi'],
  ['2026-04-09', '19:30', 'KKR', 'LSG', 'Kolkata'],
  ['2026-04-10', '19:30', 'RR', 'RCB', 'Guwahati'],
  ['2026-04-11', '15:30', 'PBKS', 'SRH', 'New Chandigarh'],
  ['2026-04-11', '19:30', 'CSK', 'DC', 'Chennai'],
  ['2026-04-12', '15:30', 'LSG', 'GT', 'Lucknow'],
  ['2026-04-12', '19:30', 'MI', 'RCB', 'Mumbai'],
  ['2026-04-13', '19:30', 'SRH', 'RR', 'Hyderabad'],
  ['2026-04-14', '19:30', 'CSK', 'KKR', 'Chennai'],
  ['2026-04-15', '19:30', 'RCB', 'LSG', 'Bengaluru'],
  ['2026-04-16', '19:30', 'MI', 'PBKS', 'Mumbai'],
  ['2026-04-17', '19:30', 'GT', 'KKR', 'Ahmedabad'],
  ['2026-04-18', '15:30', 'RCB', 'DC', 'Bengaluru'],
  ['2026-04-18', '19:30', 'SRH', 'CSK', 'Hyderabad'],
  ['2026-04-19', '15:30', 'KKR', 'RR', 'Kolkata'],
  ['2026-04-19', '19:30', 'PBKS', 'LSG', 'New Chandigarh'],
  ['2026-04-20', '19:30', 'GT', 'MI', 'Ahmedabad'],
  ['2026-04-21', '19:30', 'SRH', 'DC', 'Hyderabad'],
  ['2026-04-22', '19:30', 'LSG', 'RR', 'Lucknow'],
  ['2026-04-23', '19:30', 'MI', 'CSK', 'Mumbai'],
  ['2026-04-24', '19:30', 'RCB', 'GT', 'Bengaluru'],
  ['2026-04-25', '15:30', 'DC', 'PBKS', 'Delhi'],
  ['2026-04-25', '19:30', 'RR', 'SRH', 'Jaipur'],
  ['2026-04-26', '15:30', 'GT', 'CSK', 'Ahmedabad'],
  ['2026-04-26', '19:30', 'LSG', 'KKR', 'Lucknow'],
  ['2026-04-27', '19:30', 'DC', 'RCB', 'Delhi'],
  ['2026-04-28', '19:30', 'PBKS', 'RR', 'New Chandigarh'],
  ['2026-04-29', '19:30', 'MI', 'SRH', 'Mumbai'],
  ['2026-04-30', '19:30', 'GT', 'RCB', 'Ahmedabad'],
  ['2026-05-01', '19:30', 'RR', 'DC', 'Jaipur'],
  ['2026-05-02', '19:30', 'CSK', 'MI', 'Chennai'],
  ['2026-05-03', '15:30', 'SRH', 'KKR', 'Hyderabad'],
  ['2026-05-03', '19:30', 'GT', 'PBKS', 'Ahmedabad'],
  ['2026-05-04', '19:30', 'MI', 'LSG', 'Mumbai'],
  ['2026-05-05', '19:30', 'DC', 'CSK', 'Delhi'],
  ['2026-05-06', '19:30', 'SRH', 'PBKS', 'Hyderabad'],
  ['2026-05-07', '19:30', 'LSG', 'RCB', 'Lucknow'],
  ['2026-05-08', '19:30', 'DC', 'KKR', 'Delhi'],
  ['2026-05-09', '19:30', 'RR', 'GT', 'Jaipur'],
  ['2026-05-10', '15:30', 'CSK', 'LSG', 'Chennai'],
  ['2026-05-10', '19:30', 'RCB', 'MI', 'Raipur'],
  ['2026-05-11', '19:30', 'PBKS', 'DC', 'Dharamshala'],
  ['2026-05-12', '19:30', 'GT', 'SRH', 'Ahmedabad'],
  ['2026-05-13', '19:30', 'RCB', 'KKR', 'Raipur'],
  ['2026-05-14', '19:30', 'PBKS', 'MI', 'Dharamshala'],
  ['2026-05-15', '19:30', 'LSG', 'CSK', 'Lucknow'],
  ['2026-05-16', '19:30', 'KKR', 'GT', 'Kolkata'],
  ['2026-05-17', '15:30', 'PBKS', 'RCB', 'Dharamshala'],
  ['2026-05-17', '19:30', 'DC', 'RR', 'Delhi'],
  ['2026-05-18', '19:30', 'CSK', 'SRH', 'Chennai'],
  ['2026-05-19', '19:30', 'RR', 'LSG', 'Jaipur'],
  ['2026-05-20', '19:30', 'KKR', 'MI', 'Kolkata'],
  ['2026-05-21', '19:30', 'CSK', 'GT', 'Chennai'],
  ['2026-05-22', '19:30', 'SRH', 'RCB', 'Hyderabad'],
  ['2026-05-23', '19:30', 'LSG', 'PBKS', 'Lucknow'],
  ['2026-05-24', '15:30', 'MI', 'RR', 'Mumbai'],
  ['2026-05-24', '19:30', 'KKR', 'DC', 'Kolkata'],
  [
    '2026-05-26',
    '19:30',
    'RCB',
    'GT',
    'HPCA Stadium, Dharamshala',
    { matchLabel: 'Qualifier 1', isPlayoff: true },
  ],
  [
    '2026-05-27',
    '19:30',
    'SRH',
    'RR',
    'Maharaja Yadavindra Singh International Cricket Stadium, New Chandigarh',
    { matchLabel: 'Eliminator', isPlayoff: true },
  ],
  [
    '2026-05-29',
    '19:30',
    'GT',
    'RR',
    'Maharaja Yadavindra Singh International Cricket Stadium, New Chandigarh',
    {
      matchLabel: 'Qualifier 2',
      winnerTeam: 'GT',
      resultLabel: 'GT qualified for Final',
      isPlayoff: true,
    },
  ],
  [
    '2026-05-31',
    '19:30',
    'RCB',
    'GT',
    'Narendra Modi Stadium, Ahmedabad',
    {
      matchLabel: 'Final',
      winnerTeam: 'RCB',
      resultLabel: 'RCB won IPL 2026',
      isPlayoff: true,
    },
  ],
];

function parseMatchDate(date, time) {
  return new Date(`${date}T${time}:00${IST_OFFSET}`);
}

function getMatchKey(matchLike) {
  return `${matchLike.date}-${String(matchLike.matchNumber).padStart(2, '0')}-${matchLike.homeTeam}-${matchLike.awayTeam}`;
}

function getRivalryKey(teamA, teamB) {
  return [teamA, teamB].sort().join(':');
}

function normalizeRole(role) {
  return ROLE_MAP[String(role || '').toLowerCase()] || 'BAT';
}

function getPlayerWeight(player) {
  const stats = player?.stats || {};
  return (
    (Number(player?.base_price) || 0) * 1.8 +
    (Number(stats.matches) || 0) * 0.45 +
    (Number(stats.runs) || 0) / 260 +
    (Number(stats.wickets) || 0) * 1.65 +
    (Number(stats.avg) || 0) * 0.5 +
    (Number(stats.sr) || 0) * 0.08 +
    (Number(stats.econ) ? Math.max(0, 15 - Number(stats.econ)) : 0) +
    (stats.capped ? 12 : 0) +
    (FORM_SCORE[String(stats.form || '').toLowerCase()] || 0)
  );
}

function takeBest(players, count, usedNames) {
  const picked = [];
  for (const player of players) {
    if (picked.length >= count) break;
    if (usedNames.has(player.name)) continue;
    usedNames.add(player.name);
    picked.push(player);
  }
  return picked;
}

function interleave(a, b) {
  const out = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

function buildAuctionPlayer(player, teamId, extra = {}) {
  const role = normalizeRole(player.role);
  const base = Math.max(0.3, Number(((Number(player.base_price) || 30) / 100).toFixed(2)));
  return {
    id: player.id || `${teamId}-${player.name}`,
    name: player.name,
    role,
    base,
    overseas: String(player.country || '').toLowerCase() !== 'india',
    teamId,
    teamName: TEAM_DETAILS[teamId]?.name || teamId,
    teamShort: TEAM_DETAILS[teamId]?.short || teamId,
    teamColor: TEAM_DETAILS[teamId]?.color || '#999',
    photoUrl: player.photo_url || player.image_url || null,
    stats: player.stats || {},
    ...extra,
  };
}

function selectRivalsCore(teamPlayers) {
  const ranked = [...teamPlayers].sort((a, b) => getPlayerWeight(b) - getPlayerWeight(a));
  const byRole = {
    WK: ranked.filter((player) => normalizeRole(player.role) === 'WK'),
    BAT: ranked.filter((player) => normalizeRole(player.role) === 'BAT'),
    AR: ranked.filter((player) => normalizeRole(player.role) === 'AR'),
    BOWL: ranked.filter((player) => normalizeRole(player.role) === 'BOWL'),
  };

  const used = new Set();
  const starters = [
    ...takeBest(byRole.WK, 1, used),
    ...takeBest(byRole.BAT, 3, used),
    ...takeBest(byRole.AR, 2, used),
    ...takeBest(byRole.BOWL, 3, used),
  ];

  const remaining = ranked.filter((player) => !used.has(player.name));
  while (starters.length < RIVALS_PLAYING_XI_SIZE && remaining.length > 0) {
    const next = remaining.shift();
    used.add(next.name);
    starters.push(next);
  }

  return {
    starters,
    bench: ranked.filter((player) => !used.has(player.name)),
  };
}

function getLocalDateKey(input) {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export const IPL_2026_MATCHES = RAW_IPL_2026_SCHEDULE.map(([date, time, homeTeam, awayTeam, venue, meta = {}], index) => {
  const startAt = parseMatchDate(date, time);
  const endAt = new Date(startAt.getTime() + MATCH_DURATION_MINUTES * 60 * 1000);
  const auctionOpensAt = parseMatchDate(date, `${String(MORNING_OPEN_HOUR).padStart(2, '0')}:00`);
  const hasResolvedTeams = Boolean(TEAM_DETAILS[homeTeam] && TEAM_DETAILS[awayTeam]);
  const isRivalsPlayable = meta.isRivalsPlayable ?? hasResolvedTeams;
  const match = {
    matchNumber: index + 1,
    matchLabel: meta.matchLabel || `Match ${index + 1}`,
    season: IPL_SEASON_YEAR,
    date,
    time,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    auctionOpensAt: auctionOpensAt.toISOString(),
    homeTeam,
    awayTeam,
    homeTeamDisplay: meta.homeTeamDisplay || TEAM_DETAILS[homeTeam]?.short || homeTeam,
    awayTeamDisplay: meta.awayTeamDisplay || TEAM_DETAILS[awayTeam]?.short || awayTeam,
    venue,
    winnerTeam: meta.winnerTeam || null,
    resultLabel: meta.resultLabel || '',
    isPlayoff: !!meta.isPlayoff,
    isRivalsPlayable,
  };
  return {
    ...match,
    key: getMatchKey(match),
    rivalryKey: getRivalryKey(homeTeam, awayTeam),
    isHighProfile: HIGH_PROFILE_RIVALRIES.has(getRivalryKey(homeTeam, awayTeam)),
  };
});

export function getMatchByKey(matchKey) {
  return IPL_2026_MATCHES.find((match) => match.key === matchKey) || null;
}

export function getMatchStatus(match, now = new Date()) {
  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const opensAt = new Date(match.auctionOpensAt).getTime();
  const startsAt = new Date(match.startAt).getTime();
  const endsAt = new Date(match.endAt).getTime();
  const todayKey = getLocalDateKey(nowTime);
  const isToday = todayKey === match.date;

  let state = 'scheduled';
  if (nowTime >= endsAt) state = 'completed';
  else if (nowTime >= startsAt) state = 'locked';
  else if (nowTime >= opensAt) state = 'open';

  return {
    state,
    isToday,
    isUpcoming: nowTime < startsAt,
    isJoinable: state === 'open' && match.isRivalsPlayable !== false,
    hasResolvedTeams: match.isRivalsPlayable !== false,
    hasStarted: nowTime >= startsAt,
    hasEnded: nowTime >= endsAt,
    millisToOpen: opensAt - nowTime,
    millisToStart: startsAt - nowTime,
    millisToEnd: endsAt - nowTime,
    reminders: [
      { label: '30 mins', minutesBefore: 30, triggerAt: startsAt - 30 * 60 * 1000 },
      { label: '5 mins', minutesBefore: 5, triggerAt: startsAt - 5 * 60 * 1000 },
    ],
  };
}

export function getRivalsDashboard(now = new Date()) {
  const matches = IPL_2026_MATCHES.map((match) => ({ ...match, status: getMatchStatus(match, now) }));
  const todayMatches = matches.filter((match) => match.status.isToday);
  const currentMatch = matches.find((match) => match.status.state === 'open') || null;
  const nextMatch = matches.find((match) => match.status.isUpcoming) || null;
  const completedToday = todayMatches.filter((match) => match.status.state === 'completed');
  return {
    matches,
    todayMatches,
    currentMatch,
    nextMatch,
    completedToday,
  };
}

export function buildRivalsPlayerPool(allPlayers, matchLike) {
  const match = typeof matchLike === 'string' ? getMatchByKey(matchLike) : matchLike;
  if (!match || match.isRivalsPlayable === false) return [];

  const fixtureTeams = [match.homeTeam, match.awayTeam];
  const fixturePlayers = (allPlayers || []).filter((player) => fixtureTeams.includes(player.ipl_team_code));

  const homePlayers = fixturePlayers.filter((player) => player.ipl_team_code === match.homeTeam);
  const awayPlayers = fixturePlayers.filter((player) => player.ipl_team_code === match.awayTeam);

  const homeCore = selectRivalsCore(homePlayers);
  const awayCore = selectRivalsCore(awayPlayers);
  const wildcardBench = [...homeCore.bench, ...awayCore.bench]
    .sort((a, b) => getPlayerWeight(b) - getPlayerWeight(a))
    .slice(0, RIVALS_WILDCARD_COUNT);

  const openingBurst = interleave(
    homeCore.starters.slice(0, 5).map((player) => buildAuctionPlayer(player, match.homeTeam, { setName: 'Powerplay Duel' })),
    awayCore.starters.slice(0, 5).map((player) => buildAuctionPlayer(player, match.awayTeam, { setName: 'Powerplay Duel' })),
  );

  const wildcardDrop = wildcardBench.map((player, index) => buildAuctionPlayer(player, player.ipl_team_code, {
    isWildcard: true,
    setName: 'Wildcard Drop',
    wildcardStage: 'mid-auction',
    wildcardOrder: index + 1,
  }));

  const deathOvers = interleave(
    homeCore.starters.slice(5).map((player) => buildAuctionPlayer(player, match.homeTeam, { setName: 'Death Overs Finish' })),
    awayCore.starters.slice(5).map((player) => buildAuctionPlayer(player, match.awayTeam, { setName: 'Death Overs Finish' })),
  );

  return [...openingBurst, ...wildcardDrop, ...deathOvers].map((player, index) => ({
    ...player,
    id: `${match.key}-${index + 1}-${player.name}`,
    queueIndex: index,
  }));
}

export function buildRivalsMatchSnapshot(matchLike, now = new Date()) {
  const match = typeof matchLike === 'string' ? getMatchByKey(matchLike) : matchLike;
  if (!match) return null;
  return {
    ...match,
    homeTeamInfo: TEAM_DETAILS[match.homeTeam] || null,
    awayTeamInfo: TEAM_DETAILS[match.awayTeam] || null,
    status: getMatchStatus(match, now),
  };
}

export function getTeamLineupOrder(matchLike) {
  const match = typeof matchLike === 'string' ? getMatchByKey(matchLike) : matchLike;
  return match && match.isRivalsPlayable !== false ? [match.homeTeam, match.awayTeam] : [];
}
