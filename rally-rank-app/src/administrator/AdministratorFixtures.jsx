// Package Imports
// import axios from "axios";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";

// Create a custom seed bracket
const CustomSeed = ({ seed, breakpoint }) => {
    return (
        <Seed mobileBreakpoint = {breakpoint} style = {{ fontSize: "12px" }}>
            <SeedItem style = {{ backgroundColor: "#E7F5E8", padding: "10px", borderRadius: "12px" }}>
                <div>
                    <SeedTeam style = {{ color: "#444444", fontWeight: "700", fontSize: "14px"}}>
                        {seed.teams[0]?.name || "TBD"}
                    </SeedTeam>
                    <hr style = {{ margin: "5px 0", border: "1px solid #CCCCCC" }} />
                    <SeedTeam style = {{ color: "#222222", fontWeight: "700", fontSize: "14px"}}>
                        {seed.teams[1]?.name || "TBD"}
                    </SeedTeam>
                </div>
            </SeedItem>
        </Seed>
    );
};

const generateRounds = (currentFixtures) => {
    const rounds = [];
    for (let roundIndex = 0; roundIndex < currentFixtures.length; roundIndex++) {
        const seeds = [];
        const playersInRound = currentFixtures[roundIndex]?.players || [];
        const matchesPerRound = Math.floor(playersInRound.length / 2);
        // Determine round title based on the number of players
        let roundTitle = `Round ${roundIndex + 1}`;
        if (playersInRound.length === 8) {
            roundTitle = "Quarter Finals";
        } else if (playersInRound.length === 4) {
            roundTitle = "Semi Finals";
        } else if (playersInRound.length === 2) {
            roundTitle = "Finals";
        }
        for (let i = 0; i < matchesPerRound; i++) {
            seeds.push({
                id: i + 1,
                date: new Date().toDateString(),
                teams: [
                    {
                        name: playersInRound[i * 2] || "TBD",
                    },
                    {
                        name: playersInRound[i * 2 + 1] || "TBD",
                    },
                ],
            });
        }
        rounds.push({
            title: roundTitle,
            seeds: seeds,
        });
    }
    return rounds;
};

const PreliminaryPlayersTable = ({ preliminaryPlayers }) => {
    return (
        <div className = "preliminary-matches p-5 h-1/2 overflow-y-auto">
            <h2 className = "text-2xl font-bold"> Preliminary Matches </h2>
            <div className = "mt-4 flex flex-col gap-4">
                {preliminaryPlayers.length > 0 && preliminaryPlayers.map((player, index) => {
                    if (index % 2 === 0) {
                        return (
                            <div key = {index} className = "match-card flex items-center gap-4 mb-4">
                                <div className = "player-card border border-gray-300 rounded-lg p-4 shadow-md w-1/4 inline-flex items-center gap-2">
                                    <span className = "font-semibold text-lg"> Player 1: </span>
                                    <span className = "text-gray-700"> {player} </span>
                                </div>
                                <span className = "text-lg font-semibold"> VS </span>
                                <div className = "player-card border border-gray-300 rounded-lg p-4 shadow-md w-1/4 inline-flex items-center gap-2">
                                    <span className = "font-semibold text-lg"> Player 2: </span>
                                    <span className = "block text-gray-700">
                                        {preliminaryPlayers[index + 1] || "TBD"}
                                    </span>
                                </div>
                                <div className = "winner-card text-sm font-semibold w-1/4 ml-5">
                                    <span className = "text-gray-600 text-lg font-semibold"> Match Winner: </span>
                                    <span className = "text-green-600">
                                        TBD {/* Replace with API Call for match winner */}
                                    </span>
                                </div>
                            </div>
                        );
                    }
                    return null; // Skip odd indexes
                })}
            </div>
        </div>
    );
};


function AdministratorFixtures() {
    const location = useLocation();
    // To be replaced with API call instead, to get the fixtures directly from the API Call
    const currentFixtures = location.state?.fixtures;
    const preliminaryPlayers = currentFixtures?.[0]?.players || [];
    const mainTournamentRounds = generateRounds(currentFixtures.slice(1));                             // Main tournament rounds start at currentFixtures[1]
    const [tournamentFixtures, setTournamentFixtures] = useState(currentFixtures || {});

    useEffect(() => {
        if (currentFixtures) {
            setTournamentFixtures(currentFixtures);
        }
    }, [currentFixtures]);

    return (
        <div className = "administrator-fixtures flex flex-col gap-8">
            <h2 className = "text-3xl font-bold mt-10"> Tournament Fixtures </h2>
            <PreliminaryPlayersTable preliminaryPlayers = {preliminaryPlayers} />
            <div className = "main-tournament-brackets mb-20">
                <h2 className = "text-2xl font-bold mb-10"> Main Tournament Fixtures and Results </h2>
                <Bracket
                    rounds = {mainTournamentRounds}
                    roundTitleComponent = {(title) => (
                        <div style = {{ textAlign: "center", color: "green", fontWeight: "600", fontSize: "18px" }}>
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