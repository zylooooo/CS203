import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import profilePictureTest2 from "../assets/profile-picture-two.jpg";

// Replace with API call
const allTournaments = [
  {
    name: "Tournament 1",
    organizerProfilePicture: profilePictureTest1,
    organizerName: "Puff Diddy",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
  {
    name: "Tournament 2",
    organizerProfilePicture: profilePictureTest2,
    organizerName: "Justin Beiber",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
  {
    name: "Tournament 3",
    organizerProfilePicture: profilePictureTest1,
    organizerName: "Puff Diddy",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
  {
    name: "Tournament 4",
    organizerProfilePicture: profilePictureTest2,
    organizerName: "Justin Beiber",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
];

// Replace with API call
const myTournaments = [
  {
    name: "Tournament 5",
    organizerProfilePicture: profilePictureTest1,
    organizerName: "Puff Diddy",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
  {
    name: "Tournament 6",
    organizerProfilePicture: profilePictureTest2,
    organizerName: "Justin Beiber",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
];

// Replace with API call
const draftTournaments = [
  {
    name: "Tournament 7",
    organizerProfilePicture: profilePictureTest1,
    organizerName: "Puff Diddy",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
  {
    name: "Tournament 8",
    organizerProfilePicture: profilePictureTest2,
    organizerName: "Justin Beiber",
    startDate: "03/09/2024",
    endDate: "17/09/2024",
    eloRatingRange: "1200 - 1500",
    venue: "Choa Chu Kang Stadium, Singapore 689236",
  },
];

// Define the Tournaments component - format to display tournaments
const Tournaments = ({ tournamentTest, onEditClick, isMyTournaments }) => {
  return (
    <div className="tournaments-list flex flex-col space-y-8">
      {tournamentTest.map((tournament, index) => (
        <div
          key={index}
          className="tournament border rounded-lg p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition flex w-4/5"
        >
          <div className="flex-1 pr-4">
            <h3 className="section-one text-xl font-bold mb-2">
              {tournament.name}
            </h3>
            <div className="tournament-organiser-details flex items-center mb-2">
              <img
                src={tournament.organizerProfilePicture}
                alt="Organizer"
                className="organiser-picture w-8 h-8 rounded-full mr-2"
              />
              <p className="organiser-name text-gray-600">
                Organiser: {tournament.organizerName}
              </p>
            </div>
            <p className="tournament-date text-gray-500 mb-2">
              Date: {tournament.startDate} to {tournament.endDate}
            </p>
            <p className="tournament-elo-rating-range text-gray-500">
              Elo Rating: {tournament.eloRatingRange}
            </p>
          </div>
          <div className="section-two border-l border-gray-300 pl-4 flex-none w-1/3">
            <p className="text-gray-600 font-semibold">Venue</p>
            <p className="text-gray-500">{tournament.venue}</p>
          </div>
          {/* Show the edit button only for tournaments in the My Tournaments tab */}
          {isMyTournaments && onEditClick && (
            <button
              onClick={() => onEditClick(tournament.name)}
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
  const [activeButton, setActiveButton] = useState(0); // "Upcoming Button" will be the first active button

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
  const [tournamentTest, setTournamentTest] = useState(allTournaments);
  const [isMyTournaments, setIsMyTournaments] = useState(false); // State to track if we are viewing My Tournaments

  const handleAllClick = () => {
    setTournamentTest(allTournaments);
    setIsMyTournaments(false); // Set to false for All Tournaments
  };

  const handleMyClick = () => {
    setTournamentTest(myTournaments);
    setIsMyTournaments(true); // Set to true for My Tournaments
  };

  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate("/administrator-create-tournaments");
  };

  const handleEditClick = (tournamentName) => {
    // Navigate to the edit page with the tournament name or id as a parameter
    navigate(`/administrator-edit-tournaments`);
  };

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
        <Tournaments tournamentTest={tournamentTest} onEditClick={handleEditClick} isMyTournaments={isMyTournaments} />

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



