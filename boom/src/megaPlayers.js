// IPL 2025 Mega Auction - Official Player Sets
// Role keys: BAT=Batter, BOWL=Bowler, AR=All-Rounder, WK=Wicket-Keeper
// OS = overseas

const p = (name, role, os, base) => ({ name, role, overseas: os, base });
const I = false, O = true;

export const MEGA_SETS = [
    {
        id: "MQ1", name: "Marquee Set 1", players: [
            p("Aiden Markram", "BAT", O, 2), p("Arshdeep Singh", "BOWL", I, 2), p("Axar Patel", "AR", I, 2), p("Bhuvneshwar Kumar", "BOWL", I, 2),
            p("Hardik Pandya", "AR", I, 2), p("Heinrich Klaasen", "WK", O, 2), p("Ishan Kishan", "WK", I, 2), p("Jasprit Bumrah", "BOWL", I, 2),
            p("Jofra Archer", "BOWL", O, 2), p("Jos Buttler", "WK", O, 2), p("Josh Hazlewood", "BOWL", O, 2), p("Kagiso Rabada", "BOWL", O, 2),
            p("KL Rahul", "WK", I, 2), p("Kuldeep Yadav", "BOWL", I, 2), p("Lockie Ferguson", "BOWL", O, 2), p("Marco Jansen", "AR", O, 2),
            p("Marcus Stoinis", "AR", O, 2), p("Mitchell Marsh", "AR", O, 2), p("Mitchell Starc", "BOWL", O, 2), p("Mohammad Shami", "BOWL", I, 2),
            p("Mohammad Siraj", "BOWL", I, 2), p("MS Dhoni", "WK", I, 2), p("Nicholas Pooran", "WK", O, 2), p("Noor Ahmad", "BOWL", O, 2),
            p("Pat Cummins", "BOWL", O, 2), p("Phil Salt", "WK", O, 2), p("Rashid Khan", "BOWL", O, 2), p("Ravindra Jadeja", "AR", I, 2),
            p("Rinku Singh", "BAT", I, 2), p("Rishabh Pant", "WK", I, 2), p("Rohit Sharma", "BAT", I, 2), p("Ruturaj Gaikwad", "BAT", I, 2),
            p("Sam Curran", "AR", O, 2), p("Sanju Samson", "WK", I, 2), p("Shimron Hetmyer", "BAT", O, 2), p("Shivam Dube", "AR", I, 2),
            p("Shreyas Iyer", "BAT", I, 2), p("Shubman Gill", "BAT", I, 2), p("Sunil Narine", "AR", O, 2), p("Suryakumar Yadav", "BAT", I, 2),
            p("Tim David", "BAT", O, 2), p("Travis Head", "BAT", O, 2), p("Trent Boult", "BOWL", O, 2), p("Varun Chakravarthy", "BOWL", I, 2),
            p("Virat Kohli", "BAT", I, 2), p("Will Jacks", "AR", O, 2), p("Yuzvendra Chahal", "BOWL", I, 2),
        ]
    },
    {
        id: "S1", name: "Set 1", players: [
            p("Abhishek Sharma", "AR", I, 1), p("Avesh Khan", "BOWL", I, 1), p("Azmatullah Omarzai", "AR", O, 1), p("Deepak Chahar", "BOWL", I, 1),
            p("Dhruv Jurel", "WK", I, 1), p("Glenn Phillips", "BAT", O, 1), p("Harshal Patel", "BOWL", I, 1), p("Khaleel Ahmed", "BOWL", I, 1),
            p("Krunal Pandya", "AR", I, 1), p("Mayank Yadav", "BOWL", I, 1), p("Mitchell Santner", "AR", O, 1), p("Prasidh Krishna", "BOWL", I, 1),
            p("Rajat Patidar", "BAT", I, 1), p("Riyan Parag", "AR", I, 1), p("Romario Shepherd", "AR", O, 1), p("Rovman Powell", "BAT", O, 1),
            p("Sai Sudharsan", "BAT", I, 1), p("Shardul Thakur", "AR", I, 1), p("Sherfane Rutherford", "BAT", O, 1), p("T. Natarajan", "BOWL", I, 1),
            p("Tilak Varma", "BAT", I, 1), p("Tristan Stubbs", "BAT", O, 1), p("Washington Sundar", "AR", I, 1),
        ]
    },
    {
        id: "S2", name: "Set 2", players: [
            p("Allah Ghazanfar", "BOWL", O, 0.75), p("Brydon Carse", "AR", O, 0.75), p("Corbin Bosch", "AR", O, 0.75), p("Dewald Brevis", "BAT", O, 0.75),
            p("Dushmantha Chameera", "BOWL", O, 0.75), p("Jacob Bethell", "AR", O, 0.75), p("Jamie Overton", "AR", O, 0.75), p("Jaydev Unadkat", "BOWL", I, 0.75),
            p("Kamindu Mendis", "AR", O, 0.75), p("Matthew Breetzke", "BAT", O, 0.75), p("Mitchell Owen", "BAT", O, 0.75), p("Mukesh Kumar", "BOWL", I, 0.75),
            p("Nandre Burger", "BOWL", O, 0.75), p("Nathan Ellis", "BOWL", O, 0.75), p("Nitish Rana", "BAT", I, 0.75), p("Nuwan Thushara", "BOWL", O, 0.75),
            p("Rahul Tewatia", "AR", I, 0.75), p("Ryan Rickelton", "WK", O, 0.75), p("Xavier Bartlett", "BOWL", O, 0.75),
        ]
    },
    {
        id: "S3", name: "Set 3", players: [
            p("Ajinkya Rahane", "BAT", I, 0.5), p("Devdutt Padikkal", "BAT", I, 0.5), p("Harshit Rana", "BOWL", I, 0.5), p("Ishant Sharma", "BOWL", I, 0.5),
            p("Jayant Yadav", "AR", I, 0.5), p("Jitesh Sharma", "WK", I, 0.5), p("Karun Nair", "BAT", I, 0.5), p("Manish Pandey", "BAT", I, 0.5),
            p("Nitish Kumar Reddy", "AR", I, 0.5), p("R. Sai Kishore", "BOWL", I, 0.5), p("Sandeep Sharma", "BOWL", I, 0.5), p("Shahbaz Ahmed", "AR", I, 0.5),
            p("Shahrukh Khan", "BAT", I, 0.5), p("Tushar Deshpande", "BOWL", I, 0.5), p("Umran Malik", "BOWL", I, 0.5), p("Yash Dayal", "BOWL", I, 0.5),
        ]
    },
    {
        id: "S4", name: "Set 4", players: [
            p("Abdul Samad", "AR", I, 0.3), p("Abhinandan Singh", "BOWL", I, 0.3), p("Abhishek Porel", "WK", I, 0.3), p("Ajay Mandal", "AR", I, 0.3),
            p("Akash Singh", "BOWL", I, 0.3), p("Angkrish Raghuvanshi", "BAT", I, 0.3), p("Aniket Verma", "BAT", I, 0.3), p("Anshul Kamboj", "BOWL", I, 0.3),
            p("Anuj Rawat", "WK", I, 0.3), p("Anukul Roy", "AR", I, 0.3), p("Arjun Tendulkar", "AR", I, 0.3), p("Arshin Kulkarni", "AR", I, 0.3),
            p("Ashutosh Sharma", "AR", I, 0.3), p("Ashwani Kumar", "BOWL", I, 0.3), p("Ayush Badoni", "BAT", I, 0.3), p("Ayush Mhatre", "BAT", I, 0.3),
            p("Digvesh Rathi", "BOWL", I, 0.3), p("Donovan Ferreira", "AR", O, 0.3), p("Eshan Malinga", "BOWL", O, 0.3), p("Gurjapneet Singh", "BOWL", I, 0.3),
            p("Gurnoor Brar", "BOWL", I, 0.3), p("Harnoor Pannu", "BAT", I, 0.3), p("Harpreet Brar", "AR", I, 0.3), p("Harsh Dubey", "BOWL", I, 0.3),
            p("Himmat Singh", "BAT", I, 0.3), p("Kumar Kushagra", "WK", I, 0.3), p("Kwena Maphaka", "BOWL", O, 0.3), p("Lhuan-Dre Pretorious", "AR", O, 0.3),
            p("M. Siddharth", "BOWL", I, 0.3), p("Madhav Tiwari", "BAT", I, 0.3), p("Manav Suthar", "BOWL", I, 0.3), p("Mayank Markande", "BOWL", I, 0.3),
            p("Mohd. Arshad Khan", "BOWL", I, 0.3), p("Mohsin Khan", "BOWL", I, 0.3), p("Mukesh Choudhary", "BOWL", I, 0.3), p("Musheer Khan", "AR", I, 0.3),
            p("Naman Dhir", "BAT", I, 0.3), p("Nehal Wadhera", "BAT", I, 0.3), p("Nishant Sindhu", "AR", I, 0.3), p("Prabhsimran Singh", "WK", I, 0.3),
            p("Prince Yadav", "BOWL", I, 0.3), p("Priyansh Arya", "BAT", I, 0.3), p("Pyla Avinash", "BAT", I, 0.3), p("Raghu Sharma", "BOWL", I, 0.3),
            p("Raj Angad Bawa", "AR", I, 0.3), p("Ramakrishna Ghosh", "WK", I, 0.3), p("Ramandeep Singh", "AR", I, 0.3), p("Rasikh Salam", "BOWL", I, 0.3),
            p("Robin Minz", "WK", I, 0.3), p("Sameer Rizvi", "AR", I, 0.3), p("Shashank Singh", "AR", I, 0.3), p("Shreyas Gopal", "BOWL", I, 0.3),
            p("Shubham Dubey", "BAT", I, 0.3), p("Smaran Ravichandaran", "BAT", I, 0.3), p("Suryansh Shedge", "AR", I, 0.3), p("Suyash Sharma", "BOWL", I, 0.3),
            p("Swapnil Singh", "AR", I, 0.3), p("Tripurana Vijay", "BAT", I, 0.3), p("Urvil Patel", "WK", I, 0.3), p("Vaibhav Arora", "BOWL", I, 0.3),
            p("Vaibhav Suryavanshi", "BAT", I, 0.3), p("Vipraj Nigam", "AR", I, 0.3), p("Vishnu Vinod", "WK", I, 0.3), p("Vyshak Vijaykumar", "BOWL", I, 0.3),
            p("Yash Thakur", "BOWL", I, 0.3), p("Yudhvir Charak", "AR", I, 0.3), p("Zeeshan Ansari", "BOWL", I, 0.3),
        ]
    },
    {
        id: "BA1", name: "Batters Accelerator 1", players: [
            p("Cameron Green", "BAT", O, 2), p("David Miller", "BAT", O, 2), p("Devon Conway", "BAT", O, 2), p("Jake Fraser-McGurk", "BAT", O, 2),
            p("Prithvi Shaw", "BAT", I, 0.75), p("Sarfaraz Khan", "BAT", I, 0.75),
        ]
    },
    {
        id: "AL1", name: "All-Rounders League 1", players: [
            p("Deepak Hooda", "AR", I, 0.75), p("Gus Atkinson", "AR", O, 2), p("Liam Livingstone", "AR", O, 2), p("Rachin Ravindra", "AR", O, 2),
            p("Venkatesh Iyer", "AR", I, 2), p("Wanindu Hasaranga", "AR", O, 2), p("Wiaan Mulder", "AR", O, 1),
        ]
    },
    {
        id: "WK1", name: "Wicket-Keepers 1", players: [
            p("Ben Duckett", "WK", O, 2), p("Finn Allen", "WK", O, 2), p("Jamie Smith", "WK", O, 2), p("Jonny Bairstow", "WK", O, 1),
            p("K.S. Bharat", "WK", I, 0.75), p("Quinton De Kock", "WK", O, 1), p("Rahmanullah Gurbaz", "WK", O, 1.5),
        ]
    },
    {
        id: "FA1", name: "Fast Bowlers Arena 1", players: [
            p("Akash Deep", "BOWL", I, 1), p("Anrich Nortje", "BOWL", O, 2), p("Fazalhaq Farooqi", "BOWL", O, 1), p("Gerald Coetzee", "BOWL", O, 2),
            p("Jacob Duffy", "BOWL", O, 2), p("Matheesha Pathirana", "BOWL", O, 2), p("Matt Henry", "BOWL", O, 2), p("Shivam Mavi", "BOWL", I, 0.75),
            p("Spencer Johnson", "BOWL", O, 1.5),
        ]
    },
    {
        id: "SP1", name: "Spin Painters 1", players: [
            p("Akeal Hosein", "BOWL", O, 2), p("Maheesh Theekshana", "BOWL", O, 2), p("Mujeeb Rahman", "BOWL", O, 2), p("Rahul Chahar", "BOWL", I, 1),
            p("Ravi Bishnoi", "BOWL", I, 2),
        ]
    },
    {
        id: "UBA1", name: "Uncapped Batters 1", players: [
            p("Aarya Desai", "BAT", I, 0.3), p("Abhinav Manohar", "BAT", I, 0.3), p("Abhinav Tejrana", "BAT", I, 0.3),
            p("Anmolpreet Singh", "BAT", I, 0.3), p("Atharva Taide", "BAT", I, 0.3), p("Yash Dhull", "BAT", I, 0.3),
        ]
    },
    {
        id: "UAL1", name: "Uncapped All-Rounders 1", players: [
            p("Auqib Dar", "AR", I, 0.3), p("Edhen Tom", "AR", I, 0.3), p("Kamlesh Nagarkoti", "AR", I, 0.3), p("Mahipal Lomror", "AR", I, 0.5),
            p("Prashant Veer", "AR", I, 0.3), p("Rajvardhan Hangargekar", "AR", I, 0.4), p("Sanvir Singh", "AR", I, 0.3),
            p("Shivang Kumar", "AR", I, 0.3), p("Tanush Kotian", "AR", I, 0.3), p("Vijay Shankar", "AR", I, 0.3),
        ]
    },
    {
        id: "UWK1", name: "Uncapped Wicket-Keepers 1", players: [
            p("Kartik Sharma", "WK", I, 0.3), p("Mukul Choudhary", "WK", I, 0.3), p("Ruchit Ahir", "WK", I, 0.3),
            p("Tejasvi Singh", "WK", I, 0.3), p("Tushar Raheja", "WK", I, 0.3), p("Vansh Bedi", "WK", I, 0.3),
        ]
    },
    {
        id: "UFA1", name: "Uncapped Fast Bowlers 1", players: [
            p("Akash Madhwal", "BOWL", I, 0.3), p("Ashok Sharma", "BOWL", I, 0.3), p("Kartik Tyagi", "BOWL", I, 0.3),
            p("Naman Tiwari", "BOWL", I, 0.3), p("Raj Limbani", "BOWL", I, 0.3), p("Simarjeet Singh", "BOWL", I, 0.3), p("Sushant Mishra", "BOWL", I, 0.3),
        ]
    },
    {
        id: "USP1", name: "Uncapped Spinners 1", players: [
            p("Karn Sharma", "BOWL", I, 0.5), p("Kumar Kartikeya Singh", "BOWL", I, 0.3), p("Prashant Solanki", "BOWL", I, 0.3),
            p("Shivam Shukla", "BOWL", I, 0.3), p("Vignesh Puthur", "BOWL", I, 0.3), p("Wahidullah Zadran", "BOWL", O, 0.3), p("Yash Raj Punja", "BOWL", I, 0.3),
        ]
    },
    {
        id: "BA2", name: "Batters Accelerator 2", players: [
            p("Ackeem Auguste", "BAT", O, 0.75), p("Mayank Agarawal", "BAT", I, 0.75), p("Pathum Nissanka", "BAT", O, 0.75),
            p("Rahul Tripathi", "BAT", I, 0.75), p("Reeza Hendricks", "BAT", O, 1), p("Sediqullah Atal", "BAT", O, 0.75),
            p("Steve Smith", "BAT", O, 2), p("Tim Robinson", "BAT", O, 0.75),
        ]
    },
    {
        id: "AL2", name: "All-Rounders League 2", players: [
            p("Ben Dwarshuis", "AR", O, 1), p("Daniel Sams", "AR", O, 1), p("Daryl Mitchell", "AR", O, 2), p("Dasun Shanaka", "AR", O, 0.75),
            p("Jason Holder", "AR", O, 2), p("Matthew Short", "AR", O, 1.5), p("Michael Bracewell", "AR", O, 2), p("Sean Abbott", "AR", O, 2),
            p("Zak Foulkes", "AR", O, 0.75),
        ]
    },
    {
        id: "WK2", name: "Wicket-Keepers 2", players: [
            p("Benjamin McDermott", "WK", O, 0.75), p("Jordan Cox", "WK", O, 0.75), p("Josh Inglis", "WK", O, 2), p("Kusal Mendis", "WK", O, 0.75),
            p("Kusal Perera", "WK", O, 1), p("Shai Hope", "WK", O, 2), p("Tim Seifert", "WK", O, 1.5), p("Tom Banton", "WK", O, 2),
        ]
    },
    {
        id: "FA2", name: "Fast Bowlers Arena 2", players: [
            p("Adam Milne", "BOWL", O, 2), p("Chetan Sakariya", "BOWL", I, 0.75), p("Kuldeep Sen", "BOWL", I, 0.75), p("Kyle Jamieson", "BOWL", O, 2),
            p("Lungisani Ngidi", "BOWL", O, 2), p("Mustafizur Rahman", "BOWL", O, 2), p("Saqib Mahmood", "BOWL", O, 1.5),
            p("Umesh Yadav", "BOWL", I, 1.5), p("William Orourke", "BOWL", O, 2),
        ]
    },
    {
        id: "SP2", name: "Spin Painters 2", players: [
            p("Mohammad Waqar Salamkheil", "BOWL", O, 1), p("Qais Ahmad", "BOWL", O, 0.75), p("Rishad Hossain", "BOWL", O, 0.75),
            p("Viyaskanth Vijayakanth", "BOWL", O, 0.75),
        ]
    },
    {
        id: "UBA2", name: "Uncapped Batters 2", players: [
            p("Akshat Raghuwanshi", "BAT", I, 0.3), p("Aman Rao Perala", "BAT", I, 0.3), p("Ankit Kumar", "BAT", I, 0.3), p("Danish Malewar", "BAT", I, 0.3),
            p("Manan Vohra", "BAT", I, 0.3), p("Pukhraj Mann", "BAT", I, 0.3), p("Rohan Kunnummal", "BAT", I, 0.3), p("Salman Nizar", "BAT", I, 0.3),
        ]
    },
    {
        id: "UAL2", name: "Uncapped All-Rounders 2", players: [
            p("Aman Khan", "AR", I, 0.3), p("Darshan Nalkande", "AR", I, 0.3), p("Harsh Tyagi", "AR", I, 0.3), p("Mangesh Yadav", "AR", I, 0.3),
            p("Mayank Rawat", "AR", I, 0.3), p("Sairaj Patil", "AR", I, 0.3), p("Satvik Deswal", "AR", I, 0.3), p("Suyash Prabhudessai", "AR", I, 0.3),
            p("Vicky Ostwal", "AR", I, 0.3), p("Yuvraj Chaudhary", "AR", I, 0.3),
        ]
    },
    {
        id: "UWK2", name: "Uncapped Wicket-Keepers 2", players: [
            p("Abhishek Pathak", "WK", I, 0.3), p("Kunal Rathore", "WK", I, 0.3), p("Rahul Buddhi", "WK", I, 0.3), p("Ravi Singh", "WK", I, 0.3),
            p("Ricky Bhui", "WK", I, 0.3), p("Salil Arora", "WK", I, 0.3), p("Saurav Chuahan", "WK", I, 0.3), p("Yashvardhan Dalal", "WK", I, 0.3),
        ]
    },
    {
        id: "UFA2", name: "Uncapped Fast Bowlers 2", players: [
            p("K.M Asif", "BOWL", I, 0.4), p("Mohammad Izhar", "BOWL", I, 0.3), p("Onkar Tarmale", "BOWL", I, 0.3), p("Prithviraj Yarra", "BOWL", I, 0.3),
            p("PV.Satyanarayana Raju", "BOWL", I, 0.3), p("Sakib Hussain", "BOWL", I, 0.3), p("Vidwath Kaverappa", "BOWL", I, 0.3),
            p("Vidyadhar Patil", "BOWL", I, 0.3), p("Vijay Kumar", "BOWL", I, 0.3),
        ]
    },
    {
        id: "USP2", name: "Uncapped Spinners 2", players: [
            p("Bailapudi Yeswanth", "BOWL", I, 0.3), p("Himanshu Sharma", "BOWL", I, 0.3), p("K.C. Cariappa", "BOWL", I, 0.3), p("Kartik Chadha", "BOWL", I, 0.3),
            p("Mohit Rathee", "BOWL", I, 0.3), p("Murugan Ashwin", "BOWL", I, 0.3), p("Pravin Dubey", "BOWL", I, 0.3), p("Shubham Agrawal", "BOWL", I, 0.4),
            p("Tejas Baroka", "BOWL", I, 0.3),
        ]
    },
    {
        id: "AL3", name: "All-Rounders League 3", players: [
            p("Beau Webster", "AR", O, 1.25), p("Bevon-John Jacobs", "AR", O, 0.75), p("Cooper Connolly", "AR", O, 2), p("Daniel Lawrence", "AR", O, 2),
            p("George Linde", "AR", O, 1), p("Gulbadin Naib", "AR", O, 1), p("Rehan Ahmed", "AR", O, 0.75), p("Tom Curran", "AR", O, 2),
            p("William Sutherland", "AR", O, 1),
        ]
    },
    {
        id: "FA3", name: "Fast Bowlers Arena 3", players: [
            p("Alzarri Joseph", "BOWL", O, 2), p("Jhye Richardson", "BOWL", O, 1.5), p("Luke Wood", "BOWL", O, 0.75), p("Navdeep Saini", "BOWL", I, 0.75),
            p("Naveen Ul Haq", "BOWL", O, 2), p("Richard Gleeson", "BOWL", O, 0.75), p("Riley Meredith", "BOWL", O, 1.5), p("Shamar Joseph", "BOWL", O, 0.75),
            p("Taskin Ahmed", "BOWL", O, 0.75),
        ]
    },
    {
        id: "UBA3", name: "Uncapped Batters 3", players: [
            p("Adarsh Singh", "BAT", I, 0.3), p("Arsh Kabir Ranga", "BAT", I, 0.3), p("Ayush Doseja", "BAT", I, 0.3), p("Bhanu Pania", "BAT", I, 0.3),
            p("Kunal Chandela", "BAT", I, 0.3), p("M.Dheeraj Kumar", "BAT", I, 0.3), p("Qamran Iqbal", "BAT", I, 0.3), p("Sahil Parakh", "BAT", I, 0.3),
        ]
    },
    {
        id: "UAL3", name: "Uncapped All-Rounders 3", players: [
            p("Abid Mushtaq", "AR", I, 0.3), p("Atit Sheth", "AR", I, 0.3), p("Hritik Shokeen", "AR", I, 0.3), p("Jagadeesha Suchith", "AR", I, 0.3),
            p("Jalaj Saxena", "AR", I, 0.4), p("Manoj Bhandage", "AR", I, 0.3), p("Manvanth Kumar", "AR", I, 0.3), p("Mayank Dagar", "AR", I, 0.3),
            p("Raghav Goyal", "AR", I, 0.3), p("Tanay Thyagarajann", "AR", I, 0.3),
        ]
    },
    {
        id: "UWK3", name: "Uncapped Wicket-Keepers 3", players: [
            p("Ajitesh Guruswamy", "WK", I, 0.3), p("Bipin Saurabh", "WK", I, 0.3), p("Connor Esterhuizen", "WK", O, 0.3),
            p("Hardik Tamore", "WK", I, 0.3), p("Joe Clarke", "WK", O, 0.5), p("Siddharth Joon", "WK", I, 0.3),
            p("Tom Moores", "WK", O, 0.4), p("Vishnu Solanki", "WK", I, 0.3),
        ]
    },
    {
        id: "UFA3", name: "Uncapped Fast Bowlers 3", players: [
            p("Abhilash Shetty", "BOWL", I, 0.3), p("Arpit Guleria", "BOWL", I, 0.3), p("Divesh Sharma", "BOWL", I, 0.3), p("Irfan Umair", "BOWL", I, 0.3),
            p("Kuldip Yadav", "BOWL", I, 0.3), p("Money Grewal", "BOWL", I, 0.3), p("Sayan Ghosh", "BOWL", I, 0.3), p("Sunil Kumar", "BOWL", I, 0.3),
            p("Tristan Luus", "BOWL", O, 0.3),
        ]
    },
    {
        id: "USP3", name: "Uncapped Spinners 3", players: [
            p("Amit Kumar", "BOWL", I, 0.3), p("Chintal Gandhi", "BOWL", I, 0.3), p("Dharmendrasinh Jadeja", "BOWL", I, 0.3),
            p("Jhathavedh Subramanyan", "BOWL", I, 0.3), p("Manan Bhardwaj", "BOWL", I, 0.3), p("Parikshit Dhanak", "BOWL", I, 0.3),
            p("Saumy Pandey", "BOWL", I, 0.3), p("Shreyas Chavan", "BOWL", I, 0.3), p("Vishal Nishad", "BOWL", I, 0.3),
        ]
    },
    {
        id: "AL4", name: "All-Rounders League 4", players: [
            p("Charith Asalanka", "AR", O, 1), p("Dunith Wellalage", "AR", O, 0.75), p("Dwaine Pretorius", "AR", O, 1), p("George Garton", "AR", O, 0.75),
            p("Kyle Mayers", "AR", O, 1.25), p("Liam Dawson", "AR", O, 2), p("Muhammad Abbas", "AR", O, 0.75), p("Nathan Smith", "AR", O, 0.75),
            p("Roston Chase", "AR", O, 1.25),
        ]
    },
    {
        id: "FA4", name: "Fast Bowlers Arena 4", players: [
            p("Jason Behrendorff", "BOWL", O, 1.5), p("Joshua Tongue", "BOWL", O, 1), p("Matthew Potts", "BOWL", O, 0.75), p("Nahid Rana", "BOWL", O, 0.75),
            p("Olly Stone", "BOWL", O, 1.25), p("Sandeep Warrier", "BOWL", I, 0.75), p("Tanzim Hasan Sakib", "BOWL", O, 0.75),
        ]
    },
    {
        id: "UBA4", name: "Uncapped Batters 4", players: [
            p("Aaron Varghese", "BAT", I, 0.3), p("Ahammed Imran", "BAT", I, 0.3), p("Ayaz Khan", "BAT", I, 0.3), p("Daniel Lategan", "BAT", O, 0.3),
            p("Miles Hammond", "BAT", I, 0.3), p("Sachin Dhas", "BAT", I, 0.3), p("Siddhant Rana", "BAT", I, 0.3), p("Vishvarajsinh Jadeja", "BAT", I, 0.3),
        ]
    },
    {
        id: "UAL4", name: "Uncapped All-Rounders 4", players: [
            p("Abdul Bazith", "AR", I, 0.3), p("Atharva Ankolekar", "AR", I, 0.3), p("Ayush Vartak", "AR", I, 0.3), p("Karan Lal", "AR", I, 0.3),
            p("Prince Rai", "AR", I, 0.3), p("Ripal Patel", "AR", I, 0.3), p("Sanjay Yadav", "AR", I, 0.3), p("Shams Mulani", "AR", I, 0.3),
            p("Utkarsh Singh", "AR", I, 0.3), p("Vivrant Sharma", "AR", I, 0.3),
        ]
    },
    {
        id: "UFA4", name: "Uncapped Fast Bowlers 4", players: [
            p("Esakkimuthu Ayyakutti", "BOWL", I, 0.3), p("Ishan Porel", "BOWL", I, 0.3), p("Kulwant Khejroliya", "BOWL", I, 0.3),
            p("Pankaj Jaswal", "BOWL", I, 0.3), p("Praful Hinge", "BOWL", I, 0.3), p("Rajan Kumar", "BOWL", I, 0.3), p("Ravi Kumar", "BOWL", I, 0.3),
            p("Safvan Patel", "BOWL", I, 0.3), p("Sayed Irfan Aftab", "BOWL", I, 0.3),
        ]
    },
    {
        id: "USP4", name: "Uncapped Spinners 4", players: [
            p("Arab Gul", "BOWL", O, 0.4), p("Izaz Sawariya", "BOWL", I, 0.3), p("Jikku Bright", "BOWL", I, 0.3), p("Naman Pushpak", "BOWL", I, 0.3),
            p("Purav Agarwal", "BOWL", I, 0.3), p("Rakibul Hasan", "BOWL", O, 0.3), p("Roshan Wagshare", "BOWL", I, 0.3),
            p("Traveen Mathew", "BOWL", O, 0.3), p("Yash Dicholkar", "BOWL", I, 0.3),
        ]
    },
    {
        id: "FA5", name: "Fast Bowlers Arena 5", players: [
            p("Billy Stanlake", "BOWL", O, 0.75), p("Binura Fernando", "BOWL", O, 0.75), p("Joshua Little", "BOWL", O, 0.75),
            p("Md Shoriful Islam", "BOWL", O, 0.75), p("Obed McCoy", "BOWL", O, 0.75), p("Wesley Agar", "BOWL", O, 0.75),
        ]
    },
    {
        id: "UAL5", name: "Uncapped All-Rounders 5", players: [
            p("Krains Fuletra", "AR", I, 0.3), p("Macneil Noronha", "AR", I, 0.3), p("Nikhil Chaudhary", "AR", I, 0.4), p("Ninad Rathva", "AR", I, 0.3),
            p("R Rajkumar", "AR", I, 0.3), p("R.S Ambrish", "AR", I, 0.3), p("R.Sonu Yadav", "AR", I, 0.3), p("Shivalik Sharma", "AR", I, 0.3),
            p("Siddharth Yadav", "AR", I, 0.3), p("Sunny Sandhu", "AR", I, 0.3),
        ]
    },
    {
        id: "UFA5", name: "Uncapped Fast Bowlers 5", players: [
            p("Atal Rai", "BOWL", I, 0.3), p("Atif Mushtaq", "BOWL", I, 0.3), p("C.Rakshann Readdi", "BOWL", I, 0.3), p("Deependra Singh", "BOWL", I, 0.3),
            p("Manish Reddy", "BOWL", I, 0.3), p("Nishanth Saranu", "BOWL", I, 0.3), p("Rajat Verma", "BOWL", I, 0.3), p("Rohit Yadav", "BOWL", I, 0.3),
            p("Waseem Khanday", "BOWL", I, 0.3),
        ]
    },
    {
        id: "UAL6", name: "Uncapped All-Rounders 6", players: [
            p("Bal Krishna", "AR", I, 0.3), p("Delano Potgieter", "AR", O, 0.3), p("Emanjot Chahal", "AR", I, 0.3), p("Hardik Raj", "AR", I, 0.3),
            p("Khilan Patel", "AR", I, 0.3), p("Parth Rekhade", "AR", I, 0.3), p("Sarthak Ranjan", "AR", I, 0.3), p("Shubhang Hegde", "AR", I, 0.3),
            p("Tiaan Van Vuuren", "AR", O, 0.3), p("Vihaan Malhotra", "AR", I, 0.3),
        ]
    },
    {
        id: "UFA6", name: "Uncapped Fast Bowlers 6", players: [
            p("Aaqib Khan", "BOWL", I, 0.3), p("Aman Shekhawat", "BOWL", I, 0.3), p("Bayanda Majola", "BOWL", O, 0.3), p("Brijesh Sharma", "BOWL", I, 0.3),
            p("Sabir Khan", "BOWL", I, 0.3), p("Sadek Hussain", "BOWL", I, 0.3), p("Shreevatsha Acharya", "BOWL", I, 0.3),
            p("Shubham Kapse", "BOWL", I, 0.3), p("Srihari Nair", "BOWL", I, 0.3),
        ]
    },
    {
        id: "UAL7", name: "Uncapped All-Rounders 7", players: [
            p("Abhimanyusingh Rajput", "AR", I, 0.3), p("Akash Pugazhanthi", "AR", I, 0.3), p("Arpit Rana", "AR", I, 0.3), p("Himanshu Bisht", "AR", I, 0.3),
            p("Kanishk Chouhan", "AR", I, 0.3), p("Maramreddy Reddy", "AR", I, 0.3), p("Mayank Gusain", "AR", I, 0.3), p("Sagar Solanki", "AR", I, 0.3),
            p("Shreyan Chakraborty", "AR", I, 0.3), p("Shubham Rana", "AR", I, 0.3),
        ]
    },
    {
        id: "UAL8", name: "Uncapped All-Rounders 8", players: [
            p("Anuj Thakral", "AR", I, 0.3), p("Arfaz Mohammad", "AR", I, 0.3), p("Aryaman Singh Dhaliwal", "AR", I, 0.3), p("Daksh Kamra", "AR", I, 0.3),
            p("Hemang Patel", "AR", I, 0.3), p("Lalit Yadav", "AR", I, 0.3), p("Mridul Surroch", "AR", I, 0.3), p("Nitin Sai Yadav", "AR", I, 0.3),
            p("Parth Vats", "AR", I, 0.3), p("Vishal Mandwal", "AR", I, 0.3),
        ]
    },
    {
        id: "UAL9", name: "Uncapped All-Rounders 9", players: [
            p("Akhil Scaria", "AR", I, 0.3), p("Ishan Mulchandani", "AR", I, 0.3), p("K.Ajay Singh", "AR", I, 0.3), p("Krish Bhagat", "AR", I, 0.3),
            p("Luckyrajsinh Vaghela", "AR", I, 0.3), p("Muhammed Sharafuddeen", "AR", I, 0.3), p("Nasir Lone", "AR", I, 0.3),
            p("Prerit Dutta", "AR", I, 0.3), p("Ritik Tada", "AR", I, 0.3), p("Sammar Gajjar", "AR", I, 0.3),
        ]
    },
    {
        id: "UAL10", name: "Uncapped All-Rounders 10", players: [
            p("Akshu Bajwa", "AR", I, 0.3), p("Dhurmil Matkar", "AR", I, 0.3), p("Dian Forrester", "AR", O, 0.3), p("Jack Edwards", "AR", O, 0.5),
            p("Madhav Bajaj", "AR", I, 0.3), p("Mohamed Ali", "AR", I, 0.3), p("Parikshit Valsangkar", "AR", I, 0.3), p("Rishabh Chauhan", "AR", I, 0.3),
            p("Shiva Singh", "AR", I, 0.3), p("Varun Raj Singh Bisht", "AR", I, 0.3),
        ]
    },
];

export const PLAYER_IMAGES = {
    "Virat Kohli": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/253802/253802.jpg",
    "Rohit Sharma": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/34102/34102.jpg",
    "Jasprit Bumrah": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/625383/625383.jpg",
    "MS Dhoni": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/28081/28081.jpg",
    "Rishabh Pant": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/931581/931581.jpg",
    "Hardik Pandya": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/625371/625371.jpg",
    "KL Rahul": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/422108/422108.jpg",
    "Shubman Gill": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1070173/1070173.jpg",
    "Ravindra Jadeja": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/234675/234675.jpg",
    "Suryakumar Yadav": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/446507/446507.jpg",
    "Shreyas Iyer": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/642519/642519.jpg",
    "Ruturaj Gaikwad": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1079434/1079434.jpg",
    "Sanju Samson": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/475281/475281.jpg",
    "Axar Patel": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/554691/554691.jpg",
    "Kuldeep Yadav": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/559235/559235.jpg",
    "Yuzvendra Chahal": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/430246/430246.jpg",
    "Arshdeep Singh": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1151674/1151674.jpg",
    "Bhuvneshwar Kumar": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/236779/236779.jpg",
    "Mohammad Shami": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/390484/390484.jpg",
    "Mohammad Siraj": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/789251/789251.jpg",
    "Varun Chakravarthy": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/670419/670419.jpg",
    "Rinku Singh": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1072371/1072371.jpg",
    "Ishan Kishan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1131156/1131156.jpg",
    "Shivam Dube": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942644/942644.jpg",
    "Jos Buttler": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/308967/308967.jpg",
    "Travis Head": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/530011/530011.jpg",
    "Mitchell Starc": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/311592/311592.jpg",
    "Josh Hazlewood": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/311636/311636.jpg",
    "Pat Cummins": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/311766/311766.jpg",
    "Mitchell Marsh": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/272450/272450.jpg",
    "Marcus Stoinis": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/311741/311741.jpg",
    "Rashid Khan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/793463/793463.jpg",
    "Kagiso Rabada": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/550215/550215.jpg",
    "Heinrich Klaasen": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/407904/407904.jpg",
    "Marco Jansen": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1141796/1141796.jpg",
    "Aiden Markram": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/531931/531931.jpg",
    "Jofra Archer": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/669855/669855.jpg",
    "Sam Curran": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/792966/792966.jpg",
    "Phil Salt": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/925791/925791.jpg",
    "Nicholas Pooran": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/743682/743682.jpg",
    "Sunil Narine": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/237236/237236.jpg",
    "Shimron Hetmyer": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/851003/851003.jpg",
    "Tim David": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942972/942972.jpg",
    "Lockie Ferguson": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/657011/657011.jpg",
    "Trent Boult": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/311768/311768.jpg",
    "Noor Ahmad": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1224302/1224302.jpg",
    "Will Jacks": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1021747/1021747.jpg",
    "Abhishek Sharma": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1151676/1151676.jpg",
    "Mayank Yadav": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1303633/1303633.jpg",
    "Tilak Varma": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175765/1175765.jpg",
    "Riyan Parag": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175767/1175767.jpg",
    "Sai Sudharsan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175768/1175768.jpg",
    "Rajat Patidar": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/997516/997516.jpg",
    "Deepak Chahar": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/625375/625375.jpg",
    "Harshal Patel": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/469388/469388.jpg",
    "Prasidh Krishna": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942500/942500.jpg",
    "Krunal Pandya": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/625383/625383.jpg",
    "Washington Sundar": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/719715/719715.jpg",
    "Shardul Thakur": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/559268/559268.jpg",
    "Avesh Khan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942645/942645.jpg",
    "Khaleel Ahmed": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/831244/831244.jpg",
    "Glenn Phillips": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/786792/786792.jpg",
    "Rovman Powell": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/611668/611668.jpg",
    "Tristan Stubbs": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175784/1175784.jpg",
    "Dhruv Jurel": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1224306/1224306.jpg",
    "Romario Shepherd": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/853788/853788.jpg",
    "Sherfane Rutherford": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/742761/742761.jpg",
    "T. Natarajan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/720471/720471.jpg",
    "Jacob Bethell": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1229093/1229093.jpg",
    "Dewald Brevis": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175806/1175806.jpg",
    "Ryan Rickelton": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/773630/773630.jpg",
    "Nitish Rana": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/778798/778798.jpg",
    "Nathan Ellis": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1099536/1099536.jpg",
    "Rahul Tewatia": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/559252/559252.jpg",
    "Mitchell Owen": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1272361/1272361.jpg",
    "Brydon Carse": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1072377/1072377.jpg",
    "Kamindu Mendis": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/940973/940973.jpg",
    "Allah Ghazanfar": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1303625/1303625.jpg",
    "Xavier Bartlett": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175791/1175791.jpg",
    "Ajinkya Rahane": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/277916/277916.jpg",
    "Devdutt Padikkal": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1151673/1151673.jpg",
    "Nitish Kumar Reddy": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1303619/1303619.jpg",
    "Harshit Rana": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1303620/1303620.jpg",
    "Jitesh Sharma": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/783194/783194.jpg",
    "Manish Pandey": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/234675/234675.jpg",
    "Karun Nair": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/554691/554691.jpg",
    "Shahbaz Ahmed": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942629/942629.jpg",
    "Shahrukh Khan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/997536/997536.jpg",
    "Ishant Sharma": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/236779/236779.jpg",
    "Yash Dayal": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175770/1175770.jpg",
    "Tushar Deshpande": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942640/942640.jpg",
    "Steve Smith": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/267192/267192.jpg",
    "David Miller": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/290716/290716.jpg",
    "Devon Conway": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/669855/669855.jpg",
    "Jake Fraser-McGurk": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1303608/1303608.jpg",
    "Cameron Green": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1099533/1099533.jpg",
    "Prithvi Shaw": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/931581/931581.jpg",
    "Sarfaraz Khan": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/559230/559230.jpg",
    "Venkatesh Iyer": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/997537/997537.jpg",
    "Liam Livingstone": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/554691/554691.jpg",
    "Wanindu Hasaranga": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/793463/793463.jpg",
    "Rachin Ravindra": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1129072/1129072.jpg",
    "Gus Atkinson": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1072379/1072379.jpg",
    "Quinton De Kock": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/390242/390242.jpg",
    "Finn Allen": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1072375/1072375.jpg",
    "Rahmanullah Gurbaz": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1129079/1129079.jpg",
    "Jonny Bairstow": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/236239/236239.jpg",
    "Matheesha Pathirana": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175797/1175797.jpg",
    "Anrich Nortje": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/735935/735935.jpg",
    "Gerald Coetzee": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1175804/1175804.jpg",
    "Fazalhaq Farooqi": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1099525/1099525.jpg",
    "Ravi Bishnoi": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1151675/1151675.jpg",
    "Mujeeb Rahman": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/831240/831240.jpg",
    "Maheesh Theekshana": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1129076/1129076.jpg",
    "Akeal Hosein": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/743680/743680.jpg",
    "Rahul Chahar": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/942630/942630.jpg",
    "Vaibhav Suryavanshi": "https://img1.hscicdn.com/image/upload/f_auto,t_gn_w_320/lsci/db/PICTURES/Cricketers/1354966/1354966.jpg"
};
