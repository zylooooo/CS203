import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect} from "react";

// Component: Tournament Buttons - "Available Tournaments", "My Scheduled Tournaments"
const TournamentButtons = ({ buttons, onAvailableTournamentsClick, onMyScheduledTournamentsClick }) => {
    const [activeButton, setActiveButton] = useState(0);

    const handleTournamentButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onAvailableTournamentsClick();
        } else {
            onMyScheduledTournamentsClick();
        }
    };

    return (
        <div className = "tournament-buttons flex gap-5">
            {buttons.map((tournamentButtonLabel, index) => (
                <button
                    key = {index}
                    className = {`btn transition-colors duration-300 ${activeButton === index ? 'active-button underline' : 'text-gray-700 hover:text-blue-500 hover:text-red-500'}`}
                    onClick = {() => handleTournamentButtonClick(index)}
                >
                    {tournamentButtonLabel}
                </button>
            ))}
        </div>
    );
}

// Component: Tournament Card (for UserTournaments)
const TournamentCard = ({ tournamentType }) => {
    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        navigate("/tournament-details", {state: tournament});
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
    
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    };

    return (
        <div className = "flex flex-col gap-5 w-full">
            {tournamentType.map((tournament, index) => (
                <div
                    key = {index}
                    className = "flex border rounded-xl p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick = {() => handleTournamentCardClick(tournament)}
                >
                    <div className = "flex-1 pr-4">
                        <h3 className = "text-xl font-bold mb-2"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-2">
                            <p> Organiser: {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-2"> Date: {formatDate(tournament.startDate)} </p>
                        <p> Elo Rating Criteria: {tournament.minElo} to {tournament.maxElo} </p>
                        <p> Game: {tournament.category} </p>
                        <p> Gender: {tournament.gender} </p>
                        <p> Player Capacity: {tournament.playerCapacity} </p>
                        <p>
                            {tournament.playerCapacity - tournament.playersPool.length > 0
                            ? `${tournament.playerCapacity - tournament.playersPool.length} slots left!`
                            : "Slots are full!"}
                        </p>
                    </div>

                    <div className = "card-section-two border-l pl-4 flex-none w-1/3">
                        <p className = "font-semibold"> Venue: </p>
                        <p> {tournament.location} </p>
                        {tournament.remarks && (
                            <>
                                <p className = "font-semibold mt-2"> Remarks: </p>
                                <p> {tournament.remarks} </p>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

function UserTournaments() {

    // ------------------------------------- Tournament Functions -------------------------------------
    const [displayTournamentType, setDisplayTournamentType] = useState([]);

    const [availableTournaments, setAvailableTournaments] = useState([]);

    const [myScheduledTournaments, setMyScheduledTournaments] = useState([]);

    const [loading, setLoading] = useState(true);

    const handleAvailableTournamentClick = () => {
        getAvailableTournaments();
    }

    const handleMyScheduledTournamentsClick = () => {
        getMyScheduledTournaments();
        setDisplayTournamentType(myScheduledTournaments)
    }

    // API Call: Retrieiving available tournaments
    async function getAvailableTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
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

            setAvailableTournaments(response.data);
            setDisplayTournamentType(response.data);
        } catch (error) {
            console.error("Error fetching available tournaments: ", error);
            setAvailableTournaments([]);
        } finally {
            setLoading(false);
        }
    }

    // API Call: Retrieiving user's scheduled tournaments (ongoing and upcoming)
    async function getMyScheduledTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
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
            setMyScheduledTournaments(response.data);
            setDisplayTournamentType(response.data);
        } catch (error) {
            console.error("Error fetching user's scheduled tournaments: ", error);
            setMyScheduledTournaments([]);
            setDisplayTournamentType([]);
        } finally {
            setLoading(false);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getAvailableTournaments();
    }, []);

    return (
        <div className = "flex flex-col p-10 items-center justify-center w-4/5">
            <div className = "flex flex-col w-4/5 gap-8">
                <TournamentButtons
                    buttons = {["Available Tournaments", "My Scheduled Tournaments"]}
                    onAvailableTournamentsClick = {handleAvailableTournamentClick}
                    onMyScheduledTournamentsClick = {handleMyScheduledTournamentsClick}
                />
                <div className = "flex gap-3">
                    <input
                        className = "border rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type = "text"
                        placeholder = "Search for tournaments..."
                    />
                    <button className = "border border-value-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white-transition">
                        Search
                    </button>
                </div>
                {loading ? (
                    <p> Loading tournaments... </p>
                    ) : displayTournamentType.length > 0 ? (
                    <TournamentCard tournamentType = {displayTournamentType} />
                    ) : (
                    <p> No tournaments found. </p>
                )}
            </div>
        </div>
    );
}

export default UserTournaments;