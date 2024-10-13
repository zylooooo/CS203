import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserHome() {
    const navigate = useNavigate();

    const [isTransitioning, setIsTransitioning] = useState(false);

    const [isAvailable, setIsAvailable] = useState(false);

    const handleToggle = () => {
        setIsAvailable(!isAvailable);
    };

    useEffect(() => {
        // Function to call the backend
        const updateAvailability = async () => {
            try {
                console.log('Availability updated:'); 
                // const response = await fetch('/api/update-availability', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({ isAvailable }),
                // });

                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }

                // const data = await response.json();
                // console.log('Availability updated:', data);
            } catch (error) {
                console.error('Error updating availability:', error);
            }
        };

        // Call the function to update availability
        updateAvailability();
    }, [isAvailable]); // Dependency array to track changes to isAvailable

    const [view, setView] = useState("Top");

    const [activeButton, setActiveButton] = useState(0);

    // Define navigation for users to the tournaments page when they click on the 'Join Tournament' button
    const handleJoinTournament = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/user-tournaments");
        }, 300);
    }

    // ------------------------------------- API CALLS - MOCK PLAYER DATA ------------------------------------------------
    // API calls - Mock player data
    const players = [
        { id: 1, name: "Alice", rank: 1, rating: 1500 },
        { id: 2, name: "Bob", rank: 2, rating: 1400 },
        { id: 3, name: "Charlie", rank: 3, rating: 1300 },
        { id: 4, name: "David", rank: 4, rating: 1200 },
        { id: 5, name: "Eve", rank: 5, rating: 1100 },
        { id: 6, name: "Augustus Gloop", rank: 6, rating: 1000 },
        { id: 7, name: "Grace", rank: 7, rating: 950 },
        { id: 8, name: "Hank", rank: 8, rating: 900 },
        { id: 9, name: "Ivy", rank: 9, rating: 850 },
        { id: 10, name: "Jack", rank: 10, rating: 800 },
    ];

    const currentUser = { id: 7, name: "Augustus Gloop", rank: 6, rating: 1000 };

    const tournaments = [
        { id: 1, name: "Tournament 1", date: "2024-10-12", time: "10:00 AM" },
        { id: 2, name: "Tournament 2", date: "2024-10-18", time: "2:00 PM" },
        { id: 3, name: "Tournament 3", date: "2024-10-22", time: "1:00 PM" },
    ];
    // -------------------------------------------------------------------------------------------------------------------

    // Define LeaderboardButtons component
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
                            : "text-gray-700 hover: text-blue-500"      // inactive state
                        }`}
                        onClick = {() => handleButtonClick(index)}
                    >
                        { buttonLabel }
                    </button>
                ))}
            </div>
        );
    };

    // Handle button click -> "Top" button
    const handleTopClick = () => {
        setView("Top");
    };

    // Handle button click -> "You" button
    const handleYouClick = () => {
        setView("You");
    };

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
                    onYouClick = { handleYouClick }
                    activeButton = { activeButton }
                    setActiveButton = { setActiveButton }
                />
                <div className = "leaderboard-box bg-gray-100 border border-gray-300 text-sm h-5/6 w-full min-w-72 flex flex-col overflow-auto">
                    {view === "Top" ? (
                        players.map((player) => (
                            // TEMPLATE: PLAYER IN LEADERBOARD
                            <div
                                key = { player.id }
                                className = {`p-2 ${player.id === currentUser.id ? "bg-yellow-200" : "" }`}
                            >
                                <h3 className = "font-semibold"> {player.rank} {player.name} </h3>
                                <p> Rating: {player.rating} </p>
                            </div>
                        ))
                    ) : (
                        <div className = "p-2 bg-ywllow-200">
                            <h3 className = "font-semibold"> {currentUser.name} </h3>
                            <p> Rank: {currentUser.rank} </p>
                            <p> Ranking: {currentUser.rating} </p>
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
                            onChange = { handleToggle }
                            className = "sr-only peer"
                            />
                            <div className="w-11 h-6 bg-secondary-color-light-gray rounded-full peer 
                            peer-checked:bg-primary-color-green
                            peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-color-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                            peer-checked:after:bg-primary-color-white"></div>
                        </label>
                        <span className="ml-3 text-sm text-gray-900">
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