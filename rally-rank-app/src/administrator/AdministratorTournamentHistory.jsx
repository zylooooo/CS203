// Config imports
import { API_URL } from '../../config';

import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Component: Tournament Card (for AdministratorTournamentHistory)
const Tournaments = ({ tournaments, setIsTransitioning }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });
        return `${day} ${month} ${year}`;
    }

    // const navigate = useNavigate();
    // const location = useLocation();
    // useEffect(() => {
    //   localStorage.setItem('lastUrl', location.pathname);
    // }, [location]);

    const handleTournamentCardClick = (tournamentName) => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/administrator-past-tournament-details", { state: { tournamentName: tournamentName } });
        }, 200);
    }

    return (
        <div className = "flex flex-col gap-5 w-full">
            {tournaments.map((tournament, index) => (
                <div key = {index} className = "flex border rounded-xl p-4 card-background shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick = {() => handleTournamentCardClick(tournament.tournamentName)}
                >

                    <div className = "flex-1 pr-4">
                        <h3 className = "text-xl font-bold mb-2"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-2 justify-between">
                            <p> Organiser: {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-2"> Date: {formatDate(tournament.startDate)} to {formatDate(tournament.endDate)}</p>
                        <p className = "mb-2"> Elo Rating Criteria: {tournament.minElo} to {tournament.maxElo} </p>
                        <p className = "mb-2"> Game: {tournament.category} </p>
                        <p className = "mb-2"> Gender: {tournament.gender} </p>
                        <p className = "mb-2"> Player Capacity: {tournament.playerCapacity} </p>
                        <p><strong>
                            ( {tournament.playerCapacity - tournament.playersPool.length > 0
                            ? tournament.playerCapacity - tournament.playersPool.length === 1
                                ? "1 slot left"
                                :`${tournament.playerCapacity - tournament.playersPool.length} slots left`
                            : "Full"} )
                        </strong></p>
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

                    </div>

                </div>
            ))}
        </div>
    );
};

// Component: Tournaments Buttons (for AdministratorTournamentHistory)
const TournamentsButtons = ({ buttons, onAllClick, onMyClick }) => {

    const [activeButton, setActiveButton] = useState(0); // 'All Past Tournaments' Button will be the first active button

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
              className = {`btn transition-colors duration-300 font-semibold ${
                activeButton === index
                ? "active-button underline text-primary-color-green"             // Active State
                : "text-gray-700 hover:text-primary-color-light-green"               // Inactive State
            }`}
              onClick={() => handleButtonClick(index)}
            >
              { buttonLabel }
            </button>
        ))}
        </div>
    );
}

function AdministratorTournamentHistory() {


    const [isTransitioning, setIsTransitioning] = useState(false);

    const [tournaments, setTournaments] = useState([]);

    const [allPastTournaments, setAllPastTournaments] = useState([]);

    const [myPastTournaments, setMyPastTournaments] = useState([]);

    const handleAllClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(allPastTournaments);
        }, 300);
        setIsTransitioning(false);
    }

    const handleMyClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(myPastTournaments);
        }, 300);
        setIsTransitioning(false);
    }

    // API Call: Retrieve all completed tournaments
    async function getAllPastTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/all-history`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            setAllPastTournaments(response.data);
            setTournaments(response.data); 

        } catch (error) {
            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert(error.response.data.error);
            console.error('Error fetching available tournaments:', error.response.data.error);
            setAllPastTournaments([]);
            setTournaments([]); 
        }
    }

    // API Call: Retrieve all tournaments completed tournaments created by Admin
    async function getMyPastTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/my-history`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            setMyPastTournaments(response.data);

        } catch (error) {
            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert(error.response.data.error);
            console.error('Error fetching available tournaments:', error.response.data.error);
            setMyPastTournaments([]); 
            setTournaments([]); 
        }
    }

    useEffect(() => {
        getAllPastTournaments();
        getMyPastTournaments();
    }, []);


    //---------------------------- SEARCH BAR FUNCTIONS ----------------------------------
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTournaments = tournaments.filter(
        (tournament) =>
            tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //------------------------------------------------------------------------------------


    return (
        <div className = {`tournaments-page flex w-full p-9 gap-2 justify-evenly transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <div className = "row-container flex flex-col w-5/6 p-14 gap-8">

                {/* LABELS */}
                <TournamentsButtons buttons = {["All Past Tournaments", "My Past Tournaments"]} onAllClick = { handleAllClick } onMyClick = { handleMyClick } />

                <div className="flex flex-col gap-5">

                    {/* SEARCH BAR */}
                    <input
                        type = "text"
                        placeholder = "Search by Tournament Name or Admin Name"
                        value = { searchTerm }
                        onChange = { (e) => setSearchTerm(e.target.value) }
                        className = "p-2 border rounded-lg w-full card-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* TOURNAMENT LISTS */}
                    {tournaments.length > 0 ? (
                        <Tournaments tournaments = {filteredTournaments} setIsTransitioning = {setIsTransitioning}/>
                    ) : (
                        <p> No tournaments found.</p>
                    )}

                </div>

            </div>
        </div>
    );

}

export default AdministratorTournamentHistory;

