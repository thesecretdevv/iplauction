const fs = require('fs');
const path = require('path');

const miniPlayersRaw = `
Virat Kohli — 95
Rohit Sharma — 92
Suryakumar Yadav — 91
Shubman Gill — 90
Abhishek Sharma — 90
Yashasvi Jaiswal — 89
Shreyas Iyer — 89
Sai Sudharsan — 89
Ruturaj Gaikwad — 88
Rinku Singh — 88
Tilak Varma — 88
Shivam Dube — 87
Rajat Patidar — 86
Nitish Kumar Reddy — 84
Tim David — 84
Tristan Stubbs — 84
Dewald Brevis — 84
Ashutosh Sharma — 83
Ajinkya Rahane — 83
Shashank Singh — 82
Angkrish Raghuvanshi — 81
Aiden Markram — 81
David Miller — 81
Devdutt Padikkal — 81
Sherfane Rutherford — 81
Shimron Hetmyer — 80
Will Jacks — 80
Steve Smith — 80
Vaibhav Suryavanshi — 80
Ayush Mhatre — 80
Naman Dhir — 80
Digvesh Rathi — 80
Sarfaraz Khan — 79
Kamindu Mendis — 79
Nehal Wadhera — 79
Priyansh Arya — 79
Manish Pandey — 79
Prithvi Shaw — 79
Shahrukh Khan — 78
Abdul Samad — 78
Karun Nair — 77
Ryan Rickelton — 77
Ramandeep Singh — 77
Aniket Verma — 77
Urvil Patel — 76
Musheer Khan — 75
Vipraj Nigam — 74
Sameer Rizvi — 73
Rahul Tripathi — 72
Abhinav Manohar — 71
Yash Dhull — 70
Mohd. Arshad Khan — 70

Jasprit Bumrah — 96
Mitchell Starc — 91
Rashid Khan — 91
Sunil Narine — 90
Yuzvendra Chahal — 90
Pat Cummins — 89
Josh Hazlewood — 89
Arshdeep Singh — 89
Trent Boult — 89
Kuldeep Yadav — 89
Mohammad Shami — 88
Varun Chakravarthy — 88
Bhuvneshwar Kumar — 88
Jofra Archer — 87
Mohammad Siraj — 87
Kagiso Rabada — 86
Matheesha Pathirana — 85
Suyash Sharma — 85
Anrich Nortje — 84
Ravi Bishnoi — 84
T. Natarajan — 84
Jacob Duffy — 84
Noor Ahmad — 83
Matt Henry — 83
Deepak Chahar — 82
Sandeep Sharma — 82
Prasidh Krishna — 81
Lockie Ferguson — 81
Lungisani Ngidi — 81
Shardul Thakur — 81
Khaleel Ahmed — 81
Alzarri Joseph — 80
Harshit Rana — 80
Rahul Chahar — 80
Mayank Yadav — 80
Umesh Yadav — 80
Mustafizur Rahman — 79
Yash Dayal — 79
Avesh Khan — 79
Nathan Ellis — 78
Kyle Jamieson — 78
Vaibhav Arora — 78
Mukesh Kumar — 77
Mangesh Yadav — 77
Harshal Patel — 77
Karn Sharma — 77
Akash Deep — 76
Akash Madhwal — 76
Navdeep Saini — 75
Nuwan Thushara — 75
Mohsin Khan — 74
Yash Thakur — 74
Adam Milne — 73
Kartik Sharma — 73
Jhye Richardson — 72
Taskin Ahmed — 72
Kuldeep Sen — 72
Ashwani Kumar — 71
Shamar Joseph — 71
Prince Yadav — 71
Kuldip Yadav — 71

Sanju Samson — 89
Nicholas Pooran — 89
Ishan Kishan — 89
Rishabh Pant — 88
Jos Buttler — 88
KL Rahul — 88
Heinrich Klaasen — 86
Quinton De Kock — 86
Phil Salt — 86
Jitesh Sharma — 83
MS Dhoni — 82
Jonny Bairstow — 80
Prabhsimran Singh — 80
Rahmanullah Gurbaz — 79
Dhruv Jurel — 79
Josh Inglis — 79
Shai Hope — 75
K.S. Bharat — 73
Ben Duckett — 74
Jamie Smith — 72
Kusal Mendis — 71
Robin Minz — 64
Kumar Kushagra — 64
Vishnu Vinod — 64
Tim Seifert — 60

Hardik Pandya — 93
Ravindra Jadeja — 90
Axar Patel — 88
Cameron Green — 86
Krunal Pandya — 85
Marcus Stoinis — 84
Wanindu Hasaranga — 83
Mitchell Marsh — 83
Riyan Parag — 83
Romario Shepherd — 83
Liam Livingstone — 80
Sam Curran — 80
Marco Jansen — 80
Jason Holder — 80
Washington Sundar — 79
Venkatesh Iyer — 79
Glenn Phillips — 79
Azmatullah Omarzai — 77
Kyle Mayers — 76
Michael Bracewell — 74
Cooper Connolly — 74
Gulbadin Naib — 73
Dasun Shanaka — 72
Matthew Short — 72
Corbin Bosch — 72
Daniel Sams — 71
Roston Chase — 71
Jack Edwards — 71
Jamie Overton — 71
Tom Curran — 70
`;

const lines = miniPlayersRaw.split('\n');
const miniRatings = {};
lines.forEach(line => {
    if (line.includes('—')) {
        const [name, rating] = line.split('—').map(s => s.trim());
        if (name && rating) {
            miniRatings[name] = parseInt(rating);
        }
    }
});

const ratingsPath = '/Users/anuragtummapudi/Tum-Tum/boom/app/data/playerRatings.js';
let content = fs.readFileSync(ratingsPath, 'utf8');

const startTag = 'export const PLAYER_RATINGS = {';
const endTag = '};';

const startIndex = content.indexOf(startTag);
if (startIndex !== -1) {
    const endIndex = content.indexOf(endTag, startIndex);
    if (endIndex !== -1) {
        let newRatingsContent = startTag + '\n';
        for (const [name, rating] of Object.entries(miniRatings)) {
            newRatingsContent += `  "${name}": ${rating},\n`;
        }
        newRatingsContent += endTag;
        
        content = content.slice(0, startIndex) + newRatingsContent + content.slice(endIndex + endTag.length);
        fs.writeFileSync(ratingsPath, content);
        console.log('Successfully updated PLAYER_RATINGS in playerRatings.js');
    }
} else {
    console.error('Could not find PLAYER_RATINGS in playerRatings.js');
}
