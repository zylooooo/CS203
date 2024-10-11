import React, { useState } from "react";
import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import profilePictureTest2 from "../assets/profile-picture-two.jpg";

// Replace with API call
const allPlayers = [
  {
    profilePicture: profilePictureTest1,
    name: "John Doe",
    username: "johnny123",
    gender: "Male",
    age: 25,
    eloRating: 1350,
    strikes: 0,
  },
  {
    profilePicture: profilePictureTest2,
    name: "Jane Smith",
    username: "janesmith",
    gender: "Female",
    age: 27,
    eloRating: 1400,
    strikes: 1,
  },
  {
    profilePicture: profilePictureTest1,
    name: "Sam Wilson",
    username: "samwilson",
    gender: "Male",
    age: 22,
    eloRating: 1200,
    strikes: 2,
  },
  {
    profilePicture: profilePictureTest2, // Same profile picture as player 2
    name: "Alice Brown",
    username: "alicebrown",
    gender: "Female",
    age: 30,
    eloRating: 1300,
    strikes: 0,
  },
];

// Players Table Component
const PlayersTable = ({ players, handleIncrement, handleDecrement }) => {
  return (
    <table className="min-w-full bg-white border rounded-lg shadow-md">
      <thead>
        <tr>
          <th className="px-4 py-2 border">#</th>
          <th className="px-4 py-2 border">Profile Picture</th>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Username</th>
          <th className="px-4 py-2 border">Gender</th>
          <th className="px-4 py-2 border">Age</th>
          <th className="px-4 py-2 border">Elo Rating</th>
          <th className="px-4 py-2 border">Strikes</th>
          <th className="px-4 py-2 border">Status</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player, index) => (
          <tr key={index} className="hover:bg-gray-100">
            <td className="px-4 py-2 border">{index + 1}</td>
            <td className="px-4 py-2 border">
              <img
                src={player.profilePicture}
                alt={player.name}
                className="w-10 h-10 rounded-full"
              />
            </td>
            <td className="px-4 py-2 border">{player.name}</td>
            <td className="px-4 py-2 border">{player.username}</td>
            <td className="px-4 py-2 border">{player.gender}</td>
            <td className="px-4 py-2 border">{player.age}</td>
            <td className="px-4 py-2 border">{player.eloRating}</td>
            <td className="px-4 py-2 border">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleDecrement(index)}
                  className={`bg-gray-300 text-black px-2 py-1 rounded-l hover:bg-gray-400 transition ${
                    player.strikes === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={player.strikes === 0}
                >
                  -
                </button>
                <span className="mx-3">{player.strikes}</span>
                <button
                  onClick={() => handleIncrement(index)}
                  className={`bg-gray-300 text-black px-2 py-1 rounded-r hover:bg-gray-400 transition ${
                    player.strikes === 3 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={player.strikes === 3}
                >
                  +
                </button>
              </div>
            </td>
            <td className="px-4 py-2 border">
              {player.strikes >= 3 ? (
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

// Main AdministratorTools component
function AdministratorTools() {
  const [players, setPlayers] = useState(allPlayers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [strikeReason, setStrikeReason] = useState("");

  const handleIncrement = (playerIndex) => {
    setSelectedPlayerIndex(playerIndex); // Show textbox for reason
  };

  const handleSubmitStrikeReason = () => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      if (updatedPlayers[selectedPlayerIndex].strikes < 3) {
        updatedPlayers[selectedPlayerIndex] = {
          ...updatedPlayers[selectedPlayerIndex],
          strikes: updatedPlayers[selectedPlayerIndex].strikes + 1,
        };
      }
      return updatedPlayers;
    });
    setSelectedPlayerIndex(null); // Hide textbox after submitting
    setStrikeReason(""); // Reset the reason field
  };

  const handleDecrement = (playerIndex) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      // Decrement strikes only if greater than 0
      if (updatedPlayers[playerIndex].strikes > 0) {
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          strikes: updatedPlayers[playerIndex].strikes - 1,
        };
      }
      return updatedPlayers;
    });
  };

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="players-page w-full p-9">
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
        handleDecrement={handleDecrement}
      />

      {selectedPlayerIndex !== null && (
        <div className="mt-5">
          <h3>Enter reason for issuing strike to {players[selectedPlayerIndex].name}:</h3>
          <input
            type="text"
            value={strikeReason}
            onChange={(e) => setStrikeReason(e.target.value)}
            placeholder="Reason for strike"
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            onClick={handleSubmitStrikeReason}
            className="mt-3 bg-blue-500 text-white p-2 rounded"
          >
            Submit Reason
          </button>
        </div>
      )}
    </div>
  );
}

export default AdministratorTools;







