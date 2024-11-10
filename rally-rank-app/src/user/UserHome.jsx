// Configuration Imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";

// Icon Imports
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

// Assets and Components Imports
import UserLeaderboardCard from "../components/UserLeaderboardCard";
import UserLeaderboardButtons from "../components/UserLeaderboardButtons";
import UserScheduledTournamentCard from "../components/UserScheduledTournamentCard";

function UserHome() {

    useEffect(() => {   
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");

    // ------------------------------------- Join Tournament Functions -------------------------------------
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleJoinTournament = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/users/tournaments");
        }, 2000);
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
            setWarningMessage("Unable to fetch your availability status.");
            console.error("Error fetching availability status:", error);
        }
    };

    // ----------------------- API Call: Update availability of user in database -----------------------
    async function updateAvailability() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!");
                return;
            }

            const newAvailability = !userData.available;

            const response = await axios.put(
                `${API_URL}/users/availability?availability=${newAvailability}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                },
            );

            if (response.status === 200) {
                if (!newAvailability) {
                    setSuccessMessage("Availability status changed: Unavailable");
                } else {
                    setSuccessMessage("Availability status changed: Available");
                }
                userData.available = newAvailability;
                localStorage.setItem("userData", JSON.stringify(userData));
                return newAvailability;
            }
        } catch (error) {
            setWarningMessage("Unable to change availability status. Please try again.");
            console.error("Error updating availability: ", error);
        }
    };

    // -------------------- useEffect() --------------------
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
                `${API_URL}/users/tournaments/scheduled`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            setScheduledTournaments(response.data);
        } catch (error) {
            setWarningMessage("Unable to fetch your scheduled tournaments. Please reload the page and try again.");
            console.error("Error fetching scheduled tournaments: ", error);
        }
    };

    // ------------------------------------- Leaderboard Functions -------------------------------------
    const [view, setView] = useState("Top");
    const [userGender, setUserGender] = useState("");
    const [activeButton, setActiveButton] = useState(0);
    const [defaultLeaderboardPlayers, setDefaultLeaderboardPlayers] = useState([]);
    const [otherGenderLeaderboardPlayers, setOtherGenderLeaderboardPlayers] = useState([]);
    const [mixedGenderLeaderboardPlayers, setMixedGenderLeaderboardPlayers] = useState([]);
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
                `${API_URL}/users/leaderboard`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            setDefaultLeaderboardPlayers(response.data);
        } catch (error) {
            setWarningMessage("Unable to fetch players in the leaderboard.");
            console.error("Error fetching default leaderboard: ", error);
        }
    };

    // ----------------------- API Call: Receiving players in the leaderboard (Opoosite of user's gender) -----------------------
    async function getOtherGenderLeaderboard() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            const response = await axios.get(
                `${API_URL}/users/leaderboard/opposite-gender`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                },
            );

            setOtherGenderLeaderboardPlayers(response.data);
        } catch (error) {
            setWarningMessage("Unable to fetch players in the leaderboard.");
            console.error("Error fetching other gender's leaderboard: ", error);
        }
    };

    // ----------------------- API Call: Receiving players in the leaderboard (Mixed gender) -----------------------
    async function getMixedGenderLeaderboard() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!")
                return;
            }

            const response = await axios.get(
                `${API_URL}/users/leaderboard/mixed-gender`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                },
            );
            setMixedGenderLeaderboardPlayers(response.data);
        } catch (error) {
            setWarningMessage("Unable to fetch players in the leaderboard.");
            console.error("Error fetching mixed gender leaderboard: ", error);
        }
    }

    // --------------------- useEffect() ---------------------
    useEffect(() => {
        getDefaultLeaderboard();
        getScheduledTournaments();
        getMixedGenderLeaderboard();
        getOtherGenderLeaderboard();
    }, []);

    return (
        <div className = {`home-container main-container h-main transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            {/* ROW CONTAINER: JOIN TOURNAMENT, MY SCHEDULED TOURNAMENTS */}
            <div className = "row-container flex flex-col w-3/5 gap-8 p-6 mb-2">
                {/* JOIN TOURNAMENT */}
                <div className = "join-tournament-container gap-2 h-1/5">
                    <h2 className = "text-xl font-bold mb-4"> Join A Tournament Today! </h2>
                    <button
                        className = "join-tournament-button bg-green-600 text-xl font-bold py-3 px-6 rounded-[8px] shadow-md hover:bg-green-700 transition duration-200 w-full h-2/5"
                        onClick = {handleJoinTournament}
                        style = {{ backgroundColor: "white" }}
                    >
                        <SportsTennisIcon className = "text-xl" style = {{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Let's Go!
                    </button>
                </div>
                {/* MY SCHEDULED TOURNAMENTS */}
                <div className = "my-scheduled-tournaments-container h-2/3 w-full">
                    <h2 className = "text-xl font-bold mb-4"> My Scheduled Tournaments </h2>
                    <div className = "p-6 text-white rounded-[20px] shadow-lg h-5/6 overflow-auto bg-white">
                        <UserScheduledTournamentCard scheduledTournaments = {scheduledTournaments} isScheduledTournament = {true} />
                    </div>
                </div>
            </div>
            {/* COLUMN CONTAINER: LEADERBOARD, AVAILABILITY */}
            <div className = "column-container gap-2 w-[450px] p-6">
                {/* AVAILABILITY */}
                <div className = "availability-container gap-2 p-3 mb-10 w-full">
                    <div className = "availability-box border-gray-300 text-sm h-1/2 w-full min-w-72 flex flex-col p-2">
                        <p className = "text-lg font-bold"> Are you available for tournaments? </p>
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
                    <h2 className = "text-xl font-bold mb-4"> RallyRank's Leaderboard </h2>
                    <UserLeaderboardButtons
                        buttons = {["Top", otherGenderButtonLabel, "Mixed Leaderboard"]}
                        onTopClick = {handleTopClick}
                        onOtherGenderClick = {handleOtherGenderClick}
                        onMixedGenderClick = {handleMixedGenderClick}
                        activeButton = {activeButton}
                        setActiveButton = {setActiveButton}
                    />
                    <div className = "bg-white shadow-lg leaderboard-box p-8 gap-5 text-sm h-5/6 w-full min-w-72 flex flex-col overflow-auto rounded-[20px]">
                        {view === "Top" && defaultLeaderboardPlayers.length > 0 ? (
                            defaultLeaderboardPlayers.map((leaderboardPlayer, index) => (
                                <UserLeaderboardCard key = {index} leaderboardPlayer = {leaderboardPlayer} rank = {index + 1} />
                            ))
                        ) : view === otherGenderButtonLabel && otherGenderLeaderboardPlayers.length > 0 ? (
                            otherGenderLeaderboardPlayers.map((leaderboardPlayer, index) => (
                                <UserLeaderboardCard key = {index} leaderboardPlayer = {leaderboardPlayer} rank = {index + 1} />
                            ))
                        ) : view === "Mixed Gender Leaderboard" && mixedGenderLeaderboardPlayers.length > 0 ? (
                            mixedGenderLeaderboardPlayers.map((leaderboardPlayer, index) => (
                                <UserLeaderboardCard key = {index} leaderboardPlayer = {leaderboardPlayer} rank = {index + 1} />
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