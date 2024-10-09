import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import profilePictureTest2 from "../assets/profile-picture-two.jpg";

// Replace with API call
const upcomingTournaments = [
    {
      name: "Tournament 3",
      organizerProfilePicture: profilePictureTest1,
      organizerName: "Puff Diddy",
      startDate: "03/09/2024",
      endDate: "17/09/2024",
      eloRatingRange: "1200 - 1500",
      venue: "Choa Chu Kang Stadium, Singapore 689236",
      remarks: "",
    },
    {
      name: "Tournament 4",
      organizerProfilePicture: profilePictureTest2,
      organizerName: "Justin Beiber",
      startDate: "03/09/2024",
      endDate: "17/09/2024",
      eloRatingRange: "1200 - 1500",
      venue: "Choa Chu Kang Stadium, Singapore 689236",
      remarks: "This is only for the LGBTQ community",
    },
  ];

  // Replace with API call
const pastTournaments = [
    {
      name: "Tournament 5",
      organizerProfilePicture: profilePictureTest1,
      organizerName: "Puff Diddy",
      startDate: "03/09/2024",
      endDate: "17/09/2024",
      eloRatingRange: "1200 - 1500",
      venue: "Choa Chu Kang Stadium, Singapore 689236",
      remarks: "",
    },
    {
      name: "Tournament 6",
      organizerProfilePicture: profilePictureTest2,
      organizerName: "Justin Beiber",
      startDate: "03/09/2024",
      endDate: "17/09/2024",
      eloRatingRange: "1200 - 1500",
      venue: "Choa Chu Kang Stadium, Singapore 689236",
      remarks: "",
    },
  ];

  // Replace with API call
  const myTournaments = [
    {
      name: "Tournament 1",
      organizerProfilePicture: profilePictureTest1,
      organizerName: "Puff Diddy",
      startDate: "03/09/2024",
      endDate: "17/09/2024",
      eloRatingRange: "1200 - 1500",
      venue: "Choa Chu Kang Stadium, Singapore 689236",
      remarks: "",
    },
    {
      name: "Tournament 2",
      organizerProfilePicture: profilePictureTest2,
      organizerName: "Justin Beiber",
      startDate: "03/09/2024",
      endDate: "17/09/2024",
      eloRatingRange: "1200 - 1500",
      venue: "Choa Chu Kang Stadium, Singapore 689236",
      remarks: "",
    },
  ];

// Define the Tournaments component - format to display tournaments
const Tournaments = ({ tournamentTest }) => {
    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        navigate("/tournament-details", {state: tournament });  // redirect with tournament data
    };

  return (
    <div className="tournaments-list flex flex-col space-y-8">
      {tournamentTest.map((tournament, index) => (
        <div
          key={index}
          className="tournament border rounded-lg p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition flex w-4/5"
          onClick={() => handleTournamentCardClick(tournament)}
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
        </div>
      ))}
    </div>
  );
};

// Define the TournamentsButtons component
const TournamentsButtons = ({ buttons, onUpcomingClick, onPastClick, onMyClick }) => {
  const [activeButton, setActiveButton] = useState(0); // "Upcoming Button" will be the first active button

  const handleButtonClick = (index) => {
    setActiveButton(index);
    if (index === 0) {
      onUpcomingClick();
    } else if (index === 1) {
      onPastClick();
    } else {
      onMyClick();
    }
  };

  return (
      <div className = "tournaments-buttons flex gap-5">
          {buttons.map((buttonLabel, index) => (
              <button 
                  key = {index}
                  className = {`btn transition-colors duration-300 ${activeButton === index ? 'active-button underline' : 'text-gray-700 hover:text-blue-500 hover:text-red-500'}`} 
                  onClick = {() => handleButtonClick(index)}>
                      {buttonLabel}
              </button>
          ))}
      </div>
  );
}

// Define the UserTournaments component
function UserTournaments() {
  const [tournamentTest, setTournamentTest] = useState(upcomingTournaments);

  const handleUpcomingClick = () => {
    setTournamentTest(upcomingTournaments);
  };

  const handlePastClick = () => {
    setTournamentTest(pastTournaments);
  };

  const handleMyClick = () => {
    setTournamentTest(myTournaments);
  };

  return (
    <>
      <div className = "tournaments-page main-container">
        <div className = "row-container flex flex-col w-3/5 gap-8">

          {/* LABELS */}
          <TournamentsButtons
              buttons={["Upcoming Tournaments", "Past Tournaments", "My Tournaments"]}
              onUpcomingClick={handleUpcomingClick}
              onPastClick={handlePastClick}
              onMyClick={handleMyClick}
            />


          {/* SEARCH BAR */}
          <div className = "tournaments-search-bar flex gap-3">
            <input
              className = "border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder = "Search tournaments..."
            />
            <button className = "border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
              Search
            </button>
          </div>

          {/* TOURNAMENTS LIST */}
          <Tournaments tournamentTest={tournamentTest} />
        </div>

        <div className = "col-container">Ongoing Tournaments</div>
      </div>
    </>
  );
};

export default UserTournaments;