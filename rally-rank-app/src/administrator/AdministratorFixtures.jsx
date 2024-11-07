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