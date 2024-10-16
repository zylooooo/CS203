import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

 // Define LeaderboardButtons component ("Top" and "You")
 const LeaderboardButtons = ({ buttons, onTopClick, onYouClick, activeButton, setActiveButton }) => {
    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onTopClick();
        } else {
            onYouClick();
        }
    };

    return (
        <div className = "leaderboard-buttons flex gap-5 mb-4">
            {buttons.map((buttonLabel, index) => (
                <button
                    key = { index }
                    className = {`btn transition-colors duration-300 ${
                        activeButton === index
                        ? "active-button underline text-blue-600"   // active state
                        : "text-gray-700 hover:text-blue-500"        // inactive state
                    }`}
                    onClick = {() => handleButtonClick(index)}
                >
                    { buttonLabel }
                </button>
            ))}
        </div>
    );
};



function UserHome() {
    const navigate = useNavigate();

    // AVAILABILITY FUNCTIONS
    const [isAvailable, setIsAvailable] = useState(false);
    const handleAvailabilityToggle = () => { setIsAvailable(!isAvailable); };
    async function updateAvailability() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.jwtToken) {
                console.error('No JWT token found');
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

            console.log("availability updated (?) :" + response.data);
            handleAvailabilityToggle();
            
        } catch (error) {
            console.error('Error updating availability:', error);
        }
    }


    // TOURNAMENT FUNCTIONS
    const [tournaments, setTournaments] = useState(false);
    async function getScheduledTournaments() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/tournaments/scheduled",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );

            console.log("scheduled tournaments data received:" + response.data);
            setTournaments(response.data);
            
        } catch (error) {
            console.error('Error fetching scheduled tournaments:', error);
        }
    }


    // LEADERBOARD FUNCTIONS
    const [players, setPlayers] = useState([]);
    const [view, setView] = useState("Top");
    const [activeButton, setActiveButton] = useState(0);
    const handleTopClick = () => { 
        // setView("Top"); 
    };
    const handleYouClick = () => { setView("You"); };
    async function getDefaultLeaderBoard() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.jwtToken) {
                console.error('No JWT token found');
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
            
            console.log("data received:" + response.data);
            setPlayers(response.data);
            console.log(players);
            
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }

    useEffect(() => {
        // updateAvailability();
        getDefaultLeaderBoard();
        getScheduledTournaments();

    }, []);


    // JOIN TOURNAMENT FUNCTIONS
    const [isTransitioning, setIsTransitioning] = useState(false);
    const handleJoinTournament = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/users/tournaments");
        }, 300);
    }


    return (
        <div className = {`home-container main-container h-screen-minus-navbar transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100" }`}>

            {/* ROW CONTAINER: JOIN TOURNAMENTS, SCHEDULED TOURNAMENTS, NOTIFICATIONS */}
            <div className = "row-container flex flex-col w-3/5 gap-6">
                
                {/* JOIN TOURNAMENTS */}
                <div className = "join-tournaments-container bg-white p-6 gap-2 h-1/5">
                    <h2 className = "text-xl font-semibold mb-4"> Join a Tournament Today! </h2>
                    <button
                        className = "join-button bg-green-600 text-white font-bold py-3 px-6 rounded-[8px] shadow-md hover:bg-green-700 transition duration-200 w-full"
                        onClick = { handleJoinTournament }
                        style = {{ backgroundColor: '#E0E0E0' }}
                    >
                        Join!
                    </button>
                </div>

                {/* NOTIFICATIONS */}
                <div className = "notification-container h-1/3">
                    <h2 className = "text-xl font-semibold mb-2"> Your Notifications </h2>
                    <div className = "notification-box bg-gray-100 text-sm text-center w-full flex items-center justify-center rounded-[8px] h-4/6 overflow-auto" style = {{ backgroundColor: '#E0E0E0' }}>

                        {/* NOTIFICATIONS HERE */}
                        <p className = "text-sm">
                            You have no notifications.
                        </p>

                    </div>
                </div>

                {/* SCHEDULED TOURNAMENTS */}
                <div className = "scheduled-tournaments-container h-1/3">
                    <h2 className = "text-xl font-semibold mb-4">Your Scheduled Tournaments</h2>
                    <div className = "p-6 bg-blue-500 text-white rounded shadow-lg h-5/6 overflow-auto">

                        {/* UPCOMING TOURNAMENTS LIST */}
                        <div className = "space-y-4" >
                            {tournaments.length > 0 ? (
                                // TEMPLATE: TOURNAMENTS IN SCHEDULED TOURNAMENTS
                                tournaments.map((tournament) => (
                                    <div
                                        key = {tournament.id}
                                        className = "tournament-item bg-blue-700 p-4 rounded-md shadow-md"
                                        style = {{ backgroundColor: '#E0E0E0' }}
                                    >
                                        <h3 className = "text-lg font-semibold"> {tournament.name} </h3>
                                        <p className = "text-sm mt-2">
                                            <span className = "font-semibold"> Date: </span>
                                            {tournament.date}
                                        </p>
                                        <p className = "text-sm">
                                            <span className = "font-semibold"> Time: </span>
                                            {tournament.time}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                // MESSAGE: NO UPCOMING TOURNAMENTS
                                <p> You have no upcoming tournaments. Join one today! </p>
                            )}

                        </div>
                    </div>
                </div>
            </div>

        {/* COLUMN CONTAINER: LEADERBOARD, AVAILABILITY */}
        <div className = "col-container gap-20">

            {/* LEADERBOARD */}
            <div className = "leaderboard-container h-1/2 gap-8 p-3">
                <h2 className = "text-xl font-semibold"> Tournament Leaderboard </h2>
                <LeaderboardButtons
                    buttons = {["Top", "You"]}
                    onTopClick = { handleTopClick }
                    // onYouClick = { handleYouClick }
                    activeButton = { activeButton }
                    setActiveButton = { setActiveButton }
                />
                <div className = "leaderboard-box p-5 gap-3 bg-gray-100 border border-gray-300 text-sm h-5/6 w-full min-w-72 flex flex-col overflow-auto">
                    {view === "Top" ? (
                        players.length > 0 ? (
                            players.map((player) => (
                                // TEMPLATE: PLAYER IN LEADERBOARD
                                <div className = "flex justify-between gap-2">
                                    <p> Username: {player.username} </p>
                                    <p> Elo Rating: {player.elo} </p>
                                </div>
                            ))
                        ) : (
                            <p className = "p-2"> No players available. </p>
                        )
                    ) : (
                        <div className = "p-2 bg-yellow-200">
                            {/* <h3 className = "font-semibold"> {player.name} </h3> */}
                            <p> Username: {player.username} </p>
                            <p> Elo Rating: {player.eloRating} </p>
                        </div>
                    )}

                </div>
            </div>

            {/* AVAILABILITY */}
            <div className = "availability-container h-1/2 gap-8 p-3">
                <h2 className = "text-xl font-semibold"> Availability </h2>
                <div className = "availability-box bg-gray-100 border-gray-300 text-sm h-1/2 w-full min-w-72 flex flex-col p-2">
                    <p> Are you available for tournaments? </p>
                    <div className = "mt-2 flex items-center">
                        <label className = "relative inline-flex items-center cursor-pointer">
                            <input
                            type = "checkbox"
                            checked = { isAvailable }
                            onChange = { updateAvailability }
                            className = "sr-only peer"
                            />
                            <div className = "w-11 h-6 bg-secondary-color-light-gray rounded-full peer peer-checked:bg-primary-color-green peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-color-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-primary-color-white"></div>
                        </label>
                        <span className = "ml-3 text-sm text-gray-900">
                            {isAvailable ? 'Yes, I am available' : 'No, I am not available'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default UserHome;