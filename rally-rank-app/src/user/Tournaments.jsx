import React from 'react';
import TournamentsButtons from "../components/TournamentsButtons";
import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import profilePictureTest2 from "../assets/profile-picture-two.jpg";

// Define the tournamentTest array
const tournamentTest = [
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
    name: "Tournament 2",
    organizerProfilePicture: profilePictureTest2,
    organizerName: "Justin Beiber",
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
];

// Define the Tournaments component
const Tournaments = ({ tournamentTest }) => {
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
        </div>
      ))}
    </div>
  );
};

// Define the UserTournaments component
const UserTournaments = () => {
  return (
    <div className="tournaments-page flex w-full p-9 gap-2 justify-evenly">
      <div className="row-container flex flex-col w-3/5 gap-8">
        {/* LABELS */}
        <div className="tournaments-labels">
          <TournamentsButtons buttons={["Upcoming Tournaments", "Past Tournaments", "My Tournaments"]} />
        </div>

        {/* SEARCH BAR */}
        <div className="tournaments-search-bar flex gap-3">
          <input className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Search tournaments..." />
          <button className="border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">Search</button>
        </div>

        {/* TOURNAMENTS LIST */}
        <Tournaments tournamentTest={tournamentTest} />
      </div>

      <div className="col-container">
        Ongoing Tournaments
      </div>
    </div>
  );
};

export default UserTournaments;