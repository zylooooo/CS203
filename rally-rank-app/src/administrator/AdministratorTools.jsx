import React, { useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import profilePictureTest2 from "../assets/profile-picture-two.jpg";

// Replace with API call
const allPlayers = [
  {
    email : "user@gmail.com",
    phoneNumber : "12345678",
    elo : 400,
    gender : "M",
    dateOfBirth : "2002-01-01",
    participatedTournaments : [
      {
        tournamentName: "Spring Championship",
      },
      {
        tournamentName: "Singapore Open",
      },
    ],
    medicalInformation : {
        emergencyContactName : "Clairo",
        emergencyContactNumber : "999",
        emergencyContactRelationship : "polis"
    },
    profilePic : profilePictureTest1,
    password : "userPW",
    userName : "UserName",
    firstName : "Michael",
    lastName : "Bublé",
    isAvailable : true,
    strikeReport : [
      {
        reportedDetails : "angry",
        dateCreated : "2024-09-29 13:30",
        issuedBy : "adminName"
      },
    ],
  },
  {
    email : "user@gmail.com",
    phoneNumber : "12345678",
    elo : 400,
    gender : "M",
    dateOfBirth : "2002-01-01",
    participatedTournaments : [
      {
        tournamentName: "Spring Championship",
      },
      {
        tournamentName: "Singapore Open",
      },
    ],
    medicalInformation : {
        emergencyContactName : "Clairo",
        emergencyContactNumber : "999",
        emergencyContactRelationship : "polis"
    },
    profilePic : profilePictureTest2,
    password : "userPW",
    userName : "UserName",
    firstName : "Michael",
    lastName : "Scott",
    isAvailable : true,
    strikeReport : [
      {
        reportedDetails : "angry",
        dateCreated : "2024-09-29 13:30",
        issuedBy : "adminName"
      },
      {
        reportedDetails : "angry",
        dateCreated : "2024-09-29 13:30",
        issuedBy : "adminName"
      },
      {
        reportedDetails : "reason for ban",
        dateCreated : "2024-09-29 13:30",
        issuedBy : "<reference to adminName>"
      },
    ],
  },
  {
    email : "user@gmail.com",
    phoneNumber : "12345678",
    elo : 400,
    gender : "M",
    dateOfBirth : "2002-01-01",
    participatedTournaments : [
      {
        tournamentName: "Spring Championship",
      },
      {
        tournamentName: "Singapore Open",
      },
    ],
    medicalInformation : {
        emergencyContactName : "Clairo",
        emergencyContactNumber : "999",
        emergencyContactRelationship : "polis"
    },
    profilePic : profilePictureTest1,
    password : "userPW",
    userName : "UserName",
    firstName : "Michael",
    lastName : "Jordan",
    isAvailable : true,
    strikeReport : [ ],
  },
  {
    email : "user@gmail.com",
    phoneNumber : "12345678",
    elo : 400,
    gender : "M",
    dateOfBirth : "2002-01-01",
    participatedTournaments : [
      {
        tournamentName: "Spring Championship",
      },
      {
        tournamentName: "Singapore Open",
      },
    ],
    medicalInformation : {
        emergencyContactName : "Clairo",
        emergencyContactNumber : "999",
        emergencyContactRelationship : "polis"
    },
    profilePic : profilePictureTest1,
    password : "userPW",
    userName : "UserName",
    firstName : "Michael B.",
    lastName : "Jordan",
    isAvailable : true,
    strikeReport : [
      {
        reportedDetails : "angry",
        dateCreated : "2024-09-29 13:30",
        issuedBy : "adminName"
      },
      {
        reportedDetails : "threw racket at me",
        dateCreated : "2024-09-29 13:30",
        issuedBy : "<reference to adminName>"
      },
    ],
  },
];

// TABLE OF PLAYERS
const PlayersTable = ({ players, handleIncrement, handleViewClick }) => {
  return (
    <table className="min-w-full bg-white border rounded-lg shadow-md">
      <thead>
        <tr>
          <th className="px-4 py-2 border">#</th>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Username</th>
          <th className="px-4 py-2 border">Strikes</th>
          <th className="px-4 py-2 border">Status</th>
        </tr>
      </thead>

      <tbody>
        {players.map((player, index) => (
          <tr key={index} className="hover:bg-gray-100">
            <td className="px-4 py-2 border">{index + 1}</td>

            <td className="px-4 py-2 border">{player.firstName} {player.lastName}</td>

            <td className="px-4 py-2 border">
              <div className="flex flex-row">
                <div className="w-1/3">
                  <img
                    className="w-10 h-10 rounded-full mx-auto"
                    src={player.profilePic}
                    alt={player.userName}
                  />
                </div>
                <div className="w-2/3 my-auto">
                  <span>{player.userName}</span>
                </div>
              </div>
            </td>

            {/* STRIKES COLUMN */}
            <td className="px-4 py-2 border gap-2">

              {/* NO. OF STRIKES */}
              <div className="flex flex-row">
                <div className="w-1/3 flex my-auto justify-center">
                  {player.strikeReport.length}
                </div>

                {/* VIEW STRIKES */}
                <div className="w-1/3 my-auto flex justify-center">
                  <button
                    onClick={() => handleViewClick(player)}
                    className="bg-primary-color-white border text-black p-2 py-1.5 rounded-xl hover:bg-gray-400 transition"
                  >
                    View Strikes
                  </button>
                </div>

                {/* ISSUE STRIKE */}
                <div className="w-1/3 my-auto flex justify-center">
                  <button
                    onClick={() => handleIncrement(player)}
                    className={`bg-red-color text-black p-2 py-1.5 rounded-xl hover:bg-gray-400 transition ${
                      player.strikeReport.length === 3
                        ? "opacity-50 bg-secondary-color-light-gray cursor-not-allowed"
                        : ""
                    }`}
                    disabled={player.strikeReport.length === 3}
                  >
                    Issue Strike
                  </button>
                </div>
              </div>
            </td>

            <td className="px-4 py-2 border">
              {player.strikeReport.length >= 3 ? (
                <span className="text-red-500 font-bold">BANNED</span>
              ) : (
                <span className="text-gray-500">Active</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// STRIKE REPORT
const StrikeReport = ({ player, onClose, setPlayers }) => {
  const { register, handleSubmit, formState: { errors }} = useForm();

  const onSubmit = (data) => {
    console.log(data);
    onClose();
    
    // EDIT TO ADD STRIKE REPORT TO STRIKEREPORT ARRAY (POST)
    // 1. reportedDetails = data.reason
    // 2. dateCreated = new Date()
    // 3. issuedBy = get adminName from session
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const playerIndex = updatedPlayers.findIndex(
        (p) => p.username === player.username
      );

      if (updatedPlayers[playerIndex].strikes < 3) {
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          strike: updatedPlayers[playerIndex].strikes + 1,
        };
      }

      return updatedPlayers;
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-primary-color-white bg-opacity-50">
      <div className="card p-6 rounded-lg w-1/3 bg-primary-color-white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-bold mb-4">
            Issue Strike to {player.name}
          </h2>

          <div className="flex flex-col gap-2 justify-evenly">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason
            </label>
            <input
              className="border p-2"
              type="text"
              id="reason"
              {...register("reason", {
                required: "This field is required.",
              })}
            />
            <p className="error"> {errors.reason?.message} </p>
          </div>

          <div className="flex justify-end">
            {/* CANCEL */}
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded mr-2 hover:bg-gray-400 transition"
            >
              Cancel
            </button>

            {/* SUBMIT */}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

StrikeReport.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    reason: PropTypes.object,
  }).isRequired,
};

const ViewStrike = ({ player, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-primary-color-white bg-opacity-50">
      <div className="card p-6 rounded-lg w-1/3 bg-primary-color-white">
        <h2 className="text-xl font-bold mb-4">Strikes for {player.firstName} {player.lastName}</h2>
        {player.strikeReport.map((report, index) => (
            <div key={index} className="border p-2 rounded">
              <p><strong>Reason:</strong> {report.reportedDetails}</p>
              <p><strong>Date Created:</strong> {report.dateCreated}</p>
              <p><strong>Issued By:</strong> {report.issuedBy}</p>
            </div>
          ))}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main AdministratorTools component
function AdministratorTools() {
  const [players, setPlayers] = useState(allPlayers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isStrikeReportOpen, setIsStrikeReportOpen] = useState(false);
  const [isViewStrikeOpen, setIsViewStrikeOpen] = useState(false);

  const handleIncrement = (player) => {
    setSelectedPlayer(player);
    setIsStrikeReportOpen(true);
  };

  const handleViewClick = (player) => {
    setSelectedPlayer(player);
    setIsViewStrikeOpen(true);
  };

  const filteredPlayers = players.filter(
    (player) =>
      player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="players-page main-container flex flex-col p-9 px-20">
      <h1 className="text-2xl font-bold mb-5">Players List</h1>
      <input
        type="text"
        placeholder="Search by name or username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-5 p-2 border border-gray-300 rounded"
      />
      <PlayersTable
        players={filteredPlayers}
        handleIncrement={handleIncrement}
        handleViewClick={handleViewClick}
      />

      {/* CONDITIONALLY RENDER STRIKE REPORT POP-UP */}
      {isStrikeReportOpen && (
        <StrikeReport
          player={selectedPlayer}
          onClose={() => setIsStrikeReportOpen(false)}
          setPlayers={setPlayers}
        />
      )}

      {/* CONDTIONTALLY RENDER VIEW STRIKE POP-UP */}
      {isViewStrikeOpen && (
        <ViewStrike
          player={selectedPlayer}
          onClose={() => setIsViewStrikeOpen(false)}
        />
      )}

    </div>
  );
}

export default AdministratorTools;
