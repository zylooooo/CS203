// Config imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from "react-brackets";

// Administrator Components Imports
import WinnersTable from '../components/WinnersTable';
import MatchResultsCard from '../components/MatchResultsCard';
import UpdateResultsCard from '../components/UpdateResultsCard';
import UpdateMatchTimingsCard from '../components/UpdateMatchTimingsCard';
import PreliminaryPlayersTable from '../components/PreliminaryPlayersTable';

// Assets and Components Imports
import ConfirmationPopUp from "../components/ConfirmationPopUp";
import AlertMessageWarning from "../components/AlertMessageWarning";
import AlertMessageSuccess from "../components/AlertMessageSuccess";

// Icons Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronCircleDown, faChevronCircleUp, faTrophy } from '@fortawesome/free-solid-svg-icons';

import React from 'react';

function AdministratorFixtures() {

    useEffect(() => {
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    const location = useLocation();
    const navigate = useNavigate();
    const { status, tournamentName } = useParams();
    const isPastTournament = (status === "history");

    // Const: Hold reference for scrolling
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
    const [thisAdministrator, setThisAdministrator] = useState(false);

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
    const [showMatchResultsCard, setShowMatchResultsCard] = useState(false);
    const [showConfirmationPopUp, setShowConfirmationPopUp] = useState(false);
    const [showUpdateResultsCard, setShowUpdateResultsCard] = useState(false);
    const [showUpdateMatchTimingsCard, setShowUpdateMatchTimingsCard] = useState(false);

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Function: Format Date to date and time for easy readability
    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        const date = new Date(dateString);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}, ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
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
        } else if (match.startDate !== null && match.matchWinner !== null) {
            setShowMatchResultsCard(true);
        }
    };

    const scrollToMainFixtures = () => {
        if (mainFixturesRef.current) {
            mainFixturesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleEndTournament = () => {
        setShowConfirmationPopUp(true);
    };

    const handleFinalConfirmation = async () => {
        await updateTournamentEndDate();
    };

    const handleGenerateBracketsClick = async () => {
        await generateBrackets();
    };

    const checkThisAdmin = (adminName) => {
        return adminName === thisAdministrator;
    };

    // Component: Custom Seed from React Package (react-brackets)
    const CustomSeed = ({ seed, breakpoint }) => {
        return (
            <Seed mobileBreakpoint = {breakpoint} style = {{ fontSize: "12px" }}>
                <SeedItem onClick = {() => handleClick(seed.id)} style = {{ backgroundColor: "#E7F5E8", padding: "10px", borderRadius: "12px", width: "250px" }}>
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

    // -------------------------- API Call: Generate brackets ---------------------------
    async function generateBrackets() {
        try {
        const adminData = JSON.parse(localStorage.getItem("adminData"));
        if (!adminData || !adminData.jwtToken) {
            console.error("No JWT token found");
            return;
        }

        const response = await axios.put(
            `${API_URL}/admins/tournaments/bracket/${tournamentName}`,
            {},
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${adminData.jwtToken}`,
                },
            },
        );

        if (response.data.error) {
            setWarningMessage(response.data.error);
        } else {
            setSuccessMessage("Brackets generated successfully! View the fixtures below!");
        }
        return response.data;

        } catch (error) {
            setWarningMessage("Unable to generate brackets. Please reload and try again.");
            console.error("Error generating brackets:", error.response.data.error);
        }
    };

    // ----------------------- API Call: Get all matches in the tournament (for brackets use) -----------------------
    async function getTournamentBracket() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            };

            const response = await axios.get(
                `${API_URL}/admins/tournaments/${tournamentName}/bracket`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );

            const thisAdministrator = response.data.createdBy;
            setThisAdministrator((thisAdministrator === adminData.adminName));

            if (response.data.error !== undefined) {
                setWarningMessage(response.data);
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
            setWarningMessage("No match has been played yet.");
            const errorMessage = error.response?.data?.error || 'An unknown error occurred';
        }
    };

    // ----------------------- UseEffect() -----------------------
    useEffect(() => {
        getTournamentBracket();
    }, []);

    // ----------------------- API Call: Update Tournament End Date -----------------------
    async function updateTournamentEndDate() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            }

            const response = await axios.put(
                `${API_URL}/admins/tournaments/${tournamentName}/end`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );

            if (response.status === 200) {
                setSuccessMessage("Tournament has ended!")
            } else {
                setWarningMessage("Error occured while updating tournament end date. Please try again.");
            }

        } catch (error) {
            setWarningMessage("Unable to update tournament end date. Please try again.");
            const errorMessage = error.response?.data?.error || 'An unknown error occurred';
            console.error('Error updating tournament end date:', errorMessage);
        }
    };

    return (
        <>
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div className = "administrator-fixtures flex flex-row gap-8 p-9">
                <div className = "w-full">
                    <h2 className = "m-5 text-2xl"><span className = "font-bold"> Tournament Name: </span> {tournamentName}</h2>
                    <button
                        onClick = {scrollToMainFixtures}
                        className = {`scroll-button p-2 text-white rounded-lg shadow-md mb-6 w-full font-semibold text-lg ${!tournamentBracket ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600'}`}
                        style = {{ backgroundColor: !tournamentBracket ? 'gray' : 'grey' }}
                        disabled = {!tournamentBracket}
                    >
                        Go to Main Tournament Fixtures <FontAwesomeIcon icon = {faChevronDown} />
                    </button>
                    <div className = "flex flex-col items-center gap-4">
                        {tournamentBracket === null && (
                            <p className = "font-bold text-xl mt-8"> Preliminary Rounds and Main Tournament Fixtures has not been generated yet. </p>
                        )}
                    </div>
                    <div className = "mb-12">
                        {preliminaryMatches.length > 0 && (
                            <PreliminaryPlayersTable preliminaryMatches = {preliminaryMatches} handleMatchClick = {handleMatchClick} />
                        )}
                    </div>
                    {mainMatches.length > 0 && tournamentBracket !== null && tournamentWinner && (
                        <div ref = {mainFixturesRef} className = "main-tournament-brackets mb-20">
                            <h2 className = "text-2xl font-bold mb-10"> Main Tournament Fixtures and Results </h2>
                            <div className = "flex flex-col items-center text-center bg-green-100 p-4 rounded-lg w-1/3 shadow-md mb-10">
                                <FontAwesomeIcon icon = {faTrophy} className = "text-yellow-500 text-3xl mb-2" />
                                <h3 className = "text-2xl font-bold text-green-700"> Tournament Winner: {tournamentWinner} </h3>
                            </div>
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
                        <UpdateMatchTimingsCard matchDetails = {currentMatch} setShowUpdateMatchTimingsCard = {setShowUpdateMatchTimingsCard} />
                    )}
                    {showUpdateResultsCard && (
                        <UpdateResultsCard matchDetails = {currentMatch} setShowUpdateResultsCard = {setShowUpdateResultsCard} />
                    )}
                    {showMatchResultsCard && (
                        <MatchResultsCard matchDetails = {currentMatch} setShowMatchResultsCard = {setShowMatchResultsCard}/>
                    )}
                </div>
                <div className = "flex flex-col w-1/3 gap-5 mt-12">
                    <div className = "flex flex-col">
                        <button className = "text-xl font-bold shadow-lg p-2 rounded-[12px]" onClick = {toggleQuarterFinals}>
                            View Quarter Finals
                            <span className = "text-lg ml-2">
                                <FontAwesomeIcon icon = {showQuarterFinals ? faChevronCircleUp : faChevronCircleDown} />
                            </span>
                        </button>
                        {showQuarterFinals && quarterFinalsWinners.length > 0 && quarterFinalMatches.length > 0 && (
                            <div className = "flex-1 shadow-xl rounded-[12px]">
                                <WinnersTable winners = {quarterFinalsWinners} matches = {quarterFinalMatches} />
                            </div>
                    )}
                    </div>
                    <div className = "flex flex-col">
                        <button className = "text-xl font-bold shadow-lg p-2 rounded-[12px]" onClick = {toggleSemiFinals}>
                            View Semi Finals
                            <span className = "text-xl ml-2">
                                <FontAwesomeIcon icon = {showSemiFinals ? faChevronCircleUp : faChevronCircleDown} />
                            </span>
                        </button>
                        {showSemiFinals && semiFinalsWinners.length > 0 && semiFinalMatches.length > 0 && (
                            <div className="flex-1 shadow-xl rounded-[12px]">
                                <WinnersTable winners = {semiFinalsWinners} matches = {semiFinalMatches} />
                            </div>
                        )}
                    </div>
                    <div className = "flex flex-col">
                        <button className = "text-xl font-bold shadow-lg p-2 rounded-[12px]" onClick = {toggleFinals}>
                            View Finals
                            <span className="text-lg ml-2">
                                <FontAwesomeIcon icon = {showFinals ? faChevronCircleUp : faChevronCircleDown} />
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
                    </div>
                </div>
            </div>
            <div className = "flex flex-col gap-4 ml-2 self-start mt-4 mr-6">
                {checkThisAdmin(mainMatches.createdBy) && !isPastTournament && (
                    <button
                        onClick = {handleGenerateBracketsClick}
                        className = "bg-primary-color-light-green hover:bg-primary-color-green text-white border px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                    >
                        Generate Brackets
                    </button>
                )}
            </div>
            {!isPastTournament && thisAdministrator && (
                <div className = "fixed bottom-20 right-12">
                    {mainMatches.length > 0 && tournamentBracket !== null && mainMatches[mainMatches?.length - 1].matches?.length === 1  ? (
                        <button
                            className = "font-bold rounded-lg px-10 py-2 text-white bg-primary-color-light-green hover:bg-primary-color-green"
                            onClick = {handleEndTournament}
                        >
                            Complete Tournament
                        </button>
                    ) : (
                        <button
                            className = "font-bold rounded-lg px-10 py-2 text-white bg-secondary-color-red hover:bg-red-600"
                            onClick = {handleEndTournament}
                        >
                            Stop Tournament
                        </button>
                    )}
                    {showConfirmationPopUp && (
                        <ConfirmationPopUp
                            message = "Do you want to confirm the end of the tournament?"
                            onConfirm = {handleFinalConfirmation}
                            onCancel = {() => setShowConfirmationPopUp(false)}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default AdministratorFixtures;