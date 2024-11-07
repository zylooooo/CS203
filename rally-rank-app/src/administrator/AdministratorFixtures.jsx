// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from "react-brackets";

// Administrator Components Imports
import WinnersTable from "./components/WinnersTable";
import UpdateResultsCard from "./components/UpdateResultsCard";
import UpdateMatchTimingsCard from "./components/UpdateMatchTimingsCard";
import PreliminaryPlayersTable from "./components/PreliminaryPlayersTable";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";
import AlertMessageSuccess from "../components/AlertMessageSuccess";

<<<<<<< HEAD
// Icons Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
=======
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
                                className = "border p-2 m-3"
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
            console.log("API Response:", response.data);
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
            // Success Alert Message: Match details updated successfully
            alert("Match details updated successfully");
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
>>>>>>> 38f27615328dd1133f0b8c2e96c9cdd1c366f54d

function AdministratorFixtures() {
    const location = useLocation();
    const navigate = useNavigate();
    const tournamentName = location.state?.tournamentName;

    // Const: Hold referance for scrolling
    const mainFixturesRef = useRef(null);

    // Consts: For determining the dropdown for the important rounds (QF, SF, F)
    const [showFinals, setShowFinals] = useState(false);
    const [showSemiFinals, setShowSemiFinals] = useState(false);
    const [showQuarterFinals, setShowQuarterFinals] = useState(false);

    // Consts: For toggling the dropdown for important rounds (QF, SF, F)
    const toggleQuarterFinals = () => setShowQuarterFinals(!showQuarterFinals);
    const toggleSemiFinals = () => setShowSemiFinals(!showSemiFinals);
    const toggleFinals = () => setShowFinals(!showFinals);
    
    // Consts: Hold data from API Call
    const [mainMatches, setMainMatches] = useState([]);
    const [preliminaryMatches, setPreliminaryMatches] = useState([]);
    const [tournamentBracket, setTournamentBracket] = useState(null);
    const [mainTournamentRounds, setMainTournamentRounds] = useState([]);

    // Consts: Hold winners of each important round (QF, SF and F)
    const [tournamentWinner, setTournamentWinner] = useState("");
    const [semiFinalsWinners, setSemiFinalsWinners] = useState([]);
    const [quarterFinalsWinners, setQuarterFinalsWinners] = useState([]);

    // Consts: Hold the matches of each important round (QF, SF and F)
    const [finalsMatch, setFinalsMatch] = useState([]);
    const [semiFinalMatches, setSemiFinalMatches] = useState([]);
    const [quarterFinalMatches, setQuarterFinalsMatches] = useState([]);

    // Consts to hold updating match-related data
    const [currentMatch, setCurrentMatch] = useState({});
    const [showUpdateResultsCard, setShowUpdateResultsCard] = useState(false);
    const [showUpdateMatchTimingsCard, setShowUpdateMatchTimingsCard] = useState(false);

    // Function: Format Date for easy readability
    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        const date = new Date(dateString);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
    };

    // Function: Handle click for each seed
    const handleClick = (id) => {
        for (let i = 0; i < mainMatches.length; i++) {
            for (let j = 0; j < mainMatches[i].matches.length; j++) {
                if (mainMatches[i].matches[j].id === id) {
                    handleMatchClick(mainMatches[i].matches[j]);
                }
            }
        }
    };

    const handleMatchClick = (match) => {
        setCurrentMatch(match);
        if (match.startDate === null) {
            setShowUpdateMatchTimingsCard(true);
        } else if (match.matchWinner === null) {
            setShowUpdateResultsCard(true);
        }
    };

    const scrollToMainFixtures = () => {
        if (mainFixturesRef.current) {
            mainFixturesRef.current.scrollIntoView({ behavior: "smooth" });
        }
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

            // Warning Message Alerts
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
                const currentFixtures = response.data.rounds.slice(1);  // starts from the index 1 - main match
                for (let roundIndex = 0; roundIndex < currentFixtures.length; roundIndex++) {
                    const seeds = [];
                    const matchesPerRound = currentFixtures[roundIndex]?.matches;
                    let roundTitle = `Round ${roundIndex + 1}`;
                    if (matchesPerRound.length === 4) {
                        roundTitle = "Quarter Finals";
                        setQuarterFinalsWinners(matchesPerRound.map(match => match.matchWinner));
                        setQuarterFinalsMatches(currentFixtures[roundIndex].matches);
                        console.log("q finals: ", currentFixtures[roundIndex]);
                    } else if (matchesPerRound.length === 2) {
                        roundTitle = "Semi Finals";
                            setSemiFinalsWinners(matchesPerRound.map(match => match.matchWinner));
                            setSemiFinalMatches(currentFixtures[roundIndex].matches);
                    } else if (matchesPerRound.length === 1 && roundIndex != 0) {
                        roundTitle = "Finals";
                        setFinalsMatch(currentFixtures[roundIndex].matches);
                    }
                    for (let i = 0; i < matchesPerRound.length; i++) {
                        if (matchesPerRound.length === 1) {
                            setTournamentWinner(currentFixtures[roundIndex].matches[i].matchWinner);
                        }
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
            console.error('Error updating match results:', errorMessage);
        }
    };

    // ----------------------- UseEffect() -----------------------
    useEffect(() => {
        getTournamentBracket();
    }, []);

    return (
        <div className = "administrator-fixtures flex flex-col gap-8 p-9">
            <button
                onClick = {scrollToMainFixtures}
                className = {`scroll-button p-2 text-white rounded-lg shadow-md mb-4 ${!tournamentBracket ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600'}`}
                style = {{ backgroundColor: !tournamentBracket ? 'gray' : 'grey' }}
                disabled = {!tournamentBracket}
            >
                Go to Main Tournament Fixtures
            </button>
            <div className = "flex flex-col items-center gap-4">
                {tournamentBracket === null && (
                    <p className = "font-bold text-xl"> Preliminary Rounds and Main Tournament Fixtures has not been generated yet. </p>
                )}
            </div>
            {preliminaryMatches.length > 0 && (
                <PreliminaryPlayersTable preliminaryMatches = {preliminaryMatches} handleMatchClick = {handleMatchClick} />
            )}
            <button className = "text-2xl font-bold shadow-lg p-2 rounded-[12px]" onClick = {toggleQuarterFinals}>
                View Quarter Finals
                <span className = "text-lg ml-2">
                    <FontAwesomeIcon icon = {showQuarterFinals ? faChevronUp : faChevronDown} />
                </span>
            </button>
            {showQuarterFinals && quarterFinalsWinners.length > 0 && quarterFinalMatches.length > 0 && (
                <div className = "flex-1 shadow-xl rounded-[12px]">
                    <WinnersTable winners = {quarterFinalsWinners} matches = {quarterFinalMatches} />
                </div>
            )}
            <button className = "text-2xl font-bold shadow-lg p-2 rounded-[12px]" onClick = {toggleSemiFinals}>
                View Semi Finals
                <span className = "text-lg ml-2">
                    <FontAwesomeIcon icon = {showSemiFinals ? faChevronUp : faChevronDown} />
                </span>
            </button>
            {showSemiFinals && semiFinalsWinners.length > 0 && semiFinalMatches.length > 0 && (
                <div className="flex-1 shadow-xl rounded-[12px]">
                    <WinnersTable winners = {semiFinalsWinners} matches = {semiFinalMatches} />
                </div>
            )}

            <button className = "text-2xl font-bold shadow-lg p-2 rounded-[12px]" onClick = {toggleFinals}>
                View Finals
                <span className="text-lg ml-2">
                    <FontAwesomeIcon icon = {showFinals ? faChevronUp : faChevronDown} />
                </span>
            </button>
            {showFinals && (
                <>
                    {finalsMatch && finalsMatch.length > 0 ? (
                        <div className = "flex-1">
                            <WinnersTable winners = {tournamentWinner} matches = {finalsMatch} />
                        </div>
                    ) : (
                        <div className = "flex-1 p-4 text-center text-lg font-semibold text-gray-500">
                            No Finals matches available.
                        </div>
                    )}
                </>
            )}
            {mainMatches.length > 0 && tournamentBracket !== null && (
                <div ref = {mainFixturesRef} className = "main-tournament-brackets mb-20">
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
            )}
            {showUpdateMatchTimingsCard && (
                <UpdateMatchTimingsCard matchDetails={currentMatch} setShowUpdateMatchTimingsCard={setShowUpdateMatchTimingsCard} />
            )}
            {showUpdateResultsCard && (
                <UpdateResultsCard matchDetails={currentMatch} setShowUpdateResultsCard={setShowUpdateResultsCard} />
            )}
        </div>
    );
};

export default AdministratorFixtures;