import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, act } from "react";

// Component: Leaderboard Buttons ("Top")
const LeaderboardButtons = ({ buttons, onTopClick, activeButton, setActiveButton }) => {        // Need to add "Mixed Gender, Other Gender buttons"
    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onTopClick();
        }
    };

    return (
        <div className = "leaderboard-buttons flex gap-5 mb-4">
            {buttons.map((buttonLabel, index) => (
                <button
                    key = {index}
                    className = {`btn transition-colors duration-300 ${
                        activeButton === index
                        ? "active-button underline text-blue-600"       // active state
                        : "text-gray-700 hover:text-blue-500"           // inactive state
                    }`}
                    onClick = {() => handleButtonClick(index)}
                >
                    {buttonLabel}
                </button>
            ))}
        </div>
    );
};

// Component: Scheduled Tournament Card
const ScheduledTournamentCard = ({ scheduledTournaments }) => {
    const navigate = useNavigate();

    const handleScheduledTournamentCardClick = (scheduledTournament) => {
        navigate("/tournament-details", {state: scheduledTournament});
    }

    return (
        <div className = "space-y-4">
            {scheduledTournaments.length > 0 ? (
                scheduledTournaments.map((scheduledTournament, index) => (
                    <div
                        key = {index}
                        className = "scheduled-tournament-card bg-blue-700 p-4 rounded-md shadow-md cursor-pointer hover:shadow-lg transition"
                        style = {{ backgroundColor: "#DDF2D1" }}
                        onClick = {() => handleScheduledTournamentCardClick(scheduledTournament)}
                    >
                        <h3 className = "text-lg font-semiblod"> {index + 1}. {scheduledTournament.tournamentName} </h3>
                        <p className = "text-sm mt-2">
                            <span className = "font-semiblod"> Date: </span>
                            {scheduledTournament.startDate}
                        </p>
                        <p className = "text-sm mt-2">
                            <span className = "font-semiblod"> Organiser: </span>
                            {scheduledTournament.createdBy}
                        </p>
                    </div>
                ))
            ) : (
                <p> You have no scheduled tournaments. Join one today! </p>
            )}
        </div>
    );
};

function UserHome() {
    const navigate = useNavigate();

    // ------------------------------------- Join Tournament Functions -------------------------------------
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleJoinTournament = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/users/Tournaments");
        }, 300);
    };

    // ------------------------------------- Availability Functions -------------------------------------
    const [isAvailable, setIsAvailable] = useState(false);
    
    const handleAvailabilityToggle = () => {
        setIsAvailable(!isAvailable);
    };

    // API Call: Updating availability
    async function updateAvailability() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!");
                return;
            }
            
            const response = await axios.put(
                "http://localhost:8080/users/update-availability",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    },
                    data: {
                        "available": isAvailable
                    }
                }
            );

            console.log("Availbility updated?: " + response.data);
            
            handleAvailabilityToggle();
        } catch (error) {
            console.error("Error updating availability: ", error);
        }
    }

    // ------------------------------------- Scheduled Tournaments Functions -------------------------------------
    const [scheduledTournaments, setScheduledTournaments] = useState([]);
    
    // API Call: Retrieving list of user's scheduled tournaments
    async function getScheduledTournaments() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/tournaments/available-tournaments",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );

            console.log("Scheduled Tournaments Data Received: " + response.data);

            setScheduledTournaments(response.data);
        } catch (error) {
            console.error("Error fetching scheduled tournaments: ", error);
        }
    }

    // ------------------------------------- Leaderboard Functions -------------------------------------
    const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);

    const [view, setView] = useState("Top");

    const [activeButton, setActiveButton] = useState(0);

    const handleTopClick = () => {
        setView("Top");
    };

    // API Call: Receiving players in the leaderboard
    async function getDefaultLeaderboard() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/leaderboard",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );

            console.log("Scheduled Tournaments Data Received: " + response.data);

            setLeaderboardPlayers(response.data);
        } catch (error) {
            console.error("Error fetching scheduled tournaments: ", error);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getDefaultLeaderboard();
        getScheduledTournaments();
    }, []);

    return (
        <div className = {`home-container main-container h-screen-minus-navbar transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            {/* ROW CONTAINER: JOIN TOURNAMENT, MY SCHEDULED TOURNAMENTS */}
            <div className = "row-container flex flex-col w-3/5 gap-6">
                {/* JOIN TOURNAMENT */}
                <div className = "join-tournament-container bg-white p-6 gap-2 h-1/5">
                    <h2 className = "text-xl font-semibold mb-4"> Join a tournament today! </h2>
                    <button
                        className = "join-tournament-button bg-green-600 text-white font-bold py-3 px-6 rounded-[8px] shadow-md hover:bg-green-700 transition duration-200 w-full"
                        onClick = {handleJoinTournament}
                        style = {{ backgroundColor: "#E0E0E0" }}
                    >
                        Join!
                    </button>
                </div>
                {/* MY SCHEDULED TOURNAMENTS */}
                <div className = "my-scheduled-tournaments-container h-2/3">
                    <h2 className = "text-xl font-semibold mb-4"> My Scheduled Tournaments! </h2>
                    <div className = "p-6 bg-blu-500 text-white rounded shadow-lg h-5/6 overflow-auto">
                        <ScheduledTournamentCard scheduledTournaments = {scheduledTournaments} />
                    </div>
                </div>
            </div>

            {/* COLUMN CONTAINER: LEADERBOARD, AVAILABILITY */}
            <div className = "column-container gap-20">
                {/* LEADERBOARD */}
                <div className = "leaderboard-container h-1/2 gap-8 p-3">
                    <h2 className = "text-xl font-semibold"> RallyRank Top 10 Leaderboard </h2>
                    <LeaderboardButtons
                        buttons = {["Top"]}
                        onTopClick = {handleTopClick}
                        activeButton = {activeButton}
                        setActiveButton = {setActiveButton}
                    />
                    <div className = "leaderboard-box p-5 gap-3 bg-gray-100 border border-gray-300 text-sm h-5/6 w-full min-w-72 flex flex-col overflow-auto">
                    {leaderboardPlayers.length > 0 ? (
                        leaderboardPlayers.map((player, index) => (
                            <div key = {index} className = "flex justify-between gap-2">
                                <p> Username: {player.username} </p>
                                <p> Elo Rating: {player.elo} </p>
                            </div>
                        ))
                    ) : (
                        <p className = "p-2"> No players available. </p>
                    )}
                    </div>
                </div>
                {/* AVAILABILITY */}
                <div className = "availability-container h-1/2 gap-8 p-3">
                    <h2 className = "text-xl font-semibold"> Availbility </h2>
                    <div className = "availability-box bg-gray-100 border-gray-300 text-sm h-1/2 w-full min-w-72 flex flex-col p-2">
                        <p> Are you available for tournaments? </p>
                        <div className = "mt-2 flex items-center">
                            <label className = "relative inline-flex items-center cursor-pointer">
                                <input
                                    type = "checkbox"
                                    checked = {isAvailable}
                                    onChange = {handleAvailabilityToggle}
                                    className = "sr-only peer"
                                />
                                <div className = "w-11 h-6 bg-secondary-color-light-gray rounded-full peer peer-checked:bg-primary-color-green peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-color-white after:border-primary-color-light-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                <span className = "ml-3 text-sm font-medium text-gray-700"> { isAvailable ? "Yes" : "No" } </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserHome;