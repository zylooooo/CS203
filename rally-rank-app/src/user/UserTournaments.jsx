import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// API Calls - Mock tournament data (Past)
const pastTournaments = [
    {
        tournamentName: "[Sample PastTournament] Rookie Rumble",
        createdBy: "Puff Daddy",
        startDate: "2024-04-03",
        endDate: "2024-04-17",
        minElo: 400,
        maxElo: 500,
        location: "SMU Tennis Court, Singapore 938923",
        remarks: "",
        category: "Beginner",
        gender: "Mixed",
        playerCapacity: 16,
        playersPool: ["player1", "player2", "player3"],
        ongoing: false
    },
    {
        tournamentName: "[Sample PastTournament] Taqwa",
        createdBy: "Justin Bieber",
        startDate: "2024-02-07",
        endDate: "2024-02-21",
        minElo: 1000,
        maxElo: 1500,
        location: "Choa Chu Kang Stadium, Singapore 238232",
        remarks: "",
        category: "Intermediate",
        gender: "Male",
        playerCapacity: 32,
        playersPool: ["player4", "player5", "player6", "player7"],
        ongoing: false
    },
];

// API Calls - Mock tournament data (My)
const myTournaments = [
    {
        tournamentName: "[Sample MyTournament] Wonder Games",
        createdBy: "Puff Daddy",
        startDate: "2024-04-03",
        endDate: "2024-04-17",
        minElo: 400,
        maxElo: 500,
        location: "SMU Tennis Court, Singapore 938923",
        remarks: "",
        category: "Open",
        gender: "Mixed",
        playerCapacity: 64,
        playersPool: ["currentUser", "player8", "player9"],
        ongoing: true
    },
    {
        tournamentName: "[Sample MyTournament] Orion Star",
        createdBy: "Justin Bieber",
        startDate: "2024-05-07",
        endDate: "2024-05-21",
        minElo: 1000,
        maxElo: 1500,
        location: "Choa Chu Kang Stadium, Singapore 238232",
        remarks: "",
        category: "Advanced",
        gender: "Female",
        playerCapacity: 16,
        playersPool: ["currentUser", "player10", "player11", "player12"],
        ongoing: true
    },
];

// Define the TournamentButtons component
const TournamentButtons = ({ buttons, onScheduledTournamentsClick, onPastTournamentsClick, onMyTournamentsClick}) => {
    const [activeButton, setActiveButton] = useState(0)

    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onScheduledTournamentsClick();
        } else if (index === 1) {
            onPastTournamentsClick();
        } else {
            onMyTournamentsClick();
        }
    };

    return (
        <div className="tournament-buttons flex gap-5">
            {buttons.map((buttonLabel, index) => (
                <button
                    key={index}
                    className={`btn transition-colors duration-300 ${activeButton === index ? 'active-button underline' : 'text-gray-700 hover:text-blue-500 hover:text-red-500'}`}
                    onClick={() => handleButtonClick(index)}>
                        {buttonLabel}
                </button>
            ))}
        </div>
    );
}

// Define the TournamentCard component
const TournamentCard = ({ tournamentType }) => {
    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        navigate("/tournament-details", {state: tournament});
    };

    return (
        <div className="tournaments-cards-list flex flex-col space-y-8">
            {tournamentType.map((tournament, index) => (
                <div
                    key={index}
                    className="tournament-card border rounded-lg p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition flex w-4/5"
                    onClick={() => handleTournamentCardClick(tournament)}
                >
                    <div className="card-section-one flex-1 pr-4">
                        <h3 className="text-xl font-bold mb-2">{tournament.tournamentName}</h3>
                        <div className="flex items-center mb-2">
                            <p>Organiser: {tournament.createdBy}</p>
                        </div>
                        <p className="mb-2">Date: {tournament.startDate} to {tournament.endDate}</p>
                        <p>Elo Rating: {tournament.minElo} to {tournament.maxElo}</p>
                        <p>Category: {tournament.category}</p>
                        <p>Gender: {tournament.gender}</p>
                        <p>Player Capacity: {tournament.playerCapacity}</p>
                        <p>Players Registered: {tournament.playersPool.length}</p>
                    </div>
                    <div className="card-section-two border-l pl-4 flex-none w-1/3">
                        <p className="font-semibold">Venue:</p>
                        <p>{tournament.location}</p>
                        {tournament.remarks && (
                            <>
                                <p className="font-semibold mt-2">Remarks:</p>
                                <p>{tournament.remarks}</p>
                            </>
                        )}
                        <p className="mt-2">Status: {tournament.ongoing ? "Ongoing" : "Not Started"}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

function UserTournaments() {
    const [tournamentType, setTournamentType] = useState([]);
    const [scheduledTournaments, setScheduledTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUsersTournamentScheduled();
    }, []);

    const handleScheduledTournamentsClick = () => {
        setTournamentType(scheduledTournaments);
    };

    const handlePastTournamentsClick = () => {
        setTournamentType(pastTournaments);
    };

    const handleMyTournamentsClick = () => {
        setTournamentType(myTournaments);
    };

    async function getUsersTournamentScheduled() {
        setLoading(true);
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
            
            console.log(response.data);
            setScheduledTournaments(response.data);
            setTournamentType(response.data); // Set the initial view to scheduled tournaments
        } catch (error) {
            console.error('Error fetching scheduled tournaments:', error);
            setScheduledTournaments([]); // Set to empty array if API call fails
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="user-tournaments-page main-container">
            <div className="row-container flex flex-col w-3/5 gap-8">
                <TournamentButtons
                    buttons={["Scheduled Tournaments", "Past Tournaments", "My Tournaments"]}
                    onScheduledTournamentsClick={handleScheduledTournamentsClick}
                    onPastTournamentsClick={handlePastTournamentsClick}
                    onMyTournamentsClick={handleMyTournamentsClick}
                />

                <div className="tournament-search-bar flex gap-3">
                    <input
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        placeholder="Search for tournaments..."
                    />
                    <button className="border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
                        Search
                    </button>
                </div>

                {loading ? (
                    <p>Loading tournaments...</p>
                ) : tournamentType.length > 0 ? (
                    <TournamentCard tournamentType={tournamentType} />
                ) : (
                    <p>No tournaments found.</p>
                )}
            </div>
        </div>
    );
}

export default UserTournaments;