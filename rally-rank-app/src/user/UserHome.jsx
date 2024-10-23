import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, act } from "react";
import { FaCrown, FaMedal } from "react-icons/fa";
import { set } from "react-hook-form";

// Component: Leaderboard Buttons - "Top", "Other Gender Leaderboard", "Mixed Leaderboard"
const LeaderboardButtons = ({ buttons, onTopClick, onOtherGenderClick, onMixedGenderClick, activeButton, setActiveButton }) => {
    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onTopClick();
        } else if (index === 1) {
            onOtherGenderClick();
        } else {
            onMixedGenderClick();
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

// Component: Leaderboard Card
const LeaderboardCard = ({ leaderboardPlayer, rank }) => {
    const navigate = useNavigate();

    const handleLeaderboardPlayerCardClick = () => {
        navigate("/other-user-profile", { state : {player: leaderboardPlayer } });
    };

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1:
                return <FaCrown className = "text-4xl" style = {{ color: "#EEB609 "}} />
            case 2:
                return <FaMedal className = "text-3xl" style = {{ color: "#A5A9B4" }} />
            case 3:
                return <FaMedal className = "text-3xl" style = {{ color: "#B08D57" }} />
            default:
                return <span className = "text-2xl font-bold"> #{rank} </span>
        }
    };
    return (
        <div
            className = "leaderboard-card bg-white shadow-lg rounded-lg p-4 flex justify-between items-center transition-transform transform hover:scale-105 w-full h-2/5" style = {{ backgroundColor: "#F2F2F2"}}
            onClick = {handleLeaderboardPlayerCardClick}
        >
            <div>
                <h3 className = "text-lg font-bold mb-2"> {leaderboardPlayer.firstName} {leaderboardPlayer.lastName} </h3>
                <h3 className = "text-md"> Username: {leaderboardPlayer.username} </h3>
                <p className = "text-sm text-gray-600"> Elo: {leaderboardPlayer.elo} </p>
            </div>
            <div>
                {getRankIcon(rank)}
            </div>
        </div>
    );
};

// Component: Scheduled Tournament Card
const ScheduledTournamentCard = ({ scheduledTournaments }) => {
    const navigate = useNavigate();

    const handleScheduledTournamentCardClick = (scheduledTournament) => {
        navigate("/tournament-details", { state: { ...scheduledTournament, from: window.location.pathname } });
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
    
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    };

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
                        <h3 className = "text-lg font-semibold"> {index + 1}. {scheduledTournament.tournamentName} </h3>
                        <p className = "text-sm mt-2">
                            <span className = "font-semibold"> Date: </span>
                            {formatDate(scheduledTournament.startDate)}
                        </p>
                        <p className = "text-sm mt-2">
                            <span className = "font-semibold"> Organiser: </span>
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
    const [availability, setAvailability] = useState(false);

    const handleAvailabilityToggle = async () => {
        const updatedAvailability = await updateAvailability();
            setAvailability(updatedAvailability);
    };
    
    async function fetchAvailability() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!");
                return;
            }
            setAvailability(userData.available);
        } catch (error) {
            console.error("Error fetching availability status:", error);
        }
    }

    // ----------------------- API call: Update availability of user in database -----------------------
    async function updateAvailability() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!");
                return;
            }

            const newAvailability = !userData.available;

            const response = await axios.put(
                `http://localhost:8080/users/update-availability?availability=${newAvailability}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );

            if (response.status === 200) {
                userData.available = newAvailability;
                localStorage.setItem("userData", JSON.stringify(userData));     // Updates the new availability in the userData to be passed around
                return newAvailability;
            }
        } catch (error) {
            console.error("Error updating availability: ", error);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        fetchAvailability();
    }, []);

    // ------------------------------------- Scheduled Tournaments Functions -------------------------------------
    const [scheduledTournaments, setScheduledTournaments] = useState([]);

    // ----------------------- API Call: Retrieving list of user's scheduled tournaments -----------------------
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
            setScheduledTournaments(response.data);
        } catch (error) {
            console.error("Error fetching scheduled tournaments: ", error);
        }
    }

    // ------------------------------------- Leaderboard Functions -------------------------------------
    const [defaultLeaderboardPlayers, setDefaultLeaderboardPlayers] = useState([]);

    const [userGender, setUserGender] = useState("")                                            // to retrieve the user's gender from userData

    const [otherGenderLeaderboardPlayers, setOtherGenderLeaderboardPlayers] = useState([]);

    const [mixedGenderLeaderboardPlayers, setMixedGenderLeaderboardPlayers] = useState([]);

    const [view, setView] = useState("Top");

    const [activeButton, setActiveButton] = useState(0);

    const otherGenderButtonLabel = userGender === "Male" ? "Top Female Players" : "Top Male Players";

    const handleTopClick = () => {
        setView("Top");
    };

    const handleOtherGenderClick = () => {
        setView(otherGenderButtonLabel);
        getOtherGenderLeaderboard();
    };

    const handleMixedGenderClick = () => {
        setView("Mixed Gender Leaderboard");
        getMixedGenderLeaderboard();
    }

    // ----------------------- API Call: Receiving players in the leaderboard (User's gender) -----------------------
    async function getDefaultLeaderboard() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            setUserGender(userData.gender);

            const response = await axios.get(
                "http://localhost:8080/users/leaderboard",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            setDefaultLeaderboardPlayers(response.data);
        } catch (error) {
            console.error("Error fetching default leaderboard: ", error);
        }
    }

    // ----------------------- API Call: Receiving players in the leaderboard (Opoosite of user's gender) -----------------------
    async function getOtherGenderLeaderboard() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/leaderboard/opposite-gender",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );

            setOtherGenderLeaderboardPlayers(response.data);
        } catch (error) {
            console.error("Error fetching other gender's leaderboard: ", error);
        }
    }

    // ----------------------- API Call: Receiving players in the leaderboard (Mixed gender) -----------------------
    async function getMixedGenderLeaderboard() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/leaderboard/mixed-gender",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            setMixedGenderLeaderboardPlayers(response.data);
        } catch (error) {
            console.error("Error fetching mixed gender leaderboard: ", error);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getDefaultLeaderboard();
        getScheduledTournaments();
        getMixedGenderLeaderboard();
        getOtherGenderLeaderboard();
    }, []);

    return (
        <div className = {`home-container main-container h-screen-minus-navbar transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            {/* ROW CONTAINER: JOIN TOURNAMENT, MY SCHEDULED TOURNAMENTS */}
            <div className = "row-container flex flex-col w-3/5 gap-8">
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
                    <h2 className = "text-xl font-semibold mb-4"> My Scheduled Tournaments </h2>
                    <div className = "p-6 bg-blu-500 text-white rounded shadow-lg h-5/6 overflow-auto">
                        <ScheduledTournamentCard scheduledTournaments = {scheduledTournaments} />
                    </div>
                </div>
            </div>

            {/* COLUMN CONTAINER: LEADERBOARD, AVAILABILITY */}
            <div className = "column-container gap-2 w-[450px]">
                {/* AVAILABILITY */}
                <div className = "availability-container gap-2 p-3 mb-10">
                    <div className = "availability-box bg-gray-100 border-gray-300 text-sm h-1/2 w-full min-w-72 flex flex-col p-2">
                        <p className = "text-lg"> Are you available for tournaments? </p>
                        <div className = "mt-2 flex items-center">
                            <label className = "relative inline-flex items-center cursor-pointer">
                                <input
                                    type = "checkbox"
                                    checked = {availability}
                                    onChange = {handleAvailabilityToggle}
                                    className = "sr-only peer"
                                />
                                <div className = "w-11 h-6 bg-secondary-color-light-gray rounded-full peer peer-checked:bg-primary-color-green peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-color-white after:border-primary-color-light-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                <span className = "ml-3 text-sm font-medium text-gray-700"> { availability ? "Yes" : "No" } </span>
                            </label>
                        </div>
                    </div>
                </div>
                {/* LEADERBOARD */}
                <div className = "leaderboard-container h-3/4 gap-8 p-3 w-full">
                    <h2 className = "text-xl font-semibold mb-4"> RallyRank's Leaderboard </h2>
                    <LeaderboardButtons
                        buttons = {["Top", otherGenderButtonLabel, "Mixed Leaderboard"]}
                        onTopClick = {handleTopClick}
                        onOtherGenderClick = {handleOtherGenderClick}
                        onMixedGenderClick = {handleMixedGenderClick}
                        activeButton = {activeButton}
                        setActiveButton = {setActiveButton}
                    />
                    <div className = "leaderboard-box p-5 gap-5 bg-gray-100 border border-gray-300 text-sm h-5/6 w-full min-w-72 flex flex-col overflow-auto" style = {{ borderColor: "#D7D7D7" }}>
                        {view === "Top" && defaultLeaderboardPlayers.length > 0 ? (
                            defaultLeaderboardPlayers.map((leaderboardPlayer, index) => (
                                <LeaderboardCard key = {index} leaderboardPlayer = {leaderboardPlayer} rank = {index + 1} />
                            ))
                        ) : view === otherGenderButtonLabel && otherGenderLeaderboardPlayers.length > 0 ? (
                            otherGenderLeaderboardPlayers.map((leaderboardPlayer, index) => (
                                <LeaderboardCard key = {index} leaderboardPlayer = {leaderboardPlayer} rank = {index + 1} />
                            ))
                        ) : view === "Mixed Gender Leaderboard" && mixedGenderLeaderboardPlayers.length > 0 ? (
                            mixedGenderLeaderboardPlayers.map((leaderboardPlayer, index) => (
                                <LeaderboardCard key = {index} leaderboardPlayer = {leaderboardPlayer} rank = {index + 1} />
                            ))
                        ) : (
                            <p className = "p-2"> No players available. </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserHome;