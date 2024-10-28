// Package Imports
import React from "react";
import { Bracket } from "react-brackets";

// Function to calcuate the number of rounds given the number of players
const calculateRounds = (playerPool) => {
    return Math.ceil(Math.log2(playerPool.length));
}

// Function to generate the round data (seeds and teams) for the tournaments
// Check what the order the playerPool will be given by backend
const generateRounds = (playerPool) => {
    const numberOfRounds = calculateRounds(playerPool);
    const rounds = [];

    let matchesInRound = playerPool.length / 2;
    for (let roundIndex = 0; roundIndex < numberOfRounds; roundIndex++) {
        const seeds = [];
        for (let i = 0; i < matchesInRound; i++) {
            seeds.push({
                id: i + 1,
                date: new Date().toDateString(),
                teams: [
                    {
                        name: playerPool[(i * 2) || "TBD"]
                    },
                    {
                        name: playerPool[(i * 2) + 1 || "TBD"]
                    },
                ],
            });
        }
        rounds.push({
            title: `Round ${roundIndex + 1}`,
            seeds: seeds,
        });
        matchesInRound = Math.ceil(matchesInRound / 2);         // The number of matches will be halved in the next rounds
    }
    return rounds;
};

function UserFixtures() {
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

    const numberOfRounds = calculateRounds(playerPool);

    const rounds = generateRounds(playerPool);

    // Need API Call for players playing in the preliminary matches

    return (
        <div className = "flex flex-col gap-8">
            <h2 className = "text-3xl font-bold mt-10"> Tournament Fixtures </h2>
            <div className = "preliminary-match-table border p-5 h-[300px]">
                
            </div>
        </div>

    );




}

export default UserFixtures;