// Package Imports
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from "react-brackets";

// Component: Custom Seed for React-Brackets
const CustomSeed = ({ seed, breakpoint }) => {
    return (
        <Seed mobileBreakpoint={breakpoint} style={{ fontSize: "12px" }}>
            <SeedItem style={{ backgroundColor: "#E7F5E8", padding: "10px", borderRadius: "12px" }}>
                <div>
                    <SeedTeam style={{ color: "#444444", fontWeight: "700", fontSize: "14px" }}>
                        {seed.teams[0]?.name || "TBD"}
                    </SeedTeam>
                    <hr style={{ margin: "5px 0", border: "1px solid #CCCCCC" }} />
                    <SeedTeam style={{ color: "#222222", fontWeight: "700", fontSize: "14px" }}>
                        {seed.teams[1]?.name || "TBD"}
                    </SeedTeam>
                </div>
            </SeedItem>
            <SeedTime style={{ marginBottom: "20px", color: "#222222", fontWeight: "700", fontSize: "14px" }}>
                {seed.date}
            </SeedTime>
        </Seed>
    );
};

// Component: Preliminary Matches
const PreliminaryPlayersTable = ({ preliminaryMatches }) => {
    return (
        <div className="preliminary-matches p-5 h-1/2 overflow-y-auto">
            <h2 className="text-2xl font-bold"> Preliminary Matches </h2>
            <div className="mt-4 flex flex-col gap-4">
                {preliminaryMatches.length > 0 && preliminaryMatches.map((match, index) => {
                    if (index % 2 === 0) {
                        return (
                            <div key={index} className="match-card flex items-center gap-4 mb-4">
                                <div className="player-card border border-gray-300 rounded-lg p-4 shadow-md w-1/4 inline-flex items-center gap-2">
                                    <span className="font-semibold text-lg"> Player 1: </span>
                                    <span className="text-gray-700"> {match.players[0]} </span>
                                </div>
                                <span className="text-lg font-semibold"> VS </span>
                                <div className="player-card border border-gray-300 rounded-lg p-4 shadow-md w-1/4 inline-flex items-center gap-2">
                                    <span className="font-semibold text-lg"> Player 2: </span>
                                    <span className="block text-gray-700">{match.players[1] || "TBD"}</span>
                                </div>
                                <div className="winner-card text-sm font-semibold w-1/4 ml-5">
                                    <span className="text-gray-600 text-lg font-semibold"> Match Winner: </span>
                                    <span className="text-green-600">
                                        {match.matchWinner || "TBD"}
                                    </span>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

// Main Component: UserFixtures (Read-Only View)
function UserFixtures() {
    const location = useLocation();
    const tournamentName = location.state?.tournamentName;

    // State to hold data from API Call
    const [mainMatches, setMainMatches] = useState([]);
    const [preliminaryMatches, setPreliminaryMatches] = useState([]);
    const [tournamentBracket, setTournamentBracket] = useState(null);
    const [mainTournamentRounds, setMainTournamentRounds] = useState([]);

    // Function: Format Date for easy readability
    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        const date = new Date(dateString);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
    };

    // API Call: Get all matches in the tournament (for brackets use)
    async function getTournamentBracket() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found");
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/users/tournaments/${tournamentName}/bracket`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                }
            );

            if (response.data.error !== undefined) {
                console.log("error: ", response.data);
            }

            if (response.data.rounds.length !== 0) {
                setTournamentBracket(response.data);
            }

            if (response.data.rounds[0].matches.length > 0) {
                setPreliminaryMatches(response.data.rounds[0].matches);
            }

            if (response.data.rounds.length > 1) {
                setMainMatches(response.data.rounds.slice(1));
                const roundsArr = [];
                const currentFixtures = response.data.rounds.slice(1);
                for (let roundIndex = 0; roundIndex < currentFixtures.length; roundIndex++) {
                    const seeds = [];
                    const matchesPerRound = currentFixtures[roundIndex]?.matches;
                    let roundTitle = `Round ${roundIndex + 1}`;
                    if (matchesPerRound.length === 4) {
                        roundTitle = "Quarter Finals";
                    } else if (matchesPerRound.length === 2) {
                        roundTitle = "Semi Finals";
                    } else if (matchesPerRound.length === 1) {
                        roundTitle = "Finals";
                    }
                    for (let i = 0; i < matchesPerRound.length; i++) {
                        seeds.push({
                            id: currentFixtures[roundIndex].matches[i].id,
                            date: formatDate(currentFixtures[roundIndex].matches[i].startDate) || "TBD",
                            teams: [
                                {
                                    name: currentFixtures[roundIndex].matches[i].players[0] || "TBD",
                                },
                                {
                                    name: currentFixtures[roundIndex].matches[i].players[1] || "TBD",
                                },
                            ],
                        });
                    }
                    roundsArr.push({
                        title: roundTitle,
                        seeds: seeds,
                    });
                }
                setMainTournamentRounds(roundsArr);
            }
            return response;

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'An unknown error occurred';
            alert(errorMessage);
            console.error('Error fetching tournament brackets:', errorMessage);
        }
    };

    // UseEffect: Fetch data on component mount
    useEffect(() => {
        getTournamentBracket();
    }, []);

    return (
        <div className="user-fixtures flex flex-col gap-8 p-9">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-3xl font-bold mt-10"> Tournament Fixtures </h2>
                {tournamentBracket === null &&
                    <p> Tournament Fixtures Brackets have not been generated. </p>
                }
            </div>
            {preliminaryMatches.length > 0 &&
                <PreliminaryPlayersTable preliminaryMatches={preliminaryMatches} />
            }
            {mainMatches.length > 0 &&
                <div className="main-tournament-brackets mb-20">
                    <h2 className="text-2xl font-bold mb-10"> Main Tournament Fixtures and Results </h2>
                    <Bracket
                        rounds={mainTournamentRounds}
                        roundTitleComponent={(title) => (
                            <div style={{ textAlign: "center", color: "green", fontWeight: "600", fontSize: "18px" }}>
                                {title}
                            </div>
                        )}
                        renderSeedComponent={CustomSeed}
                    />
                </div>
            }
        </div>
    );
};

export default UserFixtures;