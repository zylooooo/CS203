import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


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
        <div className="flex flex-col gap-5 w-full">
            {tournamentType.map((tournament, index) => (
                <div
                    key={index}
                    className="flex border rounded-xl p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick={() => handleTournamentCardClick(tournament)}
                >
                    <div className="flex-1 pr-4">
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
    const [displayTournamentType, setdisplayTournamentType] = useState([]);
    const [scheduledTournaments, setScheduledTournaments] = useState([]);
    const [pastTournaments, setPastTournaments] = useState([]);
    const [myTournaments, setMyTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getScheduledTournaments();
    }, []);

    const handleScheduledTournamentsClick = () => {
        getScheduledTournaments();
    };
    
    const handlePastTournamentsClick = () => {
        getPastTournaments();
    };
    
    const handleMyTournamentsClick = () => {
        getMyTournaments();
    };

    async function getScheduledTournaments() {
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
            
            setScheduledTournaments(response.data);

            // Set the initial view to available tournaments
            setdisplayTournamentType(response.data); 
        } catch (error) {
            console.error('Error fetching available tournaments:', error);

            // Set to empty array if API call fails
            setScheduledTournaments([]); 
            setdisplayTournamentType([]); 
        } finally {
            setLoading(false);
        }
    }
    
    async function getPastTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/tournaments/history",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            
            setPastTournaments(response.data);
            setdisplayTournamentType(response.data);  // Add this line
        } catch (error) {
            console.error('Error fetching past tournaments:', error);
            setPastTournaments([]);
            setdisplayTournamentType([]);  // Add this line
        } finally {
            setLoading(false);
        }
    }

    async function getMyTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.jwtToken) {
                console.error('No JWT token found');
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
            
            setMyTournaments(response.data);
            setdisplayTournamentType(response.data);  // Add this line
        } catch (error) {
            console.error('Error fetching my tournaments:', error);
            setMyTournaments([]);  // Change this line
            setdisplayTournamentType([]);  // Add this line
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col p-10 items-center justify-center w-4/5">
            <div className="flex flex-col w-4/5 gap-8">
                <TournamentButtons
                    buttons={["Available Tournaments", "My Tournaments"]}
                    onScheduledTournamentsClick={handleScheduledTournamentsClick}
                    onPastTournamentsClick={handlePastTournamentsClick}
                    onMyTournamentsClick={handleMyTournamentsClick}
                />

                <div className="flex gap-3">
                    <input
                        className="border rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        placeholder="Search for tournaments..."
                    />
                    <button className="border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
                        Search
                    </button>
                </div>

                {loading ? (
                    <p>Loading tournaments...</p>
                ) : displayTournamentType.length > 0 ? (
                    <TournamentCard tournamentType={displayTournamentType} />
                ) : (
                    <p>No tournaments found.</p>
                )}
            </div>
        </div>
    );
}

export default UserTournaments;
