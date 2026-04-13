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
  'yash raj punia': ['Yash Raj Punja'],
  'prithvi raj yarra': ['Prithviraj Yarra'],
  'varun chakravarthy': ['Varun Chakaravarthy', 'Varun Chakravarthy'],
  'varun chakaravarthy': ['Varun Chakaravarthy', 'Varun Chakravarthy'],
  'mohammad shami': ['Mohammed Shami', 'Mohammad Shami'],
  'mohammed shami': ['Mohammed Shami', 'Mohammad Shami'],
  'mohammad siraj': ['Mohammed Siraj', 'Mohammad Siraj'],
  'mohammed siraj': ['Mohammed Siraj', 'Mohammad Siraj'],
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
  "Suryakumar Yadav": 91,
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
  "Tim David": 87,
  "Tristan Stubbs": 84,
  "Dewald Brevis": 86,
  "Ashutosh Sharma": 83,
  "Ajinkya Rahane": 83,
  "Shashank Singh": 82,
  "Angkrish Raghuvanshi": 82,
  "Aiden Markram": 81,
  "David Miller": 81,
  "Devdutt Padikkal": 83,
  "Sherfane Rutherford": 81,
  "Shimron Hetmyer": 80,
  "Will Jacks": 80,
  "Steve Smith": 80,
  "Vaibhav Suryavanshi": 86,
  "Ayush Mhatre": 80,
  "Naman Dhir": 80,
  "Digvesh Rathi": 80,
  "Sarfaraz Khan": 79,
  "Kamindu Mendis": 79,
  "Nehal Wadhera": 79,
  "Priyansh Arya": 81,
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
  "Jasprit Bumrah": 96,
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
  "Bhuvneshwar Kumar": 88,
  "Jofra Archer": 86,
  "Mohammad Siraj": 87,
  "Kagiso Rabada": 86,
  "Matheesha Pathirana": 85,
  "Suyash Sharma": 85,
  "Anrich Nortje": 84,
  "Ravi Bishnoi": 84,
  "T. Natarajan": 84,
  "Jacob Duffy": 84,
  "Noor Ahmad": 85,
  "Matt Henry": 83,
  "Deepak Chahar": 82,
  "Sandeep Sharma": 84,
  "Prasidh Krishna": 81,
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
  "Mohsin Khan": 74,
  "Yash Thakur": 74,
  "Adam Milne": 73,
  "Kartik Sharma": 73,
  "Jhye Richardson": 72,
  "Taskin Ahmed": 72,
  "Kuldeep Sen": 72,
  "Ashwani Kumar": 71,
  "Shamar Joseph": 71,
  "Prince Yadav": 71,
  "Kuldip Yadav": 71,
  "Sanju Samson": 89,
  "Nicholas Pooran": 89,
  "Ishan Kishan": 89,
  "Rishabh Pant": 88,
  "Jos Buttler": 90,
  "KL Rahul": 89,
  "Heinrich Klaasen": 86,
  "Quinton De Kock": 86,
  "Phil Salt": 87,
  "Travis Head": 89,
  "Jitesh Sharma": 83,
  "MS Dhoni": 85,
  "Jonny Bairstow": 80,
  "Prabhsimran Singh": 82,
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
  "Mitchell Marsh": 83,
  "Riyan Parag": 84,
  "Romario Shepherd": 83,
  "Liam Livingstone": 80,
  "Sam Curran": 80,
  "Marco Jansen": 84,
  "Jason Holder": 80,
  "Washington Sundar": 82,
  "Venkatesh Iyer": 79,
  "Glenn Phillips": 79,
  "Azmatullah Omarzai": 77,
  "Kyle Mayers": 76,
  "Michael Bracewell": 74,
  "Cooper Connolly": 80,
  "Gulbadin Naib": 73,
  "Dasun Shanaka": 72,
  "Matthew Short": 72,
  "Corbin Bosch": 72,
  "Daniel Sams": 71,
  "Roston Chase": 71,
  "Jack Edwards": 71,
  "Jamie Overton": 71,
  "Tom Curran": 70,
};

// ──────────────────────────────────────────────────────────────
// UTILITY FUNCTION — Get a player's rating (strips "(WK)" tag)
// ──────────────────────────────────────────────────────────────
export function getPlayerRating(playerName, mode = 'mini') {
  if (!playerName) return 50;

  const R = mode === 'mega' ? MEGA_PLAYER_RATINGS : PLAYER_RATINGS;
  const candidates = getPlayerNameCandidates(playerName);
  for (const candidate of candidates) {
    if (R[candidate] !== undefined) return R[candidate];
  }

  const fallbackR = mode === 'mega' ? PLAYER_RATINGS : MEGA_PLAYER_RATINGS;
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
  return !!player?.overseas || String(player?.country || '').toLowerCase() !== 'india';
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
  if (value.includes('WK')) return 'wicket_keeper';
  if (value.includes('BOWL')) return 'bowler';
  if (value.includes('AR')) return 'all_rounder';
  return 'batsman';
}

export function calculateLeaderboard(teams, mode = 'mini') {
  const results = teams.map(team => {
    // If team just has player names:
    // This assumes team objects are formatted correctly.
    const squad = team.squad || []; // Array of complete player objects
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
      return {
        name: playerName,
        rating,
        role: normalizeRole(playerEntry?.role || pRecord?.role)
      };
    });

    const batCount = playerScores.filter(p => p.role === 'batsman').length;
    const bowlCount = playerScores.filter(p => p.role === 'bowler').length;
    const wkCount = playerScores.filter(p => p.role === 'wicket_keeper').length;
    
    // Disqualified if < 11 players OR fails role counts
    const isDisqualified = playingXI.length < 11 || batCount < 2 || bowlCount < 2 || wkCount < 1;
    
    const totalScore = playerScores.reduce((sum, p) => sum + p.rating, 0);
    return {
      teamId: team.teamId,
      teamName: team.teamName || team.teamId,
      totalScore,
      playerScores,
      averageScore: playingXI.length ? Math.round(totalScore / playingXI.length) : 0,
      playingXI,
      isDisqualified
    };
  });

  return results.sort((a, b) => {
    if (a.isDisqualified !== b.isDisqualified) return a.isDisqualified ? 1 : -1;
    return b.totalScore - a.totalScore;
  });
}

// ============================================================
// IPL 2026 MEGA AUCTION — COMPLETE PLAYER RATINGS (out of 100)
// ============================================================
export const MEGA_PLAYER_RATINGS = {
  // MARQUEE SET 1
  "Aiden Markram":       84,
  "Arshdeep Singh":      89,
  "Axar Patel":          88,
  "Bhuvneshwar Kumar":   88,
  "Hardik Pandya":       92,
  "Heinrich Klaasen":    86,
  "Ishan Kishan":        88,
  "Jasprit Bumrah":      96,
  "Jofra Archer":        87,
  "Jos Buttler":         90,
  "Josh Hazlewood":      89,
  "Kagiso Rabada":       86,
  "KL Rahul":            89,
  "Kuldeep Yadav":       89,
  "Lockie Ferguson":     83,
  "Marco Jansen":        80,
  "Marcus Stoinis":      84,
  "Mitchell Marsh":      83,
  "Quinton De Kock":     86,
  "Mitchell Starc":      91,
  "Mohammad Shami":      88,
  "Mohammad Siraj":      87,
  "MS Dhoni":            85,
  "Nicholas Pooran":     89,
  "Noor Ahmad":          85,
  "Pat Cummins":         89,
  "Phil Salt":           86,
  "Rashid Khan":         91,
  "Ravindra Jadeja":     90,
  "Rinku Singh":         88,
  "Rishabh Pant":        88,
  "Rohit Sharma":        92,
  "Ruturaj Gaikwad":     88,
  "Sam Curran":          80,
  "Sanju Samson":        89,
  "Shimron Hetmyer":     82,
  "Shivam Dube":         87,
  "Shreyas Iyer":        91,
  "Shubman Gill":        90,
  "Sunil Narine":        90,
  "Suryakumar Yadav":    91,
  "Tim David":           84,
  "Travis Head":         89,
  "Trent Boult":         89,
  "Varun Chakravarthy":  88,
  "Virat Kohli":         94,
  "Will Jacks":          80,
  "Yashasvi Jaiswal":    89,
  "Yuzvendra Chahal":    90,

  // SET 1
  "Abhishek Sharma":     90,
  "Vaibhav Suryavanshi":   86,
  "Deepak Chahar":       82,
  "Dhruv Jurel":         83,
  "Glenn Phillips":      82,
  "Khaleel Ahmed":       81,
  "Ayush Mhatre":          82,
  "Digvesh Rathi":         80,
  "Krunal Pandya":       85,
  "Mitchell Santner":    85,
  "Prasidh Krishna":     86,
  "Rajat Patidar":       86,
  "Riyan Parag":         83,
  "Romario Shepherd":    83,
  "Sai Sudharsan":       87,
  "Jitesh Sharma":       83,
  "Shardul Thakur":      81,
  "Sherfane Rutherford": 81,
  "T. Natarajan":        84,
  "Tilak Varma":         88,
  "Dewald Brevis":       84,
  "Anrich Nortje":       84,
  "Harshit Rana":        80,
  "Tristan Stubbs":      84,
  "Ajinkya Rahane":      83,
  "Rahul Tewatia":       80,
  "Jacob Duffy":         84,
  "Matheesha Pathirana": 85,
  "Matt Henry":          83,
  "Sandeep Sharma":      84,
  "Ravi Bishnoi":        86,
  "Nitish Kumar Reddy":  84,
  "Devdutt Padikkal":    81,
  "Cameron Green":       83,
  "David Miller":        84,
  "Washington Sundar":   81,
  "Angkrish Raghuvanshi":  82,

  // SET 2
  "Deepak Hooda":        71,
  "Allah Ghazanfar":     68,
  "Brydon Carse":        73,
  "Corbin Bosch":        72,
  "Cooper Connolly":       80,
  "Dushmantha Chameera": 76,
  "Jacob Bethell":       79,
  "Jamie Overton":       71,
  "Jaydev Unadkat":      77,
  "Mayank Yadav":        80,
  "Rovman Powell":       77,
  "Kamindu Mendis":      79,
  "Matthew Breetzke":    62,
  "Avesh Khan":          79,
  "Harshal Patel":       80,
  "Azmatullah Omarzai":  77,
  "Mitchell Owen":       73,
  "Mukesh Kumar":        77,
  "Nandre Burger":       77,
  "Nathan Ellis":        78,
  "Nitish Rana":         76,
  "Nuwan Thushara":      75,
  "Ryan Rickelton":      77,
  "Xavier Bartlett":     70,

  // SET 3
  "Ishant Sharma":       79,
  "Jayant Yadav":        69,
  "Karun Nair":          77,
  "Manish Pandey":       79,
  "R. Sai Kishore":      80,
  "Shahbaz Ahmed":       79,
  "Shahrukh Khan":       78,
  "Tushar Deshpande":    78,
  "Umran Malik":         76,
  "Yash Dayal":          79,

  // SET 4
  "Abdul Samad":           78,
  "Abhinandan Singh":      62,
  "Abhishek Porel":        79,
  "Ajay Mandal":           64,
  "Akash Singh":           64,
  "Aniket Verma":          77,
  "Anshul Kamboj":         77,
  "Anuj Rawat":            71,
  "Anukul Roy":            71,
  "Arjun Tendulkar":       69,
  "Arshin Kulkarni":       64,
  "Ashutosh Sharma":       83,
  "Ashwani Kumar":         71,
  "Ayush Badoni":          77,
  "Donovan Ferreira":      73,
  "Eshan Malinga":         72,
  "Gurjapneet Singh":      74,
  "Gurnoor Brar":          62,
  "Harnoor Pannu":         64,
  "Harpreet Brar":         78,
  "Harsh Dubey":           79,
  "Himmat Singh":          64,
  "Kumar Kushagra":        64,
  "Kwena Maphaka":         74,
  "Lhuan-dre Pretorius":   64,
  "Lhuan-Dre Pretorius":   64,
  "Lhuan-Dre Pretorious":  64,
  "M. Siddharth":          64,
  "Madhav Tiwari":         62,
  "Manav Suthar":          64,
  "Mayank Markande":       79,
  "Mohd. Arshad Khan":     70,
  "Mohsin Khan":           74,
  "Mukesh Choudhary":      79,
  "Musheer Khan":          75,
  "Naman Dhir":            80,
  "Nehal Wadhera":         79,
  "Nishant Sindhu":        64,
  "Prabhsimran Singh":     82,
  "Prince Yadav":          71,
  "Priyansh Arya":         81,
  "Pyla Avinash":          62,
  "Raghu Sharma":          62,
  "Raj Angad Bawa":        64,
  "Ramakrishna Ghosh":     62,
  "Ramandeep Singh":       77,
  "Rasikh Salam":          72,
  "Robin Minz":            64,
  "Sameer Rizvi":          83,
  "Shashank Singh":        82,
  "Shreyas Gopal":         79,
  "Shubham Dubey":         68,
  "Smaran Ravichandaran":  72,
  "Suryansh Shedge":       64,
  "Suyash Sharma":         85,
  "Swapnil Singh":         72,
  "Tripurana Vijay":       64,
  "Urvil Patel":           76,
  "Vaibhav Arora":         80,
  "Vipraj Nigam":          74,
  "Vishnu Vinod":          64,
  "Vyshak Vijaykumar":     77,
  "Yash Thakur":           74,
  "Yudhvir Charak":        61,
  "Zeeshan Ansari":        74,

  // BA1
  "Devon Conway":        78,
  "Jake Fraser-McGurk":  79,
  "Prithvi Shaw":         79,
  "Sarfaraz Khan":       79,

  // AL1
  "Gus Atkinson":        72,
  "Liam Livingstone":    80,
  "Rachin Ravindra":     80,
  "Venkatesh Iyer":      79,
  "Wanindu Hasaranga":   83,
  "Wiaan Mulder":        66,

  // WK1
  "Ben Duckett":         74,
  "Finn Allen":          81,
  "Jamie Smith":         72,
  "Jonny Bairstow":      82,
  "K.S. Bharat":         73,
  "Rahmanullah Gurbaz":  79,

  // FA1
  "Akash Deep":          76,
  "Fazalhaq Farooqi":    79,
  "Gerald Coetzee":      78,
  "Shivam Mavi":         75,
  "Spencer Johnson":     76,

  // SP1
  "Akeal Hosein":        74,
  "Maheesh Theekshana":  78,
  "Mujeeb Rahman":       76,
  "Rahul Chahar":        80,

  // UBA1
  "Aarya Desai":         60,
  "Abhinav Manohar":     71,
  "Abhinav Tejrana":     60,
  "Anmolpreet Singh":    62,
  "Atharva Taide":       62,
  "Yash Dhull":          70,

  // UAL1
  "Auqib Dar":           64,
  "Edhen Tom":           60,
  "Kamlesh Nagarkoti":   71,
  "Mahipal Lomror":      72,
  "Prashant Veer":       76,
  "Rajvardhan Hangargekar": 64,
  "Sanvir Singh":        70,
  "Shivang Kumar":       79,
  "Tanush Kotian":       64,
  "Vijay Shankar":       72,

  // UWK1
  "Kartik Sharma":       73,
  "Mukul Choudhary":     80,
  "Ruchit Ahir":         60,
  "Tejasvi Singh":       62,
  "Tushar Raheja":       60,
  "Vansh Bedi":          60,

  // UFA1
  "Akash Madhwal":       76,
  "Ashok Sharma":        64,
  "Kartik Tyagi":        77,
  "Naman Tiwari":        64,
  "Raj Limbani":         69,
  "Simarjeet Singh":     67,
  "Sushant Mishra":      64,

  // USP1
  "Karn Sharma":         77,
  "Kumar Kartikeya Singh": 64,
  "Prashant Solanki":    64,
  "Shivam Shukla":       60,
  "Vignesh Puthur":      71,
  "Wahidullah Zadran":   62,
  "Yash Raj Punja":      64,

  // BA2
  "Ackeem Auguste":      64,
  "Mayank Agarwal":      76,
  "Pathum Nissanka":     76,
  "Rahul Tripathi":      72,
  "Reeza Hendricks":     63,
  "Sediqullah Atal":     64,
  "Steve Smith":         80,
  "Tim Robinson":        68,

  // AL2
  "Ben Dwarshuis":       62,
  "Daniel Sams":         71,
  "Daryl Mitchell":      74,
  "Dasun Shanaka":       72,
  "Jason Holder":        80,
  "Matthew Short":       72,
  "Michael Bracewell":   74,
  "Sean Abbott":         72,
  "Zak Foulkes":         70,

  // WK2
  "Benjamin McDermott":  60,
  "Jordan Cox":          69,
  "Josh Inglis":         79,
  "Kusal Mendis":        71,
  "Kusal Perera":        60,
  "Shai Hope":           75,
  "Tim Seifert":         60,
  "Tom Banton":          70,

  // FA2
  "Adam Milne":          73,
  "Chetan Sakariya":     72,
  "Kuldeep Sen":         72,
  "Kyle Jamieson":       78,
  "Lungisani Ngidi":     84,
  "Mustafizur Rahman":   79,
  "Saqib Mahmood":       65,
  "Umesh Yadav":         80,
  "William Orourke":     68,

  // SP2
  "Mohammad Waqar Salamkheil": 64,
  "Qais Ahmad":                62,
  "Rishad Hossain":            60,
  "Viyaskanth Vijayakanth":    62,

  // UBA2
  "Akshat Raghuwanshi":  64,
  "Aman Rao Perala":     60,
  "Ankit Kumar":         60,
  "Danish Malewar":      62,
  "Manan Vohra":         62,
  "Pukhraj Mann":        60,
  "Rohan Kunnummal":     62,
  "Salman Nizar":        60,

  // UAL2
  "Aman Khan":           77,
  "Darshan Nalkande":    62,
  "Harsh Tyagi":         62,
  "Mangesh Yadav":       77,
  "Mayank Rawat":        62,
  "Sairaj Patil":        60,
  "Satvik Deswal":       62,
  "Suyash Prabhudessai": 62,
  "Vicky Ostwal":        61,
  "Yuvraj Chaudhary":    60,

  // UWK2
  "Abhishek Pathak":     60,
  "Kunal Rathore":       60,
  "Rahul Buddhi":        62,
  "Ravi Singh":          62,
  "Ricky Bhui":          66,
  "Salil Arora":         79,
  "Saurav Chauhan":      60,
  "Yashvardhan Dalal":   60,

  // UFA2
  "K.M Asif":              62,
  "Mohammad Izhar":        62,
  "Onkar Tarmale":         67,
  "Prithviraj Yarra":      64,
  "PV.Satyanarayana Raju": 60,
  "Sakib Hussain":         68,
  "Vidwath Kaverappa":     64,
  "Vidyadhar Patil":       60,
  "Vijay Kumar":           60,

  // USP2
  "Bailapudi Yeswanth":    60,
  "Himanshu Sharma":       60,
  "K.C. Cariappa":         62,
  "Kartik Chadha":         60,
  "Mohit Rathee":          62,
  "Murugan Ashwin":        74,
  "Pravin Dubey":          64,
  "Shubham Agrawal":       62,
  "Tejas Baroka":          60,

  // AL3
  "Beau Webster":          65,
  "Bevon-John Jacobs":     62,
  "Daniel Lawrence":       63,
  "George Linde":          66,
  "Gulbadin Naib":         73,
  "Rehan Ahmed":           62,
  "Tom Curran":            70,
  "William Sutherland":    64,

  // FA3
  "Alzarri Joseph":      80,
  "Jhye Richardson":     72,
  "Luke Wood":           62,
  "Navdeep Saini":       75,
  "Naveen Ul Haq":       73,
  "Richard Gleeson":     64,
  "Riley Meredith":      62,
  "Shamar Joseph":       71,
  "Taskin Ahmed":        72,

  // UBA3
  "Adarsh Singh":        60,
  "Arsh Kabir Ranga":    60,
  "Ayush Doseja":        60,
  "Bhanu Pania":         60,
  "Kunal Chandela":      60,
  "M.Dheeraj Kumar":     60,
  "Qamran Iqbal":        60,
  "Sahil Parakh":        64,

  // UAL3
  "Abid Mushtaq":        60,
  "Atit Sheth":          62,
  "Hritik Shokeen":      62,
  "Jagadeesha Suchith":  64,
  "Jalaj Saxena":        64,
  "Manoj Bhandage":      60,
  "Manvanth Kumar":      60,
  "Mayank Dagar":        71,
  "Raghav Goyal":        60,
  "Tanay Thyagarajann":  60,

  // UWK3
  "Ajitesh Guruswamy":   60,
  "Bipin Saurabh":       60,
  "Connor Esterhuizen":  62,
  "Hardik Tamore":       60,
  "Joe Clarke":          62,
  "Siddharth Joon":      60,
  "Tom Moores":          62,
  "Vishnu Solanki":      66,

  // UFA3
  "Abhilash Shetty":     60,
  "Arpit Guleria":       60,
  "Divesh Sharma":       60,
  "Irfan Umair":         60,
  "Kuldip Yadav":        71,
  "Money Grewal":        60,
  "Sayan Ghosh":         60,
  "Sunil Kumar":         60,
  "Tristan Luus":        62,

  // USP3
  "Amit Kumar":          62,
  "Chintal Gandhi":      60,
  "Dharmendrasinh Jadeja": 60,
  "Jhathavedh Subramanyan": 60,
  "Manan Bhardwaj":      60,
  "Parikshit Dhanak":    62,
  "Saumy Pandey":        60,
  "Shreyas Chavan":      42,
  "Vishal Nishad":       64,

  // AL4
  "Charith Asalanka":    70,
  "Dunith Wellalage":    60,
  "Dwaine Pretorius":    62,
  "George Garton":       60,
  "Kyle Mayers":         76,
  "Liam Dawson":         72,
  "Muhammad Abbas":      64,
  "Nathan Smith":        64,
  "Roston Chase":        71,

  // FA4
  "Jason Behrendorff":   73,
  "Joshua Tongue":       63,
  "Matthew Potts":       72,
  "Nahid Rana":          60,
  "Olly Stone":          62,
  "Sandeep Warrier":     72,
  "Tanzim Hasan Sakib":  62,

  // UBA4
  "Aaron Varghese":      60,
  "Ahammed Imran":       60,
  "Ayaz Khan":           60,
  "Daniel Lategan":      60,
  "Miles Hammond":       62,
  "Sachin Dhas":         60,
  "Siddhant Rana":       60,
  "Vishvarajsinh Jadeja": 60,

  // UAL4
  "Abdul Bazith":        60,
  "Atharva Ankolekar":   64,
  "Ayush Vartak":        60,
  "Karan Lal":           60,
  "Prince Rai":          60,
  "Ripal Patel":         60,
  "Sanjay Yadav":        60,
  "Shams Mulani":        62,
  "Utkarsh Singh":       60,
  "Vivrant Sharma":      62,

  // UFA4
  "Esakkimuthu Ayyakutti": 60,
  "Ishan Porel":           64,
  "Kulwant Khejroliya":    60,
  "Pankaj Jaswal":         60,
  "Praful Hinge":          69,
  "Rajan Kumar":           60,
  "Ravi Kumar":            60,
  "Safvan Patel":          60,
  "Sayed Irfan Aftab":     60,

  // USP4
  "Arab Gul":            62,
  "Izaz Sawariya":       60,
  "Jikku Bright":        60,
  "Naman Pushpak":       60,
  "Purav Agarwal":       60,
  "Rakibul Hasan":       62,
  "Roshan Wagshare":     60,
  "Traveen Mathew":      60,
  "Yash Dicholkar":      60,

  // FA5
  "Billy Stanlake":      64,
  "Binura Fernando":     64,
  "Joshua Little":       71,
  "Md Shoriful Islam":   64,
  "Obed McCoy":          60,
  "Wesley Agar":         64,

  // UAL5-10
  "Krains Fuletra":      69,
  "Macneil Noronha":     60,
  "Nikhil Chaudhary":    62,
  "Ninad Rathva":        60,
  "R Rajkumar":          60,
  "R.S Ambrish":         60,
  "R.Sonu Yadav":        60,
  "Shivalik Sharma":     60,
  "Siddharth Yadav":     60,
  "Sunny Sandhu":        60,

  "Bal Krishna":         60,
  "Delano Potgieter":    62,
  "Emanjot Chahal":      60,
  "Hardik Raj":          60,
  "Khilan Patel":        60,
  "Parth Rekhade":       60,
  "Sarthak Ranjan":      62,
  "Shubhang Hegde":      60,
  "Tiaan Van Vuuren":    62,
  "Vihaan Malhotra":     62,

  "Abhimanyusingh Rajput": 60,
  "Akash Pugazhanthi":     60,
  "Arpit Rana":            60,
  "Himanshu Bisht":        60,
  "Kanishk Chouhan":       62,
  "Maramreddy Reddy":      60,
  "Mayank Gusain":         60,
  "Sagar Solanki":         60,
  "Shreyan Chakraborty":   60,
  "Shubham Rana":          60,

  "Anuj Thakral":          60,
  "Arfaz Mohammad":        60,
  "Aryaman Singh Dhaliwal": 60,
  "Daksh Kamra":           64,
  "Hemang Patel":          60,
  "Lalit Yadav":           62,
  "Mridul Surroch":        60,
  "Nitin Sai Yadav":       60,
  "Parth Vats":            60,
  "Vishal Mandwal":        60,

  "Akhil Scaria":          60,
  "Ishan Mulchandani":     60,
  "K.Ajay Singh":          60,
  "Krish Bhagat":          60,
  "Luckyrajsinh Vaghela":  60,
  "Muhammed Sharafuddeen": 60,
  "Nasir Lone":            60,
  "Prerit Dutta":          60,
  "Ritik Tada":            60,
  "Sammar Gajjar":         60,

  "Akshu Bajwa":           60,
  "Dhurmil Matkar":        60,
  "Dian Forrester":        60,
  "Jack Edwards":          71,
  "Madhav Bajaj":          60,
  "Mohamed Ali":           60,
  "Parikshit Valsangkar":  60,
  "Rishabh Chauhan":       60,
  "Shiva Singh":           60,
  "Varun Raj Singh Bisht": 60,

  // UFA5-6
  "Atal Rai":            60,
  "Atif Mushtaq":        60,
  "C.Rakshann Readdi":   60,
  "Deependra Singh":     60,
  "Manish Reddy":        60,
  "Nishanth Saranu":     60,
  "Rajat Verma":         60,
  "Rohit Yadav":         60,
  "Waseem Khanday":      60,

  "Aaqib Khan":          60,
  "Aman Shekhawat":      60,
  "Bayanda Majola":      60,
  "Brijesh Sharma":      62,
  "Sabir Khan":          60,
  "Sadek Hussain":       69,
  "Shreevatsha Acharya": 60,
  "Shubham Kapse":       60,
  "Srihari Nair":        62,
};

export const MEGA_AUCTION_SET_ORDER = [
  {
    setName: "Marquee Set 1",
    playerNames: [
    "Aiden Markram",
    "Arshdeep Singh",
    "Axar Patel",
    "Bhuvneshwar Kumar",
    "Hardik Pandya",
    "Heinrich Klaasen",
    "Ishan Kishan",
    "Jasprit Bumrah",
    "Jofra Archer",
    "Jos Buttler",
    "Josh Hazlewood",
    "Kagiso Rabada",
    "KL Rahul",
    "Kuldeep Yadav",
    "Lockie Ferguson",
    "Marco Jansen",
    "Marcus Stoinis",
    "Mitchell Marsh",
    "Quinton De Kock",
    "Mitchell Starc",
    "Mohammad Shami",
    "Mohammad Siraj",
    "MS Dhoni",
    "Nicholas Pooran",
    "Noor Ahmad",
    "Pat Cummins",
    "Phil Salt",
    "Rashid Khan",
    "Ravindra Jadeja",
    "Rinku Singh",
    "Rishabh Pant",
    "Rohit Sharma",
    "Ruturaj Gaikwad",
    "Sam Curran",
    "Sanju Samson",
    "Shimron Hetmyer",
    "Shivam Dube",
    "Shreyas Iyer",
    "Shubman Gill",
    "Sunil Narine",
    "Suryakumar Yadav",
    "Tim David",
    "Travis Head",
    "Trent Boult",
    "Varun Chakravarthy",
    "Virat Kohli",
    "Will Jacks",
    "Yashasvi Jaiswal",
    "Yuzvendra Chahal"
    ],
  },
  {
    setName: "Set 1",
    playerNames: [
    "Abhishek Sharma",
    "Vaibhav Suryavanshi",
    "Deepak Chahar",
    "Dhruv Jurel",
    "Glenn Phillips",
    "Khaleel Ahmed",
    "Ayush Mhatre",
    "Digvesh Rathi",
    "Krunal Pandya",
    "Mitchell Santner",
    "Prasidh Krishna",
    "Rajat Patidar",
    "Riyan Parag",
    "Romario Shepherd",
    "Sai Sudharsan",
    "Jitesh Sharma",
    "Shardul Thakur",
    "Sherfane Rutherford",
    "T. Natarajan",
    "Tilak Varma",
    "Dewald Brevis",
    "Anrich Nortje",
    "Harshit Rana",
    "Tristan Stubbs",
    "Ajinkya Rahane",
    "Rahul Tewatia",
    "Jacob Duffy",
    "Matheesha Pathirana",
    "Matt Henry",
    "Sandeep Sharma",
    "Ravi Bishnoi",
    "Nitish Kumar Reddy",
    "Devdutt Padikkal",
    "Cameron Green",
    "David Miller",
    "Washington Sundar",
    "Angkrish Raghuvanshi"
    ],
  },
  {
    setName: "Set 2",
    playerNames: [
    "Deepak Hooda",
    "Allah Ghazanfar",
    "Brydon Carse",
    "Corbin Bosch",
    "Cooper Connolly",
    "Dushmantha Chameera",
    "Jacob Bethell",
    "Jamie Overton",
    "Jaydev Unadkat",
    "Mayank Yadav",
    "Rovman Powell",
    "Kamindu Mendis",
    "Matthew Breetzke",
    "Avesh Khan",
    "Harshal Patel",
    "Azmatullah Omarzai",
    "Mitchell Owen",
    "Mukesh Kumar",
    "Nandre Burger",
    "Nathan Ellis",
    "Nitish Rana",
    "Nuwan Thushara",
    "Ryan Rickelton",
    "Xavier Bartlett"
    ],
  },
  {
    setName: "Set 3",
    playerNames: [
    "Ishant Sharma",
    "Jayant Yadav",
    "Karun Nair",
    "Manish Pandey",
    "R. Sai Kishore",
    "Shahbaz Ahmed",
    "Shahrukh Khan",
    "Tushar Deshpande",
    "Umran Malik",
    "Yash Dayal"
    ],
  },
  {
    setName: "Set 4",
    playerNames: [
    "Abdul Samad",
    "Abhinandan Singh",
    "Abhishek Porel",
    "Ajay Mandal",
    "Akash Singh",
    "Aniket Verma",
    "Anshul Kamboj",
    "Anuj Rawat",
    "Anukul Roy",
    "Arjun Tendulkar",
    "Arshin Kulkarni",
    "Ashutosh Sharma",
    "Ashwani Kumar",
    "Ayush Badoni",
    "Donovan Ferreira",
    "Eshan Malinga",
    "Gurjapneet Singh",
    "Gurnoor Brar",
    "Harnoor Pannu",
    "Harpreet Brar",
    "Harsh Dubey",
    "Himmat Singh",
    "Kumar Kushagra",
    "Kwena Maphaka",
    "Lhuan-dre Pretorius",
    "Lhuan-Dre Pretorius",
    "Lhuan-Dre Pretorious",
    "M. Siddharth",
    "Madhav Tiwari",
    "Manav Suthar",
    "Mayank Markande",
    "Mohd. Arshad Khan",
    "Mohsin Khan",
    "Mukesh Choudhary",
    "Musheer Khan",
    "Naman Dhir",
    "Nehal Wadhera",
    "Nishant Sindhu",
    "Prabhsimran Singh",
    "Prince Yadav",
    "Priyansh Arya",
    "Pyla Avinash",
    "Raghu Sharma",
    "Raj Angad Bawa",
    "Ramakrishna Ghosh",
    "Ramandeep Singh",
    "Rasikh Salam",
    "Robin Minz",
    "Sameer Rizvi",
    "Shashank Singh",
    "Shreyas Gopal",
    "Shubham Dubey",
    "Smaran Ravichandaran",
    "Suryansh Shedge",
    "Suyash Sharma",
    "Swapnil Singh",
    "Tripurana Vijay",
    "Urvil Patel",
    "Vaibhav Arora",
    "Vipraj Nigam",
    "Vishnu Vinod",
    "Vyshak Vijaykumar",
    "Yash Thakur",
    "Yudhvir Charak",
    "Zeeshan Ansari"
    ],
  },
  {
    setName: "BA1",
    playerNames: [
    "Devon Conway",
    "Jake Fraser-McGurk",
    "Prithvi Shaw",
    "Sarfaraz Khan"
    ],
  },
  {
    setName: "AL1",
    playerNames: [
    "Gus Atkinson",
    "Liam Livingstone",
    "Rachin Ravindra",
    "Venkatesh Iyer",
    "Wanindu Hasaranga",
    "Wiaan Mulder"
    ],
  },
  {
    setName: "WK1",
    playerNames: [
    "Ben Duckett",
    "Finn Allen",
    "Jamie Smith",
    "Jonny Bairstow",
    "K.S. Bharat",
    "Rahmanullah Gurbaz"
    ],
  },
  {
    setName: "FA1",
    playerNames: [
    "Akash Deep",
    "Fazalhaq Farooqi",
    "Gerald Coetzee",
    "Shivam Mavi",
    "Spencer Johnson"
    ],
  },
  {
    setName: "SP1",
    playerNames: [
    "Akeal Hosein",
    "Maheesh Theekshana",
    "Mujeeb Rahman",
    "Rahul Chahar"
    ],
  },
  {
    setName: "UBA1",
    playerNames: [
    "Aarya Desai",
    "Abhinav Manohar",
    "Abhinav Tejrana",
    "Anmolpreet Singh",
    "Atharva Taide",
    "Yash Dhull"
    ],
  },
  {
    setName: "UAL1",
    playerNames: [
    "Auqib Dar",
    "Edhen Tom",
    "Kamlesh Nagarkoti",
    "Mahipal Lomror",
    "Prashant Veer",
    "Rajvardhan Hangargekar",
    "Sanvir Singh",
    "Shivang Kumar",
    "Tanush Kotian",
    "Vijay Shankar"
    ],
  },
  {
    setName: "UWK1",
    playerNames: [
    "Kartik Sharma",
    "Mukul Choudhary",
    "Ruchit Ahir",
    "Tejasvi Singh",
    "Tushar Raheja",
    "Vansh Bedi"
    ],
  },
  {
    setName: "UFA1",
    playerNames: [
    "Akash Madhwal",
    "Ashok Sharma",
    "Kartik Tyagi",
    "Naman Tiwari",
    "Raj Limbani",
    "Simarjeet Singh",
    "Sushant Mishra"
    ],
  },
  {
    setName: "USP1",
    playerNames: [
    "Karn Sharma",
    "Kumar Kartikeya Singh",
    "Prashant Solanki",
    "Shivam Shukla",
    "Vignesh Puthur",
    "Wahidullah Zadran",
    "Yash Raj Punja"
    ],
  },
  {
    setName: "BA2",
    playerNames: [
    "Ackeem Auguste",
    "Mayank Agarwal",
    "Pathum Nissanka",
    "Rahul Tripathi",
    "Reeza Hendricks",
    "Sediqullah Atal",
    "Steve Smith",
    "Tim Robinson"
    ],
  },
  {
    setName: "AL2",
    playerNames: [
    "Ben Dwarshuis",
    "Daniel Sams",
    "Daryl Mitchell",
    "Dasun Shanaka",
    "Jason Holder",
    "Matthew Short",
    "Michael Bracewell",
    "Sean Abbott",
    "Zak Foulkes"
    ],
  },
  {
    setName: "WK2",
    playerNames: [
    "Benjamin McDermott",
    "Jordan Cox",
    "Josh Inglis",
    "Kusal Mendis",
    "Kusal Perera",
    "Shai Hope",
    "Tim Seifert",
    "Tom Banton"
    ],
  },
  {
    setName: "FA2",
    playerNames: [
    "Adam Milne",
    "Chetan Sakariya",
    "Kuldeep Sen",
    "Kyle Jamieson",
    "Lungisani Ngidi",
    "Mustafizur Rahman",
    "Saqib Mahmood",
    "Umesh Yadav",
    "William Orourke"
    ],
  },
  {
    setName: "SP2",
    playerNames: [
    "Mohammad Waqar Salamkheil",
    "Qais Ahmad",
    "Rishad Hossain",
    "Viyaskanth Vijayakanth"
    ],
  },
  {
    setName: "UBA2",
    playerNames: [
    "Akshat Raghuwanshi",
    "Aman Rao Perala",
    "Ankit Kumar",
    "Danish Malewar",
    "Manan Vohra",
    "Pukhraj Mann",
    "Rohan Kunnummal",
    "Salman Nizar"
    ],
  },
  {
    setName: "UAL2",
    playerNames: [
    "Aman Khan",
    "Darshan Nalkande",
    "Harsh Tyagi",
    "Mangesh Yadav",
    "Mayank Rawat",
    "Sairaj Patil",
    "Satvik Deswal",
    "Suyash Prabhudessai",
    "Vicky Ostwal",
    "Yuvraj Chaudhary"
    ],
  },
  {
    setName: "UWK2",
    playerNames: [
    "Abhishek Pathak",
    "Kunal Rathore",
    "Rahul Buddhi",
    "Ravi Singh",
    "Ricky Bhui",
    "Salil Arora",
    "Saurav Chauhan",
    "Yashvardhan Dalal"
    ],
  },
  {
    setName: "UFA2",
    playerNames: [
    "K.M Asif",
    "Mohammad Izhar",
    "Onkar Tarmale",
    "Prithviraj Yarra",
    "PV.Satyanarayana Raju",
    "Sakib Hussain",
    "Vidwath Kaverappa",
    "Vidyadhar Patil",
    "Vijay Kumar"
    ],
  },
  {
    setName: "USP2",
    playerNames: [
    "Bailapudi Yeswanth",
    "Himanshu Sharma",
    "K.C. Cariappa",
    "Kartik Chadha",
    "Mohit Rathee",
    "Murugan Ashwin",
    "Pravin Dubey",
    "Shubham Agrawal",
    "Tejas Baroka"
    ],
  },
  {
    setName: "AL3",
    playerNames: [
    "Beau Webster",
    "Bevon-John Jacobs",
    "Daniel Lawrence",
    "George Linde",
    "Gulbadin Naib",
    "Rehan Ahmed",
    "Tom Curran",
    "William Sutherland"
    ],
  },
  {
    setName: "FA3",
    playerNames: [
    "Alzarri Joseph",
    "Jhye Richardson",
    "Luke Wood",
    "Navdeep Saini",
    "Naveen Ul Haq",
    "Richard Gleeson",
    "Riley Meredith",
    "Shamar Joseph",
    "Taskin Ahmed"
    ],
  },
  {
    setName: "UBA3",
    playerNames: [
    "Adarsh Singh",
    "Arsh Kabir Ranga",
    "Ayush Doseja",
    "Bhanu Pania",
    "Kunal Chandela",
    "M.Dheeraj Kumar",
    "Qamran Iqbal",
    "Sahil Parakh"
    ],
  },
  {
    setName: "UAL3",
    playerNames: [
    "Abid Mushtaq",
    "Atit Sheth",
    "Hritik Shokeen",
    "Jagadeesha Suchith",
    "Jalaj Saxena",
    "Manoj Bhandage",
    "Manvanth Kumar",
    "Mayank Dagar",
    "Raghav Goyal",
    "Tanay Thyagarajann"
    ],
  },
  {
    setName: "UWK3",
    playerNames: [
    "Ajitesh Guruswamy",
    "Bipin Saurabh",
    "Connor Esterhuizen",
    "Hardik Tamore",
    "Joe Clarke",
    "Siddharth Joon",
    "Tom Moores",
    "Vishnu Solanki"
    ],
  },
  {
    setName: "UFA3",
    playerNames: [
    "Abhilash Shetty",
    "Arpit Guleria",
    "Divesh Sharma",
    "Irfan Umair",
    "Kuldip Yadav",
    "Money Grewal",
    "Sayan Ghosh",
    "Sunil Kumar",
    "Tristan Luus"
    ],
  },
  {
    setName: "USP3",
    playerNames: [
    "Amit Kumar",
    "Chintal Gandhi",
    "Dharmendrasinh Jadeja",
    "Jhathavedh Subramanyan",
    "Manan Bhardwaj",
    "Parikshit Dhanak",
    "Saumy Pandey",
    "Shreyas Chavan",
    "Vishal Nishad"
    ],
  },
  {
    setName: "AL4",
    playerNames: [
    "Charith Asalanka",
    "Dunith Wellalage",
    "Dwaine Pretorius",
    "George Garton",
    "Kyle Mayers",
    "Liam Dawson",
    "Muhammad Abbas",
    "Nathan Smith",
    "Roston Chase"
    ],
  },
  {
    setName: "FA4",
    playerNames: [
    "Jason Behrendorff",
    "Joshua Tongue",
    "Matthew Potts",
    "Nahid Rana",
    "Olly Stone",
    "Sandeep Warrier",
    "Tanzim Hasan Sakib"
    ],
  },
  {
    setName: "UBA4",
    playerNames: [
    "Aaron Varghese",
    "Ahammed Imran",
    "Ayaz Khan",
    "Daniel Lategan",
    "Miles Hammond",
    "Sachin Dhas",
    "Siddhant Rana",
    "Vishvarajsinh Jadeja"
    ],
  },
  {
    setName: "UAL4",
    playerNames: [
    "Abdul Bazith",
    "Atharva Ankolekar",
    "Ayush Vartak",
    "Karan Lal",
    "Prince Rai",
    "Ripal Patel",
    "Sanjay Yadav",
    "Shams Mulani",
    "Utkarsh Singh",
    "Vivrant Sharma"
    ],
  },
  {
    setName: "UFA4",
    playerNames: [
    "Esakkimuthu Ayyakutti",
    "Ishan Porel",
    "Kulwant Khejroliya",
    "Pankaj Jaswal",
    "Praful Hinge",
    "Rajan Kumar",
    "Ravi Kumar",
    "Safvan Patel",
    "Sayed Irfan Aftab"
    ],
  },
  {
    setName: "USP4",
    playerNames: [
    "Arab Gul",
    "Izaz Sawariya",
    "Jikku Bright",
    "Naman Pushpak",
    "Purav Agarwal",
    "Rakibul Hasan",
    "Roshan Wagshare",
    "Traveen Mathew",
    "Yash Dicholkar"
    ],
  },
  {
    setName: "FA5",
    playerNames: [
    "Billy Stanlake",
    "Binura Fernando",
    "Joshua Little",
    "Md Shoriful Islam",
    "Obed McCoy",
    "Wesley Agar"
    ],
  },
  {
    setName: "UAL5-10",
    playerNames: [
    "Krains Fuletra",
    "Macneil Noronha",
    "Nikhil Chaudhary",
    "Ninad Rathva",
    "R Rajkumar",
    "R.S Ambrish",
    "R.Sonu Yadav",
    "Shivalik Sharma",
    "Siddharth Yadav",
    "Sunny Sandhu",
    "Bal Krishna",
    "Delano Potgieter",
    "Emanjot Chahal",
    "Hardik Raj",
    "Khilan Patel",
    "Parth Rekhade",
    "Sarthak Ranjan",
    "Shubhang Hegde",
    "Tiaan Van Vuuren",
    "Vihaan Malhotra",
    "Abhimanyusingh Rajput",
    "Akash Pugazhanthi",
    "Arpit Rana",
    "Himanshu Bisht",
    "Kanishk Chouhan",
    "Maramreddy Reddy",
    "Mayank Gusain",
    "Sagar Solanki",
    "Shreyan Chakraborty",
    "Shubham Rana",
    "Anuj Thakral",
    "Arfaz Mohammad",
    "Aryaman Singh Dhaliwal",
    "Daksh Kamra",
    "Hemang Patel",
    "Lalit Yadav",
    "Mridul Surroch",
    "Nitin Sai Yadav",
    "Parth Vats",
    "Vishal Mandwal",
    "Akhil Scaria",
    "Ishan Mulchandani",
    "K.Ajay Singh",
    "Krish Bhagat",
    "Luckyrajsinh Vaghela",
    "Muhammed Sharafuddeen",
    "Nasir Lone",
    "Prerit Dutta",
    "Ritik Tada",
    "Sammar Gajjar",
    "Akshu Bajwa",
    "Dhurmil Matkar",
    "Dian Forrester",
    "Jack Edwards",
    "Madhav Bajaj",
    "Mohamed Ali",
    "Parikshit Valsangkar",
    "Rishabh Chauhan",
    "Shiva Singh",
    "Varun Raj Singh Bisht"
    ],
  },
  {
    setName: "UFA5-6",
    playerNames: [
    "Atal Rai",
    "Atif Mushtaq",
    "C.Rakshann Readdi",
    "Deependra Singh",
    "Manish Reddy",
    "Nishanth Saranu",
    "Rajat Verma",
    "Rohit Yadav",
    "Waseem Khanday",
    "Aaqib Khan",
    "Aman Shekhawat",
    "Bayanda Majola",
    "Brijesh Sharma",
    "Sabir Khan",
    "Sadek Hussain",
    "Shreevatsha Acharya",
    "Shubham Kapse",
    "Srihari Nair"
    ],
  }
];
