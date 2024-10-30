// Package Import

const CustomSeed = ({ seed, breakpoint }) => {
    return (
        <Seed mobileBreakpoint = {breakpoint} style = {{ fontSize: 12 }}>
            <SeedItem style = {{ backgroundColor: "white", padding: "10px", borderRadius: "12px" }}>
                <div>
                    <SeedTeam style = {{ color: "black" }}>
                        {seed.teams[0]?.name || "TBD"}
                    </SeedTeam>
                    <hr style = {{ margin: "5px 0", border: "1px solid #CCCCCC" }} />
                    <SeedTeam style = {{ color: "green" }}>
                        {seed.teams[1]?.name || "TBD"}
                    </SeedTeam>
                </div>
            </SeedItem>
        </Seed>
    );
};

// Function to calculate the number of rounds (given the number of players)
const calculateRounds = (playerPool) => {
    return Math.ceil(Math.log2(playerPool.length));
}

// Function to generate the round data (seeds and teams) for the tournaments
const generateRounds = (playerPool) => {
    const numberOfRounds = calculateRounds(playerPool);
    const rounds = [];

    let matchesPerRound = playerPool.length / 2;
    for (let roundIndex = 0; roundIndex < numberOfRounds; roundIndex++) {
        const seeds = [];
        for (let i = 0; i < matchesPerRound; i++) {
            seeds.push({
                id: i + 1,
                date: new Date().toDateString(),
                teams: [
                    {
                        name: playerPool[i * 2] || "TBD"
                    },
                    {
                        name: playerPool[i * 2 + 1] || "TBD"
                    },
                ],
            });
        }
        rounds.push({
            title: `Round ${roundIndex + 1}`,
            seeds: seeds,
        });
        matchesPerRound = Math.ceil(matchesPerRound / 2);
    }
    return rounds;
};

function AdministratorFixtures() {
    // Replace with API Call for playerPool playing in the tournament
    const playerPool = [
        "Player 1",
        "Player 2",
        "Player 3",
        "Player 4",
        "Player 5",
        "Player 6",
        "Player 7",
        "Player 8",
        "Player 9",
        "Player 10",
        "Player 11",
        "Player 12",
        "Player 13",
        "Player 14",
        "Player 15",
        "Player 16",
    ]

    const rounds = generateRounds(playerPool);

    // Need API Call for players playing in the preliminary matches

    return (
        <div className = "flex flex-col gap-8">
            <h2 className = "text-3xl font-bold mt-10"> Tournament Fixtures </h2>

            <button 
                className = "fixed top-32 right-10 bg-green-500 text-white font-bold py-2 px-4 rounded shadow"
            >
                Generate Bracket
            </button>
            
            <div className= "preliminary-match-table border p-5 h-[300px]">
                <h2 className = "text-2xl font-bold"> Preliminary Table </h2>
            </div>
            <div className = "main-tournament-brackets mb-20">
                <h2 className = "text-2xl font-bold mb-6"> Main Tournament </h2>
                <Bracket
                    rounds = {rounds}
                    roundTitleComponent = {(title) => (
                        <div style = {{ textAlign: "center", color: "green", fontWeight: "bold" }}>
                            {title}
                        </div>
                    )}
                    renderSeedComponent = {CustomSeed}
                />
            </div>
        </div>
    );
};

export default AdministratorFixtures;