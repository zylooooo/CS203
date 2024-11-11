// Package Imports
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { API_URL } from '../../config';

// Component: Tournament Buttons
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
                    className = {`btn transition-colors duration-300 font-semibold ${
                        activeButton === index
                        ? "active-button underline text-primary-color-green"             // Active State
                        : "text-gray-700 hover:text-primary-color-light-green"               // Inactive State
                    }`}
                    onClick = {() => handleTournamentButtonClick(index)}
                >
                    {tournamentButtonLabel}
                </button>
            ))}
        </div>
    );
}

// Component: Tournament Card (for UserTournaments)
const TournamentCard = ({ tournamentType, isAvailableTournament, isScheduledTournament }) => {
    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        navigate(`/tournament-details/${tournament.tournamentName}`, {
            state: {
                tournamentName: tournament.tournamentName,
                isAvailableTournament,
                isScheduledTournament,
            }
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
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
                    className = "flex p-5 card-background border shadow-md cursor-pointer hover:shadow-xl transition-all w-full rounded-[12px]"
                    onClick = {() => handleTournamentCardClick(tournament)}
                >
                    <div className = "flex-1 pr-4 py-1">
                        <h3 className = "text-xl font-bold mb-2"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-2">
                            <p> Organiser: {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-2"> Date: {formatDate(tournament.startDate)} </p>
                        <p className = "mb-2"> Elo Rating Criteria: {tournament.minElo} to {tournament.maxElo} </p>
                        <p className = "mb-2"> Gender: {tournament.gender} </p>
                    </div>
                    <div className = "card-section-two border-l pl-4 flex-none w-1/3 relative">
                        <p className = "font-semibold mb-2"> Venue: {tournament.location} </p>
                        <p className = "mb-2"> Game: {tournament.category} </p>
                        
                        {tournament.remarks && (
                            <>
                                <p className = "font-semibold mt-2"> Remarks: </p>
                                <p className = "mb-2"> {tournament.remarks} </p>
                            </>
                        )}
                        <div className = "absolute bottom-0 right-2 text-right">
                            <p
                                style = {{
                                    color: tournament.playerCapacity - tournament.playersPool.length <= 10
                                    ? "red"
                                    : "text-grey",
                                    fontWeight: tournament.playerCapacity - tournament.playersPool.length <= 10
                                    ? 700
                                    : "normal"
                                }}
                                className = "font-semibold mb-2"
                            >
                                {tournament.playerCapacity - tournament.playersPool.length > 0
                                ? `Slots left: ${tournament.playerCapacity - tournament.playersPool.length}`
                                : "Slots are full!"}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

function UserTournaments() {
    // ------------------------------------- Tournament Functions -------------------------------------
    const [loading, setLoading] = useState(true);
    const [activeButton, setActiveButton] = useState(0);
    const [availableTournaments, setAvailableTournaments] = useState([]);
    const [displayTournamentType, setDisplayTournamentType] = useState([]);
    const [myScheduledTournaments, setMyScheduledTournaments] = useState([]);

    const handleAvailableTournamentClick = () => {
        setActiveButton(0);
        getAvailableTournaments();
    }

    const handleMyScheduledTournamentsClick = () => {
        setActiveButton(1);
        getMyScheduledTournaments();
        setDisplayTournamentType(myScheduledTournaments)
    }

    // ------------------------------------- API Call: Retrieiving available tournaments -------------------------------------
    async function getAvailableTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
                `${API_URL}/users/tournaments/available`,
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
    };

    // ------------------------------------- API Call: Retrieiving user's scheduled tournaments (ongoing and upcoming) -------------------------------------
    async function getMyScheduledTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
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
            setMyScheduledTournaments(response.data);
            setDisplayTournamentType(response.data);
        } catch (error) {
            console.error("Error fetching user's scheduled tournaments: ", error);
            setMyScheduledTournaments([]);
            setDisplayTournamentType([]);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getAvailableTournaments();
    }, []);

    //---------------------------- SEARCH BAR FUNCTIONS ----------------------------------
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTournaments = displayTournamentType.filter(
        (tournament) =>
            tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //------------------------------------------------------------------------------------

    return (
        <div className = "flex flex-col p-10 items-center justify-center w-4/5">
            <div className = "flex flex-col w-4/5 gap-8 mt-5">
                <TournamentButtons
                    buttons = {["Available Tournaments", "My Scheduled Tournaments"]}
                    onAvailableTournamentsClick = {handleAvailableTournamentClick}
                    onMyScheduledTournamentsClick = {handleMyScheduledTournamentsClick}
                />
                {/* SEARCH BAR */}
                <input
                    type = "text"
                    placeholder = "Search for tournaments..."
                    value = { searchTerm }
                    onChange = { (e) => setSearchTerm(e.target.value) }
                    className = "border rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {loading ? (
                    <p> Loading tournaments... </p>
                ) : displayTournamentType.length > 0 ? (
                    <TournamentCard
                        tournamentType = {filteredTournaments}
                        isAvailableTournament = {activeButton === 0}
                        isScheduledTournament = {activeButton === 1}
                    />
                ) : (
                    <p> No tournaments found. </p>
                )}
            </div>
        </div>
    );
};

export default UserTournaments;