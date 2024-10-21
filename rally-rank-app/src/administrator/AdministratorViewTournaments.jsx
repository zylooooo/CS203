import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// Define the Tournaments component - format to display tournaments
const Tournaments = ({ tournaments, onEditClick, isMyTournaments }) => {
  return (
    <div className="tournaments-list flex flex-col space-y-8">
      {tournaments.map((tournament, index) => (
        <div
          key={index}
          className="tournament border rounded-lg p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition flex w-4/5"
        >
          <div className="flex-1 pr-4">
            <h3 className="section-one text-xl font-bold mb-2">
              {tournament.tournamentName}
            </h3>
            <div className="tournament-organiser-details flex items-center mb-2">
              <p className="organiser-name text-gray-600">
                Organiser: {tournament.createdBy}
              </p>
            </div>
            <p className="tournament-date text-gray-500 mb-2">
              Date: {tournament.startDate}
            </p>
            <p className="tournament-elo-rating-range text-gray-500">
              Elo Rating: {tournament.minElo} to {tournament.maxElo}
            </p>
          </div>
          <div className="section-two border-l border-gray-300 pl-4 flex-none w-1/3">
            <p className="text-gray-600 font-semibold">Venue</p>
            <p className="text-gray-500">{tournament.location}</p>
          </div>
          {/* Show the edit button only for tournaments in the My Tournaments tab */}
          {isMyTournaments && onEditClick && (
            <button
              onClick={() => onEditClick(tournament.tournamentName)}
              className="edit-tournament-button bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 shadow-md transition duration-300 ease-in-out ml-4"
            >
              Edit Tournament
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Define the TournamentsButtons component
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
          key={index}
          className={`btn transition-colors duration-300 ${
            activeButton === index
              ? "active-button underline"
              : "text-gray-700 hover:text-blue-500 hover:text-red-500"
          }`}
          onClick={() => handleButtonClick(index)}
        >
          {buttonLabel}
        </button>
      ))}
    </div>
  );
};

// Define the AdministratorTournaments component
function AdministratorTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);

  const [isMyTournaments, setIsMyTournaments] = useState(false); 

  const handleAllClick = () => {
    setTournaments(allTournaments);
    setIsMyTournaments(false); 
  };

  const handleMyClick = () => {
    setTournaments(myTournaments);
    setIsMyTournaments(true); 
  };

  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate("/administrator-create-tournaments");
  };

  const handleEditClick = (tournamentName) => {
    navigate("/administrator-edit-tournaments", {
      state: {
        tournamentName: tournamentName
      }
    });
  };

  // Get 'ALL TOURNAMENTS' - All ongoing and future tournaments 
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

  // Get 'MY TOURNAMENTS' - Ongoing and future tournaments created by Admin
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
    <div className="tournaments-page flex w-full p-9 gap-2 justify-evenly">
      <div className="row-container flex flex-col w-full p-14 gap-8">
        {/* LABELS */}
        <TournamentsButtons
          buttons={["All Tournaments", "My Tournaments"]}
          onAllClick={handleAllClick}
          onMyClick={handleMyClick}
        />

        {/* SEARCH BAR */}
        <div className="tournaments-search-bar flex gap-3">
          <input
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Search tournaments..."
          />
          <button className="border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
            Search
          </button>
        </div>

        {/* TOURNAMENT LISTS */}
        <Tournaments 
          tournaments = { tournaments } 
          onEditClick = { handleEditClick } 
          isMyTournaments = { isMyTournaments } 
        />

        {/* BUTTONS AT THE BOTTOM */}
        <div className="tournament-actions flex fixed right-12 bottom-8 justify-end ">
          <button
            onClick={handleCreateClick}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition duration-300 ease-in-out"
          >
            Create Tournament
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdministratorTournaments;



