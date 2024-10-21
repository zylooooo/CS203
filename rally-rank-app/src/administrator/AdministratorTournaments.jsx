import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Component: Tournament Card (for AdministratorTournaments)
const Tournaments = ({ tournaments, onEditClick, isMyTournaments}) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };

        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    }

    const navigate = useNavigate();

    const handleTournamentCardClick = (tournamentName) => {
        navigate("/administrator-tournament-details", {state: tournamentName});
    }

    return (
        <div className = "flex flex-col gap-5 w-full">
            {tournaments.map((tournament, index) => (
                <div key = {index} className = "flex border rounded-xl p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick = {() => handleTournamentCardClick(tournament.tournamentName)}
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

                    <div className = "card-section-two border-l pl-4 flex-none w-1/3 flex flex-col">
                        <div>
                        <p className = "font-semibold"> Venue: </p>
                        <p> {tournament.location} </p>
                        {tournament.remarks && (
                            <>
                                <p className = "font-semibold mt-2"> Remarks: </p>
                                <p> {tournament.remarks} </p>
                            </>
                        )}
                        </div>

                        {/* EDIT TOURNAMENT BUTTON */}
                        <div className = "edit-tournament-button mt-auto ml-auto">
                        {isMyTournaments && onEditClick && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(tournament.tournamentName);
                            }}
                            className="font-semibold p-2 rounded-lg shadow-md hover:shadow-md transition duration-300 ease-in-out ml-4"
                        >
                            Edit Tournament
                        </button>
                        )}
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
};

// Component: Tournaments Buttons (for AdministratorTournaments)
const TournamentsButtons = ({ buttons, onAllClick, onMyClick }) => {

    const [activeButton, setActiveButton] = useState(0); // 'All Tournaments' Button will be the first active button

    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onAllClick();
        } else if (index === 1) {
            onMyClick();
        }
    };

    return (
        <div className="tournaments-buttons flex gap-5">
        {buttons.map((buttonLabel, index) => (
            <button
              key = {index}
              className={`btn transition-colors duration-300 ${
                activeButton === index
                  ? "active-button underline"
                  : "text-gray-700 hover:text-blue-500 hover:text-red-500"
              }`}
              onClick={() => handleButtonClick(index)}
            >
              { buttonLabel }
            </button>
        ))}
        </div>
    );
}

function AdministratorTournaments() {

    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState([]);

    const [allTournaments, setAllTournaments] = useState([]);

    const [myTournaments, setMyTournaments] = useState([]);

    const [isMyTournaments, setIsMyTournaments] = useState(false);

    const handleAllClick = () => {
        setTournaments(allTournaments);
        setIsMyTournaments(false);
    }

    const handleMyClick = () => {
        setTournaments(myTournaments);
        setIsMyTournaments(true);
    }

    const handleCreateClick = () => {
        navigate("/administrator-create-tournaments");
    }

    const handleEditClick = (tournamentName) => {
        navigate("/administrator-edit-tournaments", { state: { tournamentName: tournamentName } }); // Replace with tournamentName
    }

    // API Call: Retrieve all ongoing and future tournaments
    async function getAllTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/admins/tournaments",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            setAllTournaments(response.data);
            setTournaments(response.data); 

        } catch (error) {
            console.error('Error fetching available tournaments:', error);
            setAllTournaments([]); 
            setTournaments([]); 
        }
    }

    // API Call: Retrieve all tournaments created by the Admin
    async function getMyTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
              // EDIT ROUTER WHEN BACKEND LOGIC IS IMPLEMENTED
                "http://localhost:8080/admins/tournaments",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            setMyTournaments(response.data);
            setTournaments(response.data); 

        } catch (error) {

            console.error('Error fetching available tournaments:', error);
            setMyTournaments([]); 
            setTournaments([]); 
    
        }
    }

    useEffect(() => {
        getAllTournaments();
        getMyTournaments();
    }, []);


    return (
        <div className = "tournaments-page flex w-full p-9 gap-2 justify-evenly">
            <div className = "row-container flex flex-col w-full p-14 gap-8">

                {/* LABELS */}
                <TournamentsButtons buttons = {["All Tournaments", "My Tournaments"]} onAllClick = { handleAllClick } onMyClick = { handleMyClick } />

                {/* SEARCH BAR */}
                <div className = "tournaments-search-bar flex gap-3">
                <input
                className = "border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                type = "text"
                placeholder = "Search tournaments..."
                />
                <button className = "border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
                    Search
                </button>
                </div>

                {/* TOURNAMENT LISTS */}
                <Tournaments tournaments = { tournaments } onEditClick = { handleEditClick } isMyTournaments = { isMyTournaments } />

                 {/* CREATE TOURNAMENT BUTTON */}
                <div className = "tournament-actions flex fixed right-12 bottom-8 justify-end ">
                <button
                onClick = {handleCreateClick}
                className = "bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition duration-300 ease-in-out"
                >
                    Create Tournament
                </button>
                </div>

            </div>
        </div>
    );

}

export default AdministratorTournaments;

