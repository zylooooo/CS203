// Package Imports
import axios from "axios";
import { useState, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import { useLocation, useNavigate} from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from "react-brackets";

// Component: Match Timings Card
const UpdateMatchTimingCard = ({ matchDetails, setShowUpdateMatchTimingsCard }) => {
    const { register, handleSubmit, formState: { errors }} = useForm();

    // ----------------------- API Call: Update a specific match timing -----------------------
    async function updateMatchTimings(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            // Updated Match startDate in matchDetails
            const updatedMatchStartDate = {
                ...matchDetails,
                startDate: formData.startDate,
            };

            const response = await axios.put(
                "http://localhost:8080/admins/tournaments/match",
                updatedMatchStartDate,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );
            return response.data;

        } catch (error) {
            // Warning Alert Message: Unable to update the match timings
            alert("Unable to update match timings.");
            console.error("Error updating match timings: ", error.response.data.error);
        }
    };

    const onUpdateMatchTimingsSubmit = async (formData) => {
        const response = await updateMatchTimings(formData);
        if (response !== undefined) {
            // Success Alert Message: Match timings updated successfully
            alert("Match timings updated successfully");
            setShowUpdateMatchTimingsCard(false);
        }
    };

    return  (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "update-match-results-card-template flex flex-col gap-4 p-9 rounded-[8px] max-w-[550px] bg-primary-color-white">
                <form onSubmit = {handleSubmit(onUpdateMatchTimingsSubmit)}>
                    <div className = "flex flex-col gap-6">
                        <div>
                            <h1 className = "text-2xl font-semibold"> Match Timing </h1>
                        </div>
                        <div className = "flex justify-center mt-2">
                            <p className = "text-center font-bold">
                                {matchDetails.players[0]} vs {matchDetails.players[1]}
                            </p>
                        </div>
                        {/* UPDATE MATCH DATE AND TIME */}
                        <div>
                            <input
                                className = "border2 p-2 m-3"
                                type = "datetime-local"
                                id = "startDate"
                                {...register("startDate", {required: "Match date and time is required"})}
                            />
                            <p className = "error"> {errors.startDate?.message} </p>
                        </div>
                        <div className = "flex justify-between">
                            {/* CANCEL BUTTON */}
                            <button
                                type = "button"
                                onClick = {() => setShowUpdateMatchTimingsCard(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            {/* SUBMIT BUTTON */}
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-custom-green transition"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Component: Results Card
const UpdateResultsCard = ({ matchDetails, setShowUpdateResultsCard }) => {
    const [sets, setSets] = useState([1]);
    const [matchWinner, setMatchWinner] = useState("");
    const { register, handleSubmit, formState: { errors }} = useForm();
    
    // Const: Store each player in the match respectively
    const player1 = matchDetails.players[0];
    const player2 = matchDetails.players[1];

    // Function: Determine match winner based on the number of sets won
    // Assumptions:
    //      1. Never more than 5 sets
    //      2. Only 1 winner (Best of 3)
    function determineSetWinner(setScores, player1, player2) {
        let player1Sets = 0;
        let player2Sets = 0;
        setScores.forEach(set => {
            if (set.result[0] > set.result[1]) {
                player1Sets++;
            }
            if (set.result[1] > set.result[0]) {
                player2Sets++;
            }
        });
        return player1Sets > player2Sets ? player1 : player2;
    };

    // ----------------------- API Call: Update a specific match's results -----------------------
    async function updateMatchResults(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            // Convert form data into the expected sets format
            const setScores = sets.map((setNumber) => ({
                result: [
                    parseInt(formData[`set${setNumber}Player1`]),
                    parseInt(formData[`set${setNumber}Player2`]),
                ],
                setWinner: formData[`set${setNumber}Player1`] > formData[`set${setNumber}Player2`] ? player1 : player2,
            }));

            // Determine match winner (based on the setScores)
            const winner = determineSetWinner(setScores, player1, player2);
            setMatchWinner(winner);

            // Updated match results and details
            const updatedMatchDetails = {
                id: matchDetails.id,
                tournamentName: matchDetails.tournamentName,
                startDate: matchDetails.startDate,
                players: matchDetails.players,
                sets: setScores.map(score => ({
                    result: score.result,
                    setWinner: score.setWinner,
                })),
                matchWinner: winner,
                completed: true,
            };

            const response = await axios.put(
                "http://localhost:8080/admins/tournaments/match",
                updatedMatchDetails,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );
            return response.data;

        } catch (error) {
            // Warning Alert Message: Unable to update the match results
            alert("Unable to update match results.");
            console.error("Error updating match results: ", error.response.data.error);
        }
    }

    const onUpdateMatchDetailsSubmit = async (formData) => {
        const response = await updateMatchResults(formData);
        if (response !== undefined) {
            // Success Alert Message: Match timings updated successfully
            alert("Match timings updated successfully");
            setShowUpdateResultsCard(false);
        }
    };

    const handleAddSetsClick = () => {
        setSets(prevSets => [...prevSets, prevSets.length + 1]);
    }
        
    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "update-match-results-card-template flex flex-col gap-4 p-12 rounded-[8px] max-w-[550px] bg-primary-color-white">
                <form onSubmit = {handleSubmit(onUpdateMatchDetailsSubmit)}>
                    <div className = "flex flex-col gap-6"> 
                        <div>
                            <h1 className = "text-2xl font-semibold"> Match Results </h1>
                        </div>
                        <div className = "flex justify-center mt-2">
                            <p className = "text-center font-bold">
                                {matchDetails.players[0]} vs {matchDetails.players[1]}
                            </p>
                        </div>
                        {sets.map((setNumber) => (
                            <div key = {setNumber} className = "flex gap-4 items-center">
                                <p> Set {setNumber} </p>
                                <input
                                    type = "number"
                                    placeholder = {`${matchDetails.players[0]}'s Score`}
                                    className = "border p-2 rounded"
                                    {...register(`set${setNumber}Player1`)}
                                />
                                <input
                                    type = "number"
                                    placeholder = {`${matchDetails.players[1]}'s Score`}
                                    className = "border p-2 rounded"
                                    {...register(`set${setNumber}Player2`)}
                                />
                            </div>
                        ))}
                        <div>
                            {/* ADD NEW SET OPTION */}
                            <button
                                type = "button"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                onClick = {handleAddSetsClick}
                            >
                                Add New Set
                            </button>
                        </div>
                        <div className = "flex justify-between">
                            {/* CANCEL BUTTON */}
                            <button
                                type = "button"
                                onClick = {() => setShowUpdateResultsCard(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            {/* SUBMIT BUTTON */}
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

function AdministratorFixtures() {
    const location = useLocation();
    const navigate = useNavigate();
    const tournamentName = location.state?.tournamentName;
    
    // Consts to hold data from API Call
    const [mainMatches, setMainMatches] = useState([]);
    const [preliminaryMatches, setPreliminaryMatches] = useState([]);
    const [tournamentBracket, setTournamentBracket] = useState(null);
    const [mainTournamentRounds, setMainTournamentRounds] = useState([]);

    // Consts to hold updating match-related data
    const [currentMatch, setCurrentMatch] = useState({});
    const [showUpdateResultsCard, setShowUpdateResultsCard] = useState(false);
    const [showUpdateMatchTimingsCard, setShowUpdateMatchTimingsCard] = useState(false);
    const [showResultsConfirmationCard, setShowResultsConfirmationCard] = useState(false);

    // Function: Handle click for each seed
    const handleClick = (id) => {
        for (let i = 0; i < mainMatches.length; i++) {
            for (let j = 0; j < mainMatches[i].length; j++) {
                if (mainMatches[i].matches[j].id === id) {
                    handleMatchClick(mainMatches[i].matches[j]);
                }
            }
        }
    }

    const handleMatchClick = (match) => {
        setCurrentMatch(match);
        if (match.startDate === null) {
            setShowUpdateMatchTimingsCard(true);
        } else if (match.matchWinner === null) {
            setShowUpdateResultsCard(true);
        }
    };

    // Function: Format Date for easy readability
    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
    };

    // Component: Preliminary Matches
    const PreliminaryPlayersTable = ({ preliminaryMatches }) => {
        return (
            <div className = "preliminary-matches p-5 h-1/2 overflow-y-auto">
                <h2 className = "text-2xl font-bold"> Preliminary Matches </h2>
                <div className = "mt-4 flex flex-col gap-4">
                    {preliminaryMatches.length > 0 && preliminaryMatches.map((match, index) => {
                        if (index % 2 === 0) {
                            return (
                                <button
                                type = "button"
                                onClick = {() => handleMatchClick(match) }
                                >
                                <div key = {index} className = "match-card flex items-center gap-4 mb-4">
                                    <div className = "player-card border border-gray-300 rounded-lg p-4 shadow-md w-1/4 inline-flex items-center gap-2">
                                        <span className = "font-semibold text-lg"> Player 1: </span>
                                        <span className = "text-gray-700"> {match.players[0]} </span>
                                    </div>
                                    <span className = "text-lg font-semibold"> VS </span>
                                    <div className = "player-card border border-gray-300 rounded-lg p-4 shadow-md w-1/4 inline-flex items-center gap-2">
                                        <span className = "font-semibold text-lg"> Player 2: </span>
                                        <span className = "block text-gray-700">
                                            {match.players[1] || "TBD"}
                                        </span>
                                    </div>
                                    <div className = "winner-card text-sm font-semibold w-1/4 ml-5">
                                        <span className = "text-gray-600 text-lg font-semibold"> Match Winner: </span>
                                        <span className = "text-green-600">
                                            {match.matchWinner || "TBD"}
                                        </span>
                                    </div>
                                </div>
                                </button>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    };

    // Component: Custom Seed from React Package (react-brackets)
    const CustomSeed = ({ seed, breakpoint }) => {
        return (
            <Seed mobileBreakpoint = {breakpoint} style = {{ fontSize: "12px" }}>
                <SeedItem onClick = {() => handleClick(seed.id)} style = {{ backgroundColor: "#E7F5E8", padding: "10px", borderRadius: "12px" }}>
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
                        <SeedTime style = {{ marginBottom: "20px", color: "#222222", fontWeight: "700", fontSize: "14px"}}>
                            {seed.date}
                        </SeedTime>
            </Seed>
        );
    };

    // ----------------------- API Call: Get all matches in the tournament (for brackets use) -----------------------
    async function getTournamentBracket() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/admins/tournaments/${tournamentName}/bracket`,
                {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${adminData.jwtToken}`,
                },
                }
            );

            // Warning Message Alert
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
            // Warning Message Alert: Error fetching tournament brackets data
            const errorMessage = error.response?.data?.error || 'An unknown error occurred';
            alert(errorMessage);
            console.error('Error updating match results:', errorMessage);
        }
    };

    // ----------------------- UseEffect() -----------------------
    useEffect(() => {
        getTournamentBracket();
    }, []);

    return (
        <div className = "administrator-fixtures flex flex-col gap-8 p-9">
            <div className = "flex flex-col items-center gap-4">
                <h2 className = "text-3xl font-bold mt-10"> Tournament Fixtures </h2>
                {tournamentBracket === null &&
                    <p> Tournament Fixtures Brackets has not been generated. </p>
                }
            </div>
            {preliminaryMatches.length > 0 &&
                <PreliminaryPlayersTable preliminaryMatches = {preliminaryMatches} handleMatchClick = {handleMatchClick} />
            }
            {mainMatches.length > 0 &&
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
            }
            {showUpdateMatchTimingsCard &&
                <UpdateMatchTimingCard matchDetails = {currentMatch} setShowUpdateMatchTimingsCard = {setShowUpdateMatchTimingsCard} />
            }
            {showUpdateResultsCard &&
                <UpdateResultsCard matchDetails = {currentMatch} setShowUpdateResultsCard = {setShowUpdateResultsCard} />
            }
        </div>
    );
};

export default AdministratorFixtures;