import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Component: Tournament Card (for AdministratorTournamentHistory)
const Tournaments = ({ tournaments, isMyPastTournaments, setIsTransitioning }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    }

    const navigate = useNavigate();

    const handleTournamentCardClick = (tournamentName) => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/administrator-past-tournament-details", { state: { tournamentName: tournamentName, isMyPastTournaments:  isMyPastTournaments } });
        }, 200);
    }

    return (
        <div className = "flex flex-col gap-5 w-full">
            {tournaments.map((tournament, index) => (
                <div key = {index} className = "flex border rounded-xl p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick = {() => handleTournamentCardClick(tournament.tournamentName)}
                >

                    <div className = "flex-1 pr-4">
                        <h3 className = "text-xl font-bold mb-2"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-2 justify-between">
                            <p> Organiser: {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-2"> Date: {formatDate(tournament.startDate)} </p>
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

function AdministratorTournamentHistory() {

    const [isTransitioning, setIsTransitioning] = useState(false);

    const [tournaments, setTournaments] = useState([]);

    const [allPastTournaments, setAllPastTournaments] = useState([]);

    const [myPastTournaments, setMyPastTournaments] = useState([]);

    const [isMyPastTournaments, setIsMyPastTournaments] = useState(false);

    const handleAllClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(allPastTournaments);
            setIsMyPastTournaments(false);
        }, 300);
        setIsTransitioning(false);
    }

    const handleMyClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(myPastTournaments);
            setIsMyPastTournaments(true);
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

                // EDIT ROUTER
                "http://localhost:8080/admins/tournaments",
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
            console.error('Error fetching available tournaments:', error);
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

              // EDIT ROUTER 
                "http://localhost:8080/admins/tournaments",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            setMyPastTournaments(response.data);
            setTournaments(response.data); 

        } catch (error) {

            console.error('Error fetching available tournaments:', error);
            setMyPastTournaments([]); 
            setTournaments([]); 
        }
    }

    useEffect(() => {
        getAllPastTournaments();
        getMyPastTournaments();
    }, []);


    return (
        <div className = {`tournaments-page flex w-full p-9 gap-2 justify-evenly transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <div className = "row-container flex flex-col w-full p-14 gap-8">

                {/* LABELS */}
                <TournamentsButtons buttons = {["All Past Tournaments", "My Past Tournaments"]} onAllClick = { handleAllClick } onMyClick = { handleMyClick } />

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
                <Tournaments tournaments = { tournaments } isMyPastTournaments = { isMyPastTournaments } setIsTransitioning = { setIsTransitioning } />

            </div>
        </div>
    );

}

export default AdministratorTournamentHistory;

