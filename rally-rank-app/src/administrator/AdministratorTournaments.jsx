import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Component: Tournament Card (for AdministratorTournaments)
const Tournaments = ({ tournaments, setIsTransitioning, thisAdministrator }) => {

    // const location = useLocation();
    // useEffect(() => {
    //   localStorage.setItem('lastUrl', location.pathname);
    // }, [location]);

    const isBeforeStartDate = (startDate) => {
        const currentDate = new Date();
        const tournamentStartDate = new Date(startDate);
        return currentDate < tournamentStartDate;
    };

    const isBracketsGenerated = (tournamentBrackets) => {
        return tournamentBrackets != null;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    }

    const checkThisAdmin = (adminName) => {
        return adminName === thisAdministrator;
    }

    const navigate = useNavigate();

    const handleTournamentCardClick = (tournamentName) => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate(`/administrator/tournament-details/${tournamentName}`, { state: { tournamentName } });
        }, 200);
    };

    const handleEditClick = (tournamentName) => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/administrator-edit-tournaments", { state: tournamentName });
        }, 200);
    }

    return (
        <div className = "flex flex-col gap-5 w-full">

            {tournaments.map((tournament, index) => (
                <div key = {index} className = "flex card-background rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition w-full"
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

                    <div className = "card-section-two border-l pl-4 flex-none w-1/3 flex flex-col text-text-grey">
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
                            {checkThisAdmin(tournament.createdBy) && isBeforeStartDate(tournament.startDate) && !isBracketsGenerated(tournament.bracket) && (
                                <button
                                    onClick = {(e) => {
                                        e.stopPropagation();
                                        handleEditClick(tournament.tournamentName);
                                    }}
                                    className = "font-semibold p-2 rounded-lg shadow-md transition duration-300 ease-in-out ml-4 transform text-primary-color-green hover:shadow-xl hover:text-primary-color-light-green"
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

function AdministratorTournaments() {

//--------------------- ADMINISTRATOR TOURNAMENTS FUNCTIONS --------------------------
    const navigate = useNavigate();

    const [thisAdministrator, setThisAdministrator] = useState(null);

    const [isTransitioning, setIsTransitioning] = useState(false);

    const [tournaments, setTournaments] = useState([]);

    const [allTournaments, setAllTournaments] = useState([]);

    const [myTournaments, setMyTournaments] = useState([]);

    const handleAllClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(allTournaments);
        }, 300);
        setIsTransitioning(false);
    }

    const handleMyClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(myTournaments);
        }, 300);
        setIsTransitioning(false);
    }

    const handleCreateClick = () => {
        navigate("/administrator-create-tournaments");
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
                "http://localhost:8080/admins/tournaments/ongoing",
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
            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert(error.response.data.error);
            console.error('Error fetching available tournaments:', error.response.data.error);
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
                "http://localhost:8080/admins/tournaments/scheduled",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            setMyTournaments(response.data);

            setThisAdministrator(adminData.adminName);

        } catch (error) {
            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert(error.response.data.error);
            console.error('Error fetching available tournaments:', error.response.data.error);
            setMyTournaments([]); 
            setTournaments([]); 
    
        }
    }

    useEffect(() => {
        getAllTournaments();
        getMyTournaments();
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
        <div className = {`tournaments-page main-container flex w-full p-9 gap-2 justify-evenly transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <div className = "row-container flex flex-col w-5/6 p-14 gap-8">

                {/* LABELS */}
                <TournamentsButtons buttons = {["All Tournaments", "My Tournaments"]} onAllClick = { handleAllClick } onMyClick = { handleMyClick } />

                <div className="flex flex-col">

                    {/* SEARCH BAR */}
                    <input
                        type = "text"
                        placeholder = "Search by Tournament Name or Admin Name"
                        value = { searchTerm }
                        onChange = { (e) => setSearchTerm(e.target.value) }
                        className = "p-2 border mb-5 rounded-lg w-full card-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* TOURNAMENT LISTS */}
                    {tournaments.length > 0 ? (
                        <Tournaments tournaments = {filteredTournaments} setIsTransitioning = {setIsTransitioning} thisAdministrator = {thisAdministrator}/>
                    ) : (
                        <p> No tournaments found. Create a new tournament today! </p>
                    )}

                </div>

                 {/* CREATE TOURNAMENT BUTTON */}
                <div className = "tournament-actions flex fixed right-14 bottom-16 justify-end cursor-zoom-in ">
                    <button
                    onClick = { handleCreateClick }
                    className = "font-semibold py-2 px-4 rounded-lg shadow-md bg-primary-color-light-green text-white hover:shadow-md hover:bg-primary-color-green transition duration-300 ease-in-out"
                    >
                        Create Tournament
                    </button>
                </div>

            </div>
        </div>
    );

}

export default AdministratorTournaments;

