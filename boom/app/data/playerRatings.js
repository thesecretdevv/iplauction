// ============================================================
// IPL 2026 - PLAYER RATINGS (Fixed, out of 100)
// Based on: IPL 2025 performance, auction prices, current form,
// expert rankings, and IPL 2026 pre-season analysis
// 
import ALL_PLAYERS from './Players.json';

function normalizePlayerName(name) {
  return String(name || '')
    .replace(/\s*\(WK\)/gi, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const PLAYER_NAME_ALIASES = {
  'digvesh singh': ['Digvesh Rathi'],
  'gurnoor singh brar': ['Gurnoor Brar'],
  'lungi ngidi': ['Lungisani Ngidi'],
  'lhuan-dre pretorius': ['Lhuan-Dre Pretorius', 'Lhuan-Dre Pretorious'],
  'lhuan-dre pretorious': ['Lhuan-Dre Pretorius', 'Lhuan-Dre Pretorious'],
  'rasikh dar': ['Rasikh Salam'],
  'sai kishore': ['R Sai Kishore', 'R. Sai Kishore'],
  'r sai kishore': ['R Sai Kishore', 'R. Sai Kishore'],
  'r. sai kishore': ['R Sai Kishore', 'R. Sai Kishore'],
  'sai sudharshan': ['Sai Sudharsan'],
  'sai sudharsan': ['Sai Sudharsan'],
  'yash raj punia': ['Yash Raj Punja'],
  'prithvi raj yarra': ['Prithviraj Yarra'],
  'varun chakravarthy': ['Varun Chakaravarthy', 'Varun Chakravarthy'],
  'varun chakaravarthy': ['Varun Chakaravarthy', 'Varun Chakravarthy'],
  'mohammad shami': ['Mohammed Shami', 'Mohammad Shami'],
  'mohammed shami': ['Mohammed Shami', 'Mohammad Shami'],
  'mohammad siraj': ['Mohammed Siraj', 'Mohammad Siraj'],
  'mohammed siraj': ['Mohammed Siraj', 'Mohammad Siraj'],
  'mayank agarawal': ['Mayank Agarawal', 'Mayank Agarwal'],
  'mayank agarwal': ['Mayank Agarawal', 'Mayank Agarwal'],
  'saurav chauhan': ['Saurav Chauhan', 'Saurav Chuahan'],
  'saurav chuahan': ['Saurav Chauhan', 'Saurav Chuahan'],
};

function getPlayerNameCandidates(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return [];

  const cleaned = trimmed.replace(/\s*\(WK\)/gi, '').trim();
  const normalized = normalizePlayerName(cleaned);
  const aliases = PLAYER_NAME_ALIASES[normalized] || [];

  return Array.from(new Set([trimmed, cleaned, ...aliases].filter(Boolean)));
}

const PLAYER_RECORDS_BY_NAME = new Map(
  ALL_PLAYERS.map((player) => [normalizePlayerName(player.name), player])
);
// 
// Rating Scale:
//   90-100 → Elite / World Class
//   80-89  → Excellent / Match Winner
//   70-79  → Good / Reliable
//   60-69  → Average / Useful
//   50-59  → Below Average / Fringe
//   30-49  → Young / Unproven / Reserve
// ============================================================

export const PLAYER_RATINGS = {
  "Virat Kohli": 94,
  "Rohit Sharma": 92,
  "Suryakumar Yadav": 90,
  "Shubman Gill": 90,
  "Abhishek Sharma": 90,
  "Yashasvi Jaiswal": 89,
  "Shreyas Iyer": 91,
  "Sai Sudharsan": 89,
  "Ruturaj Gaikwad": 88,
  "Rinku Singh": 88,
  "Tilak Varma": 88,
  "Shivam Dube": 87,
  "Rajat Patidar": 86,
  "Nitish Kumar Reddy": 84,
  "Tim David": 85,
  "Tristan Stubbs": 84,
  "Dewald Brevis": 86,
  "Ashutosh Sharma": 83,
  "Ajinkya Rahane": 83,
  "Shashank Singh": 82,
  "Angkrish Raghuvanshi": 83,
  "Aiden Markram": 81,
  "David Miller": 81,
  "Devdutt Padikkal": 83,
  "Sherfane Rutherford": 81,
  "Shimron Hetmyer": 80,
  "Will Jacks": 82,
  "Steve Smith": 80,
  "Vaibhav Suryavanshi": 86,
  "Ayush Mhatre": 80,
  "Naman Dhir": 80,
  "Digvesh Rathi": 80,
  "Sarfaraz Khan": 79,
  "Kamindu Mendis": 79,
  "Nehal Wadhera": 79,
  "Priyansh Arya": 85,
  "Manish Pandey": 79,
  "Prithvi Shaw": 79,
  "Shahrukh Khan": 78,
  "Abdul Samad": 78,
  "Karun Nair": 77,
  "Ryan Rickelton": 77,
  "Ramandeep Singh": 77,
  "Aniket Verma": 80,
  "Urvil Patel": 76,
  "Musheer Khan": 75,
  "Vipraj Nigam": 74,
  "Sameer Rizvi": 83,
  "Rahul Tripathi": 72,
  "Abhinav Manohar": 71,
  "Yash Dhull": 70,
  "Mohd. Arshad Khan": 70,
  "Jasprit Bumrah": 95,
  "Mitchell Starc": 89,
  "Rashid Khan": 91,
  "Sunil Narine": 90,
  "Yuzvendra Chahal": 90,
  "Pat Cummins": 89,
  "Josh Hazlewood": 90,
  "Arshdeep Singh": 89,
  "Trent Boult": 89,
  "Kuldeep Yadav": 89,
  "Mohammad Shami": 88,
  "Varun Chakravarthy": 88,
  "Bhuvneshwar Kumar": 89,
  "Jofra Archer": 86,
  "Mohammad Siraj": 87,
  "Kagiso Rabada": 86,
  "Matheesha Pathirana": 85,
  "Suyash Sharma": 81,
  "Anrich Nortje": 84,
  "Ravi Bishnoi": 84,
  "T. Natarajan": 84,
  "Jacob Duffy": 84,
  "Noor Ahmad": 85,
  "Matt Henry": 83,
  "Deepak Chahar": 82,
  "Sandeep Sharma": 84,
  "Prasidh Krishna": 86,
  "Lockie Ferguson": 81,
  "Lungisani Ngidi": 84,
  "Shardul Thakur": 81,
  "Khaleel Ahmed": 81,
  "Alzarri Joseph": 80,
  "Harshit Rana": 80,
  "Rahul Chahar": 80,
  "Mayank Yadav": 80,
  "Umesh Yadav": 80,
  "Mustafizur Rahman": 79,
  "Yash Dayal": 79,
  "Avesh Khan": 79,
  "Nathan Ellis": 78,
  "Kyle Jamieson": 78,
  "Vaibhav Arora": 80,
  "Mukesh Kumar": 77,
  "Mangesh Yadav": 77,
  "Harshal Patel": 77,
  "Karn Sharma": 77,
  "Akash Deep": 76,
  "Akash Madhwal": 76,
  "Navdeep Saini": 75,
  "Nuwan Thushara": 75,
  "Mohsin Khan": 83,
  "Yash Thakur": 74,
  "Adam Milne": 73,
  "Kartik Sharma": 73,
  "Jhye Richardson": 72,
  "Taskin Ahmed": 72,
  "Kuldeep Sen": 72,
  "Ashwani Kumar": 71,
  "Anshul Kamboj": 84,
  "Shamar Joseph": 71,
  "Prince Yadav": 84,
  "Kuldip Yadav": 71,
  "Sanju Samson": 89,
  "Nicholas Pooran": 89,
  "Ishan Kishan": 88,
  "Rishabh Pant": 88,
  "Jos Buttler": 90,
  "KL Rahul": 89,
  "Heinrich Klaasen": 89,
  "Quinton De Kock": 86,
  "Phil Salt": 87,
  "Travis Head": 89,
  "Jitesh Sharma": 83,
  "MS Dhoni": 85,
  "Jonny Bairstow": 80,
  "Prabhsimran Singh": 84,
  "Rahmanullah Gurbaz": 79,
  "Dhruv Jurel": 83,
  "Josh Inglis": 79,
  "Shai Hope": 75,
  "K.S. Bharat": 73,
  "Ben Duckett": 74,
  "Jamie Smith": 72,
  "Kusal Mendis": 71,
  "Robin Minz": 71,
  "Kumar Kushagra": 64,
  "Vishnu Vinod": 64,
  "Tim Seifert": 78,
  "Hardik Pandya": 92,
  "Ravindra Jadeja": 90,
  "Axar Patel": 88,
  "Cameron Green": 84,
  "Krunal Pandya": 86,
  "Marcus Stoinis": 84,
  "Wanindu Hasaranga": 83,
  "Mitchell Marsh": 85,
  "Riyan Parag": 84,
  "Romario Shepherd": 83,
  "Liam Livingstone": 80,
  "Sam Curran": 82,
  "Marco Jansen": 82,
  "Jason Holder": 80,
  "Washington Sundar": 82,
  "Venkatesh Iyer": 85,
  "Glenn Phillips": 79,
  "Azmatullah Omarzai": 77,
  "Kyle Mayers": 76,
  "Michael Bracewell": 74,
  "Cooper Connolly": 83,
  "Gulbadin Naib": 73,
  "Dasun Shanaka": 72,
  "Matthew Short": 72,
  "Corbin Bosch": 72,
  "Daniel Sams": 71,
  "Roston Chase": 71,
  "Jack Edwards": 71,
  "Jamie Overton": 83,
  "Tom Curran": 70,
};

// ──────────────────────────────────────────────────────────────
// UTILITY FUNCTION — Get a player's rating (strips "(WK)" tag)
// ──────────────────────────────────────────────────────────────
export function getPlayerRating(playerName, mode = 'mini') {
  if (!playerName) return 50;

  const ratingMode = String(mode || 'mini').toLowerCase();
  const R = ratingMode === 'mega' ? MEGA_PLAYER_RATINGS : PLAYER_RATINGS;
  const candidates = getPlayerNameCandidates(playerName);
  for (const candidate of candidates) {
    if (R[candidate] !== undefined) return R[candidate];
  }

  const fallbackR = ratingMode === 'mega' ? PLAYER_RATINGS : MEGA_PLAYER_RATINGS;
  for (const candidate of candidates) {
    if (fallbackR && fallbackR[candidate] !== undefined) return fallbackR[candidate];
  }

  return 50;
}

export function getPlayerRecord(playerName) {
  const candidates = getPlayerNameCandidates(playerName);
  for (const candidate of candidates) {
    const record = PLAYER_RECORDS_BY_NAME.get(normalizePlayerName(candidate));
    if (record) return record;
  }
  return null;
}

function isOverseasPlayer(player) {
  const record = getPlayerRecord(player?.name);
  const overseas = player?.overseas ?? record?.overseas;
  if (typeof overseas === 'boolean') return overseas;
  const country = String(player?.country ?? record?.country ?? '').trim().toLowerCase();
  return country ? country !== 'india' : false;
}

// ──────────────────────────────────────────────────────────────
// LEADERBOARD FUNCTION
// Pass in an array of { teamName, squad: [ {name, role, country}, ...] } or { teamName, playingXI: [playerName, ...] }
// Here we should also select the playing XI automatically based on logic.
// ──────────────────────────────────────────────────────────────
export function selectPlayingXI(squad, mode = 'mini') {
  // Typical constraints: Exactly 11 players. Max 4 overseas. 
  // At least 1 WK. Minimum generic balance: ~4-5 batters, 1-2 ARs, 4-5 bowlers.
  // We'll greedily pick the best 11 based on ratings, respecting max 4 overseas.

  const ratedSquad = squad.map(p => ({
    ...p,
    rating: getPlayerRating(p.name, mode)
  })).sort((a, b) => b.rating - a.rating);

  let playingXI = [];
  let overseasCount = 0;

  // First, ensure we get at least 1 WK
  const bestWkIndex = ratedSquad.findIndex(p => normalizeRole(p?.role) === 'wicket_keeper');
  if (bestWkIndex !== -1) {
    const wk = ratedSquad[bestWkIndex];
    if (isOverseasPlayer(wk)) overseasCount++;
    playingXI.push(wk);
    ratedSquad.splice(bestWkIndex, 1);
  }

  // Now greedily select remaining up to 11
  for (const p of ratedSquad) {
    if (playingXI.length >= 11) break;

    const isOverseas = isOverseasPlayer(p);
    if (isOverseas && overseasCount >= 4) {
      continue; // skip if overseas limit reached
    }

    if (isOverseas) overseasCount++;
    playingXI.push(p);
  }

  return playingXI;
}

function normalizeRole(role) {
  const value = String(role || '').toUpperCase();
  if (value.includes('WK') || value.includes('KEEP')) return 'wicket_keeper';
  if (value.includes('BOWL')) return 'bowler';
  if (value.includes('AR')) return 'all_rounder';
  return 'batsman';
}

function getRoleFlags(role) {
  const value = String(role || '').toUpperCase();
  const isWicketkeeper = value.includes('WK') || value.includes('KEEP');
  return {
    wicketkeeper: isWicketkeeper,
    batter: isWicketkeeper || value.includes('BAT'),
    bowler: value.includes('BOWL'),
  };
}

export function calculateLeaderboard(teams, mode = 'mini') {
  const normalizedMode = String(mode || 'mini').toLowerCase();
  const results = teams.map(team => {
    // If team just has player names:
    // This assumes team objects are formatted correctly.
    const squad = team.squad || []; // Array of complete player objects
    const configuredSquadSize = Number(team.squadLimit) || 0;
    const requiredSquadSize = Number(team.minimumSquadSize) || (normalizedMode === 'rivals' ? 11 : configuredSquadSize);
    let playingXI = team.playingXI;

    if ((!Array.isArray(playingXI) || playingXI.length === 0) && squad.length > 0) {
      // Need to Auto-select playing XI
      playingXI = selectPlayingXI(squad, mode);
    } else if (!Array.isArray(playingXI)) {
      playingXI = [];
    }

    const playerScores = playingXI.map(playerEntry => {
      const playerName = typeof playerEntry === 'string' ? playerEntry : playerEntry?.name;
      const rating = getPlayerRating(playerName, mode);
      // We need roles to check disqualification
      const pRecord = getPlayerRecord(playerName);
      const resolvedPlayer = typeof playerEntry === 'string' ? pRecord : { ...(pRecord || {}), ...(playerEntry || {}) };
      return {
        name: playerName,
        rating,
        role: normalizeRole(playerEntry?.role || pRecord?.role),
        overseas: isOverseasPlayer(resolvedPlayer)
      };
    });

    const batCount = playerScores.filter(p => getRoleFlags(p.role).batter).length;
    const bowlCount = playerScores.filter(p => getRoleFlags(p.role).bowler).length;
    const wkCount = playerScores.filter(p => getRoleFlags(p.role).wicketkeeper).length;
    const overseasCount = playerScores.filter(p => p.overseas).length;

    const squadShortfall = requiredSquadSize > 0 && squad.length < requiredSquadSize;
    // Disqualified if the bought squad is incomplete, the XI is not exactly 11,
    // has too many overseas players, or fails role counts.
    const isDisqualified = squadShortfall || playingXI.length !== 11 || overseasCount > 4 || batCount < 2 || bowlCount < 2 || wkCount < 1;
    const disqualificationReason = squadShortfall
      ? `Only ${squad.length}/${requiredSquadSize} players bought`
      : playingXI.length !== 11
        ? 'Playing XI must have exactly 11 players'
        : overseasCount > 4
          ? 'More than 4 overseas players in XI'
        : batCount < 2
          ? 'Needs at least 2 batters'
          : bowlCount < 2
            ? 'Needs at least 2 bowlers'
            : wkCount < 1
              ? 'Needs at least 1 wicketkeeper'
              : '';

    const totalScore = playerScores.reduce((sum, p) => sum + p.rating, 0);
    return {
      teamId: team.teamId,
      teamName: team.teamName || team.teamId,
      totalScore,
      remainingPurse: Number(team.remainingPurse) || 0,
      playerScores,
      averageScore: playingXI.length ? Math.round(totalScore / playingXI.length) : 0,
      playingXI,
      squadSize: squad.length,
      squadLimit: configuredSquadSize,
      isDisqualified,
      disqualificationReason
    };
  });

  return results.sort((a, b) => {
    if (a.isDisqualified !== b.isDisqualified) return a.isDisqualified ? 1 : -1;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return b.remainingPurse - a.remainingPurse;
  });
}

// ============================================================
// IPL 2026 MEGA AUCTION - PLAYER RATINGS AND SET ORDER
// Generated from IPL_2026_Player_Ratings - Mega Auction.csv.
// Edit MEGA_AUCTION_RATING_SETS below; ratings and auction sets
// are derived from this one source so future changes stay in sync.
// ============================================================
export const MEGA_AUCTION_RATING_SETS = [
  {
    setName: "Marquee Set 1",
    players: [
      { name: "Abhishek Sharma", rating: 90 },
      { name: "Aiden Markram", rating: 83 },
      { name: "Arshdeep Singh", rating: 87 },
      { name: "Axar Patel", rating: 87 },
      { name: "Bhuvneshwar Kumar", rating: 89 },
      { name: "Hardik Pandya", rating: 92 },
      { name: "Heinrich Klaasen", rating: 89 },
      { name: "Ishan Kishan", rating: 88 },
      { name: "Jasprit Bumrah", rating: 95 },
      { name: "Jofra Archer", rating: 87 },
      { name: "Jos Buttler", rating: 90 },
      { name: "Josh Hazlewood", rating: 89 },
      { name: "Kagiso Rabada", rating: 87 },
      { name: "KL Rahul", rating: 89 },
      { name: "Kuldeep Yadav", rating: 88 },
      { name: "Lockie Ferguson", rating: 83 },
      { name: "Marco Jansen", rating: 83 },
      { name: "Marcus Stoinis", rating: 85 },
      { name: "Mitchell Marsh", rating: 85 },
      { name: "Quinton De Kock", rating: 86 },
      { name: "Mitchell Starc", rating: 89 },
      { name: "Mohammad Shami", rating: 88 },
      { name: "Mohammad Siraj", rating: 88 },
      { name: "MS Dhoni", rating: 85 },
      { name: "Nicholas Pooran", rating: 87 },
      { name: "Noor Ahmad", rating: 85 },
      { name: "Pat Cummins", rating: 89 },
      { name: "Phil Salt", rating: 87 },
      { name: "Rashid Khan", rating: 90 },
      { name: "Ravindra Jadeja", rating: 90 },
      { name: "Rinku Singh", rating: 86 },
      { name: "Rishabh Pant", rating: 88 },
      { name: "Rohit Sharma", rating: 92 },
      { name: "Ruturaj Gaikwad", rating: 85 },
      { name: "Sam Curran", rating: 83 },
      { name: "Sanju Samson", rating: 89 },
      { name: "Shimron Hetmyer", rating: 84 },
      { name: "Shivam Dube", rating: 87 },
      { name: "Shreyas Iyer", rating: 91 },
      { name: "Shubman Gill", rating: 90 },
      { name: "Sai Sudharsan", rating: 89 },
      { name: "Sunil Narine", rating: 91 },
      { name: "Suryakumar Yadav", rating: 90 },
      { name: "Tilak Varma", rating: 88 },
      { name: "Tim David", rating: 86 },
      { name: "Travis Head", rating: 88 },
      { name: "Trent Boult", rating: 89 },
      { name: "Varun Chakravarthy", rating: 88 },
      { name: "Virat Kohli", rating: 94 },
      { name: "Will Jacks", rating: 83 },
      { name: "Yashasvi Jaiswal", rating: 89 },
      { name: "Yuzvendra Chahal", rating: 90 },
    ],
  },
  {
    setName: "Set 1",
    players: [
      { name: "Vaibhav Suryavanshi", rating: 87 },
      { name: "Venkatesh Iyer", rating: 85 },
      { name: "Lungisani Ngidi", rating: 84 },
      { name: "Wanindu Hasaranga", rating: 84 },
      { name: "Jamie Overton", rating: 83 },
      { name: "Deepak Chahar", rating: 82 },
      { name: "Dhruv Jurel", rating: 83 },
      { name: "Glenn Phillips", rating: 82 },
      { name: "Khaleel Ahmed", rating: 81 },
      { name: "Ayush Mhatre", rating: 82 },
      { name: "Digvesh Rathi", rating: 81 },
      { name: "Krunal Pandya", rating: 86 },
      { name: "Mitchell Santner", rating: 85 },
      { name: "Prasidh Krishna", rating: 86 },
      { name: "Rajat Patidar", rating: 87 },
      { name: "Riyan Parag", rating: 83 },
      { name: "Romario Shepherd", rating: 84 },
      { name: "Jitesh Sharma", rating: 83 },
      { name: "Shardul Thakur", rating: 81 },
      { name: "Sherfane Rutherford", rating: 82 },
      { name: "T. Natarajan", rating: 85 },
      { name: "Dewald Brevis", rating: 82 },
      { name: "Anrich Nortje", rating: 84 },
      { name: "Harshit Rana", rating: 82 },
      { name: "Tristan Stubbs", rating: 84 },
      { name: "Ajinkya Rahane", rating: 83 },
      { name: "Rahul Tewatia", rating: 80 },
      { name: "Jacob Duffy", rating: 84 },
      { name: "Matheesha Pathirana", rating: 86 },
      { name: "Matt Henry", rating: 83 },
      { name: "Sandeep Sharma", rating: 85 },
      { name: "Prabhsimran Singh", rating: 84 },
      { name: "Ravi Bishnoi", rating: 86 },
      { name: "Nitish Kumar Reddy", rating: 85 },
      { name: "R. Sai Kishore", rating: 83 },
      { name: "Devdutt Padikkal", rating: 85 },
      { name: "Cameron Green", rating: 85 },
      { name: "Nitish Rana", rating: 82 },
      { name: "Priyansh Arya", rating: 85 },
      { name: "David Miller", rating: 84 },
      { name: "Ryan Rickelton", rating: 83 },
      { name: "Washington Sundar", rating: 83 },
      { name: "Angkrish Raghuvanshi", rating: 83 },
      { name: "Anshul Kamboj", rating: 84 },
      { name: "Ashutosh Sharma", rating: 83 },
      { name: "Eshan Malinga", rating: 83 },
    ],
  },
  {
    setName: "Set 2",
    players: [
      { name: "Deepak Hooda", rating: 79 },
      { name: "Allah Ghazanfar", rating: 81 },
      { name: "Brydon Carse", rating: 79 },
      { name: "Corbin Bosch", rating: 79 },
      { name: "Cooper Connolly", rating: 83 },
      { name: "Dushmantha Chameera", rating: 78 },
      { name: "Jacob Bethell", rating: 80 },
      { name: "Jaydev Unadkat", rating: 77 },
      { name: "Mayank Yadav", rating: 80 },
      { name: "Rovman Powell", rating: 81 },
      { name: "Kamindu Mendis", rating: 79 },
      { name: "Matthew Breetzke", rating: 79 },
      { name: "Avesh Khan", rating: 79 },
      { name: "Harshal Patel", rating: 83 },
      { name: "Mitchell Owen", rating: 76 },
      { name: "Mukesh Kumar", rating: 81 },
      { name: "Nandre Burger", rating: 79 },
      { name: "Nathan Ellis", rating: 78 },
      { name: "Nuwan Thushara", rating: 79 },
      { name: "Xavier Bartlett", rating: 79 },
    ],
  },
  {
    setName: "Set 3",
    players: [
      { name: "Ishant Sharma", rating: 80 },
      { name: "Azmatullah Omarzai", rating: 77 },
      { name: "Jayant Yadav", rating: 78 },
      { name: "Karun Nair", rating: 80 },
      { name: "Manish Pandey", rating: 83 },
      { name: "Shahbaz Ahmed", rating: 80 },
      { name: "Shahrukh Khan", rating: 80 },
      { name: "Tushar Deshpande", rating: 80 },
      { name: "Umran Malik", rating: 80 },
      { name: "Yash Dayal", rating: 82 },
    ],
  },
  {
    setName: "Set 4",
    players: [
      { name: "Abdul Samad", rating: 80 },
      { name: "Abhinandan Singh", rating: 75 },
      { name: "Abhishek Porel", rating: 79 },
      { name: "Ajay Mandal", rating: 75 },
      { name: "Akash Singh", rating: 64 },
      { name: "Aniket Verma", rating: 81 },
      { name: "Anuj Rawat", rating: 78 },
      { name: "Anukul Roy", rating: 80 },
      { name: "Arjun Tendulkar", rating: 76 },
      { name: "Arshin Kulkarni", rating: 74 },
      { name: "Ashwani Kumar", rating: 82 },
      { name: "Ayush Badoni", rating: 82 },
      { name: "Donovan Ferreira", rating: 82 },
      { name: "Gurjapneet Singh", rating: 79 },
      { name: "Gurnoor Brar", rating: 72 },
      { name: "Harnoor Pannu", rating: 74 },
      { name: "Harpreet Brar", rating: 80 },
      { name: "Harsh Dubey", rating: 81 },
      { name: "Himmat Singh", rating: 78 },
      { name: "Kumar Kushagra", rating: 76 },
      { name: "Kwena Maphaka", rating: 77 },
      { name: "Lhuan-Dre Pretorious", rating: 74 },
      { name: "M. Siddharth", rating: 73 },
      { name: "Madhav Tiwari", rating: 72 },
      { name: "Manav Suthar", rating: 79 },
      { name: "Mayank Markande", rating: 80 },
      { name: "Mohd. Arshad Khan", rating: 79 },
      { name: "Mohsin Khan", rating: 83 },
      { name: "Mukesh Choudhary", rating: 80 },
      { name: "Musheer Khan", rating: 75 },
      { name: "Naman Dhir", rating: 82 },
      { name: "Nehal Wadhera", rating: 80 },
      { name: "Nishant Sindhu", rating: 74 },
      { name: "Prince Yadav", rating: 84 },
      { name: "Pyla Avinash", rating: 72 },
      { name: "Raghu Sharma", rating: 72 },
      { name: "Raj Angad Bawa", rating: 72 },
      { name: "Ramakrishna Ghosh", rating: 73 },
      { name: "Ramandeep Singh", rating: 79 },
      { name: "Rasikh Salam", rating: 80 },
      { name: "Robin Minz", rating: 77 },
      { name: "Sameer Rizvi", rating: 83 },
      { name: "Shashank Singh", rating: 82 },
      { name: "Shreyas Gopal", rating: 79 },
      { name: "Shubham Dubey", rating: 80 },
      { name: "Smaran Ravichandaran", rating: 73 },
      { name: "Suryansh Shedge", rating: 74 },
      { name: "Suyash Sharma", rating: 82 },
      { name: "Swapnil Singh", rating: 76 },
      { name: "Tripurana Vijay", rating: 74 },
      { name: "Urvil Patel", rating: 80 },
      { name: "Vaibhav Arora", rating: 81 },
      { name: "Vipraj Nigam", rating: 80 },
      { name: "Vishnu Vinod", rating: 74 },
      { name: "Vyshak Vijaykumar", rating: 80 },
      { name: "Yash Thakur", rating: 79 },
      { name: "Yudhvir Charak", rating: 78 },
      { name: "Zeeshan Ansari", rating: 80 },
    ],
  },
  {
    setName: "BA1",
    players: [
      { name: "Devon Conway", rating: 82 },
      { name: "Jake Fraser-McGurk", rating: 81 },
      { name: "Prithvi Shaw", rating: 80 },
      { name: "Sarfaraz Khan", rating: 82 },
    ],
  },
  {
    setName: "AL1",
    players: [
      { name: "Gus Atkinson", rating: 76 },
      { name: "Liam Livingstone", rating: 83 },
      { name: "Rachin Ravindra", rating: 81 },
      { name: "Wiaan Mulder", rating: 76 },
    ],
  },
  {
    setName: "WK1",
    players: [
      { name: "Ben Duckett", rating: 77 },
      { name: "Finn Allen", rating: 81 },
      { name: "Jamie Smith", rating: 78 },
      { name: "Jonny Bairstow", rating: 82 },
      { name: "K.S. Bharat", rating: 79 },
      { name: "Rahmanullah Gurbaz", rating: 80 },
    ],
  },
  {
    setName: "FA1",
    players: [
      { name: "Akash Deep", rating: 81 },
      { name: "Fazalhaq Farooqi", rating: 80 },
      { name: "Gerald Coetzee", rating: 81 },
      { name: "Shivam Mavi", rating: 80 },
      { name: "Spencer Johnson", rating: 79 },
    ],
  },
  {
    setName: "SP1",
    players: [
      { name: "Akeal Hosein", rating: 81 },
      { name: "Maheesh Theekshana", rating: 80 },
      { name: "Mujeeb Rahman", rating: 79 },
      { name: "Rahul Chahar", rating: 80 },
    ],
  },
  {
    setName: "UBA1",
    players: [
      { name: "Aarya Desai", rating: 70 },
      { name: "Abhinav Manohar", rating: 79 },
      { name: "Abhinav Tejrana", rating: 70 },
      { name: "Anmolpreet Singh", rating: 72 },
      { name: "Atharva Taide", rating: 72 },
      { name: "Yash Dhull", rating: 70 },
    ],
  },
  {
    setName: "UAL1",
    players: [
      { name: "Auqib Dar", rating: 74 },
      { name: "Edhen Tom", rating: 70 },
      { name: "Kamlesh Nagarkoti", rating: 79 },
      { name: "Mahipal Lomror", rating: 78 },
      { name: "Prashant Veer", rating: 79 },
      { name: "Rajvardhan Hangargekar", rating: 74 },
      { name: "Sanvir Singh", rating: 78 },
      { name: "Shivang Kumar", rating: 81 },
      { name: "Tanush Kotian", rating: 74 },
      { name: "Vijay Shankar", rating: 80 },
    ],
  },
  {
    setName: "UWK1",
    players: [
      { name: "Kartik Sharma", rating: 79 },
      { name: "Mukul Choudhary", rating: 80 },
      { name: "Ruchit Ahir", rating: 70 },
      { name: "Tejasvi Singh", rating: 72 },
      { name: "Tushar Raheja", rating: 70 },
      { name: "Vansh Bedi", rating: 70 },
    ],
  },
  {
    setName: "UFA1",
    players: [
      { name: "Akash Madhwal", rating: 80 },
      { name: "Ashok Sharma", rating: 79 },
      { name: "Kartik Tyagi", rating: 81 },
      { name: "Naman Tiwari", rating: 74 },
      { name: "Raj Limbani", rating: 79 },
      { name: "Simarjeet Singh", rating: 67 },
      { name: "Sushant Mishra", rating: 64 },
    ],
  },
  {
    setName: "USP1",
    players: [
      { name: "Karn Sharma", rating: 80 },
      { name: "Kumar Kartikeya Singh", rating: 74 },
      { name: "Prashant Solanki", rating: 74 },
      { name: "Shivam Shukla", rating: 74 },
      { name: "Vignesh Puthur", rating: 79 },
      { name: "Wahidullah Zadran", rating: 72 },
      { name: "Yash Raj Punja", rating: 77 },
    ],
  },
  {
    setName: "BA2",
    players: [
      { name: "Ackeem Auguste", rating: 74 },
      { name: "Mayank Agarawal", rating: 78 },
      { name: "Pathum Nissanka", rating: 80 },
      { name: "Rahul Tripathi", rating: 80 },
      { name: "Reeza Hendricks", rating: 73 },
      { name: "Sediqullah Atal", rating: 74 },
      { name: "Steve Smith", rating: 80 },
      { name: "Tim Robinson", rating: 78 },
    ],
  },
  {
    setName: "AL2",
    players: [
      { name: "Ben Dwarshuis", rating: 72 },
      { name: "Daniel Sams", rating: 77 },
      { name: "Daryl Mitchell", rating: 79 },
      { name: "Dasun Shanaka", rating: 72 },
      { name: "Jason Holder", rating: 81 },
      { name: "Matthew Short", rating: 78 },
      { name: "Michael Bracewell", rating: 79 },
      { name: "Sean Abbott", rating: 72 },
      { name: "Zak Foulkes", rating: 77 },
    ],
  },
  {
    setName: "WK2",
    players: [
      { name: "Benjamin McDermott", rating: 70 },
      { name: "Jordan Cox", rating: 69 },
      { name: "Josh Inglis", rating: 81 },
      { name: "Kusal Mendis", rating: 79 },
      { name: "Kusal Perera", rating: 75 },
      { name: "Shai Hope", rating: 79 },
      { name: "Tim Seifert", rating: 79 },
      { name: "Tom Banton", rating: 78 },
    ],
  },
  {
    setName: "FA2",
    players: [
      { name: "Adam Milne", rating: 73 },
      { name: "Chetan Sakariya", rating: 78 },
      { name: "Kuldeep Sen", rating: 77 },
      { name: "Kyle Jamieson", rating: 80 },
      { name: "Mustafizur Rahman", rating: 81 },
      { name: "Saqib Mahmood", rating: 75 },
      { name: "Umesh Yadav", rating: 80 },
      { name: "William Orourke", rating: 78 },
    ],
  },
  {
    setName: "SP2",
    players: [
      { name: "Mohammad Waqar Salamkheil", rating: 74 },
      { name: "Qais Ahmad", rating: 72 },
      { name: "Rishad Hossain", rating: 70 },
      { name: "Viyaskanth Vijayakanth", rating: 72 },
    ],
  },
  {
    setName: "UBA2",
    players: [
      { name: "Akshat Raghuwanshi", rating: 74 },
      { name: "Aman Rao Perala", rating: 70 },
      { name: "Ankit Kumar", rating: 70 },
      { name: "Danish Malewar", rating: 72 },
      { name: "Manan Vohra", rating: 75 },
      { name: "Pukhraj Mann", rating: 70 },
      { name: "Rohan Kunnummal", rating: 72 },
      { name: "Salman Nizar", rating: 70 },
    ],
  },
  {
    setName: "UAL2",
    players: [
      { name: "Aman Khan", rating: 79 },
      { name: "Darshan Nalkande", rating: 72 },
      { name: "Harsh Tyagi", rating: 72 },
      { name: "Mangesh Yadav", rating: 77 },
      { name: "Mayank Rawat", rating: 72 },
      { name: "Sairaj Patil", rating: 70 },
      { name: "Satvik Deswal", rating: 72 },
      { name: "Suyash Prabhudessai", rating: 72 },
      { name: "Vicky Ostwal", rating: 71 },
      { name: "Yuvraj Chaudhary", rating: 70 },
    ],
  },
  {
    setName: "UWK2",
    players: [
      { name: "Abhishek Pathak", rating: 70 },
      { name: "Kunal Rathore", rating: 70 },
      { name: "Rahul Buddhi", rating: 72 },
      { name: "Ravi Singh", rating: 72 },
      { name: "Ricky Bhui", rating: 76 },
      { name: "Salil Arora", rating: 80 },
      { name: "Saurav Chuahan", rating: 70 },
      { name: "Yashvardhan Dalal", rating: 60 },
    ],
  },
  {
    setName: "UFA2",
    players: [
      { name: "K.M Asif", rating: 72 },
      { name: "Mohammad Izhar", rating: 72 },
      { name: "Onkar Tarmale", rating: 77 },
      { name: "Prithviraj Yarra", rating: 74 },
      { name: "PV.Satyanarayana Raju", rating: 76 },
      { name: "Sakib Hussain", rating: 82 },
      { name: "Vidwath Kaverappa", rating: 74 },
      { name: "Vidyadhar Patil", rating: 70 },
      { name: "Vijay Kumar", rating: 70 },
    ],
  },
  {
    setName: "USP2",
    players: [
      { name: "Bailapudi Yeswanth", rating: 70 },
      { name: "Himanshu Sharma", rating: 70 },
      { name: "K.C. Cariappa", rating: 72 },
      { name: "Kartik Chadha", rating: 70 },
      { name: "Mohit Rathee", rating: 72 },
      { name: "Murugan Ashwin", rating: 79 },
      { name: "Pravin Dubey", rating: 74 },
      { name: "Shubham Agrawal", rating: 72 },
      { name: "Tejas Baroka", rating: 70 },
    ],
  },
  {
    setName: "AL3",
    players: [
      { name: "Beau Webster", rating: 75 },
      { name: "Bevon-John Jacobs", rating: 72 },
      { name: "Daniel Lawrence", rating: 73 },
      { name: "George Linde", rating: 76 },
      { name: "Gulbadin Naib", rating: 77 },
      { name: "Rehan Ahmed", rating: 72 },
      { name: "Tom Curran", rating: 75 },
      { name: "William Sutherland", rating: 73 },
    ],
  },
  {
    setName: "FA3",
    players: [
      { name: "Alzarri Joseph", rating: 80 },
      { name: "Jhye Richardson", rating: 77 },
      { name: "Luke Wood", rating: 72 },
      { name: "Navdeep Saini", rating: 79 },
      { name: "Naveen Ul Haq", rating: 80 },
      { name: "Richard Gleeson", rating: 74 },
      { name: "Riley Meredith", rating: 72 },
      { name: "Shamar Joseph", rating: 78 },
      { name: "Taskin Ahmed", rating: 72 },
    ],
  },
  {
    setName: "UBA3",
    players: [
      { name: "Adarsh Singh", rating: 70 },
      { name: "Arsh Kabir Ranga", rating: 70 },
      { name: "Ayush Doseja", rating: 70 },
      { name: "Bhanu Pania", rating: 70 },
      { name: "Kunal Chandela", rating: 70 },
      { name: "M.Dheeraj Kumar", rating: 70 },
      { name: "Qamran Iqbal", rating: 70 },
      { name: "Sahil Parakh", rating: 74 },
    ],
  },
  {
    setName: "UAL3",
    players: [
      { name: "Abid Mushtaq", rating: 70 },
      { name: "Atit Sheth", rating: 72 },
      { name: "Hritik Shokeen", rating: 72 },
      { name: "Jagadeesha Suchith", rating: 74 },
      { name: "Jalaj Saxena", rating: 74 },
      { name: "Manoj Bhandage", rating: 70 },
      { name: "Manvanth Kumar", rating: 70 },
      { name: "Mayank Dagar", rating: 76 },
      { name: "Raghav Goyal", rating: 70 },
      { name: "Tanay Thyagarajann", rating: 70 },
    ],
  },
  {
    setName: "UWK3",
    players: [
      { name: "Ajitesh Guruswamy", rating: 70 },
      { name: "Bipin Saurabh", rating: 70 },
      { name: "Connor Esterhuizen", rating: 72 },
      { name: "Hardik Tamore", rating: 70 },
      { name: "Joe Clarke", rating: 72 },
      { name: "Siddharth Joon", rating: 70 },
      { name: "Tom Moores", rating: 72 },
      { name: "Vishnu Solanki", rating: 76 },
    ],
  },
  {
    setName: "UFA3",
    players: [
      { name: "Abhilash Shetty", rating: 70 },
      { name: "Arpit Guleria", rating: 70 },
      { name: "Divesh Sharma", rating: 70 },
      { name: "Irfan Umair", rating: 70 },
      { name: "Kuldip Yadav", rating: 71 },
      { name: "Money Grewal", rating: 70 },
      { name: "Sayan Ghosh", rating: 70 },
      { name: "Sunil Kumar", rating: 70 },
      { name: "Tristan Luus", rating: 72 },
    ],
  },
  {
    setName: "USP3",
    players: [
      { name: "Amit Kumar", rating: 72 },
      { name: "Chintal Gandhi", rating: 70 },
      { name: "Dharmendrasinh Jadeja", rating: 70 },
      { name: "Jhathavedh Subramanyan", rating: 70 },
      { name: "Manan Bhardwaj", rating: 70 },
      { name: "Parikshit Dhanak", rating: 72 },
      { name: "Saumy Pandey", rating: 70 },
      { name: "Shreyas Chavan", rating: 70 },
      { name: "Vishal Nishad", rating: 64 },
    ],
  },
  {
    setName: "AL4",
    players: [
      { name: "Charith Asalanka", rating: 77 },
      { name: "Dunith Wellalage", rating: 76 },
      { name: "Dwaine Pretorius", rating: 72 },
      { name: "George Garton", rating: 73 },
      { name: "Kyle Mayers", rating: 79 },
      { name: "Liam Dawson", rating: 77 },
      { name: "Muhammad Abbas", rating: 74 },
      { name: "Nathan Smith", rating: 74 },
      { name: "Roston Chase", rating: 75 },
    ],
  },
  {
    setName: "FA4",
    players: [
      { name: "Jason Behrendorff", rating: 77 },
      { name: "Joshua Tongue", rating: 73 },
      { name: "Matthew Potts", rating: 73 },
      { name: "Nahid Rana", rating: 70 },
      { name: "Olly Stone", rating: 70 },
      { name: "Sandeep Warrier", rating: 72 },
      { name: "Tanzim Hasan Sakib", rating: 72 },
    ],
  },
  {
    setName: "UBA4",
    players: [
      { name: "Aaron Varghese", rating: 70 },
      { name: "Ahammed Imran", rating: 70 },
      { name: "Ayaz Khan", rating: 70 },
      { name: "Daniel Lategan", rating: 70 },
      { name: "Miles Hammond", rating: 72 },
      { name: "Sachin Dhas", rating: 70 },
      { name: "Siddhant Rana", rating: 70 },
      { name: "Vishvarajsinh Jadeja", rating: 70 },
    ],
  },
  {
    setName: "UAL4",
    players: [
      { name: "Abdul Bazith", rating: 70 },
      { name: "Atharva Ankolekar", rating: 74 },
      { name: "Ayush Vartak", rating: 70 },
      { name: "Karan Lal", rating: 70 },
      { name: "Prince Rai", rating: 70 },
      { name: "Ripal Patel", rating: 70 },
      { name: "Sanjay Yadav", rating: 70 },
      { name: "Shams Mulani", rating: 72 },
      { name: "Utkarsh Singh", rating: 70 },
      { name: "Vivrant Sharma", rating: 72 },
    ],
  },
  {
    setName: "UFA4",
    players: [
      { name: "Esakkimuthu Ayyakutti", rating: 70 },
      { name: "Ishan Porel", rating: 74 },
      { name: "Kulwant Khejroliya", rating: 70 },
      { name: "Pankaj Jaswal", rating: 70 },
      { name: "Praful Hinge", rating: 80 },
      { name: "Rajan Kumar", rating: 70 },
      { name: "Ravi Kumar", rating: 70 },
      { name: "Safvan Patel", rating: 70 },
      { name: "Sayed Irfan Aftab", rating: 70 },
    ],
  },
  {
    setName: "USP4",
    players: [
      { name: "Arab Gul", rating: 72 },
      { name: "Izaz Sawariya", rating: 72 },
      { name: "Jikku Bright", rating: 70 },
      { name: "Naman Pushpak", rating: 70 },
      { name: "Purav Agarwal", rating: 70 },
      { name: "Rakibul Hasan", rating: 72 },
      { name: "Roshan Wagshare", rating: 70 },
      { name: "Traveen Mathew", rating: 70 },
      { name: "Yash Dicholkar", rating: 60 },
    ],
  },
  {
    setName: "FA5",
    players: [
      { name: "Billy Stanlake", rating: 74 },
      { name: "Binura Fernando", rating: 72 },
      { name: "Joshua Little", rating: 79 },
      { name: "Md Shoriful Islam", rating: 74 },
      { name: "Obed McCoy", rating: 70 },
      { name: "Wesley Agar", rating: 74 },
    ],
  },
  {
    setName: "UAL5-10",
    players: [
      { name: "Krains Fuletra", rating: 79 },
      { name: "Macneil Noronha", rating: 70 },
      { name: "Nikhil Chaudhary", rating: 72 },
      { name: "Jack Edwards", rating: 77 },
      { name: "Delano Potgieter", rating: 72 },
      { name: "Daksh Kamra", rating: 74 },
      { name: "Lalit Yadav", rating: 72 },
      { name: "Tiaan Van Vuuren", rating: 72 },
      { name: "Vihaan Malhotra", rating: 72 },
    ],
  },
  {
    setName: "UFA5-6",
    players: [
      { name: "Atal Rai", rating: 70 },
      { name: "Sadek Hussain", rating: 72 },
      { name: "Brijesh Sharma", rating: 78 },
      { name: "Srihari Nair", rating: 72 },
    ],
  },
];

export const MEGA_PLAYER_RATINGS = Object.fromEntries(
  MEGA_AUCTION_RATING_SETS.flatMap((set) =>
    set.players.map((player) => [player.name, player.rating])
  )
);

export const MEGA_AUCTION_SET_ORDER = MEGA_AUCTION_RATING_SETS.map((set) => ({
  setName: set.setName,
  playerNames: set.players.map((player) => player.name),
}));
