// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AdministratorEditTournament() {
  const navigate = useNavigate();
  const location = useLocation();
  const tournamentName = location.state || {};
  const [isChanged, setIsChanged] = useState(false);
  const [tournament, setTournament] = useState(null);
  const { register, handleSubmit, setValue } = useForm();
  const [availablePlayers, setAvailablePlayers] = useState([]);

  const [deleteTournamentOpen, setDeleteTournamentOpen] = useState(false);

  // ----------------------- API Call: Deleting the tournament by the tournament name -----------------------
  async function deleteTournament() {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      } 
      console.log("JWT token:", adminData.jwtToken);
      const response = await axios.delete(
        `http://localhost:8080/admins/tournament/${tournamentName}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );
      console.log("Tournament deleted successfully:", response.data); // Confirmation log
      // Redirect to the tournaments list page after deletion
      navigate("/administrator-tournaments");
    } catch (error) {
      console.error("Error deleting tournament:", error.response?.data?.error || error.message);
    }
  }
  

  // ----------------------- API Call: Retrieving the available players by the tournament name -----------------------
  async function getAvailablePlayers() {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      }
      const response = await axios.get(
        `http://localhost:8080/admins/tournaments/${tournamentName}/available-users`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Available players fetched:", response.data); // test
        setAvailablePlayers(response.data);
      }
    } catch (error) {
      console.error("Error fetching available players:", error);
    }
  }

  // ----------------------- API Call: Retrieving the tournament details by the tournament name -----------------------
  async function getTournamentByName() {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      }
      const response = await axios.get(
        `http://localhost:8080/admins/tournaments/${tournamentName}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );
      if (response.status === 200) {
        setTournament(response.data);
        for (const key in response.data) {
          setValue(key, response.data[key]);
        }
      }
    } catch (error) {
      console.error("Error fetching tournament:", error);
      setTournament(null);
    }
  }

  // ------------------------------------- useEffect() -------------------------------------
  useEffect(() => {
    getTournamentByName();
    getAvailablePlayers();
  }, []);

  // ----------------------- API Call: Update the tournament details in backend -----------------------
  async function updateTournament(data) {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      }
      const today = new Date();
      const updatedTournamentDetails = {
        ...data,
        playersPool: tournament.playersPool, // Use the current players pool from state
        updatedAt: today,
        createdBy: adminData.adminName,
      };
      console.log("Sending updatedTournamentDetails to backend:", updatedTournamentDetails);
      const response = await axios.put(
        `http://localhost:8080/admins/tournaments/${tournament.tournamentName}`,
        updatedTournamentDetails,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );
      console.log("Backend response for tournament update:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating tournament:",
        error.response?.data?.error || error.message
      );
    }
  }

  // ----------------------- API Call: Add a player to the tournament -----------------------
  async function addPlayerToTournament(player) {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/admins/tournaments/${tournamentName}/add-players`,
        { players: [player.username] }, // Send an array with the player's username
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );
      
      if (response.status === 200) {
        console.log("Player added successfully to tournament:", player.username);
        
        // Update the local state after successful addition
        setTournament((prevTournament) => ({
          ...prevTournament,
          playersPool: [...(prevTournament.playersPool || []), player.username],
        }));
        setAvailablePlayers((prevAvailable) =>
          prevAvailable.filter((p) => p.id !== player.id)
        );
      }
    } catch (error) {
      console.error("Error adding player to tournament:", error.response?.data?.error || error.message);
    }
  }

  function addPlayerLocally(player) {
    console.log("Adding player to playersPool:", player);
    addPlayerToTournament(player);
    setIsChanged(true); // Enable the Update button to reflect changes
  }

  const onSubmit = (data) => {
    // Call updateTournament without modifying the playersPool
    updateTournament(data);
    // Do not navigate away, allow the admin to keep editing
  };

  const handleCloseButton = () => {
    navigate("/administrator-tournaments");
  };

  const handleChange = () => {
    setIsChanged(true);
  };

  const handleDeleteClick = () => { 
    setDeleteTournamentOpen(true);
  };

  return (
    <div className="tournaments-page main-container flex w-full p-9 gap-2 justify-evenly h-main overflow-auto mx-5">
      <div className="row-container flex flex-col w-full gap-8">
        <div className="mt-5 edit-tournament-details p-6 card-background rounded-[20px] shadow-md w-3/5 mx-auto border">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold"> Edit Tournament </h2>
              {/* CLOSE BUTTON */}
              <button
                onClick={handleCloseButton}
                className="text-3xl font-bold text-gray-400 hover:text-text-grey"
                type="button"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-5 mt-8">
              {/* TOURNAMENT NAME */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="tournamentName"
                  className="block text-sm font-medium"
                >
                  Tournament Name
                </label>
                <input
                  className="border p-2 w-full"
                  type="text"
                  id="tournamentName"
                  {...register("tournamentName", { onChange: handleChange })}
                />
              </div>
              {/* TOURNAMENT START DATE */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium"
                >
                  Start Date
                </label>
                <input
                  className="border p-2 w-full"
                  type="date"
                  id="startDate"
                  {...register("startDate", { onChange: handleChange })}
                />
              </div>
              {/* TOURNAMENT VENUE */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="venue"
                  className="block text-sm font-medium"
                >
                  Venue
                </label>
                <input
                  className="border p-2 w-full"
                  type="text"
                  id="venue"
                  {...register("location", { onChange: handleChange })}
                />
              </div>
              {/* TOURNAMENT GENDER SPECIFICATION */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium"
                >
                  Gender Specification
                </label>
                <select
                  className="border p-2 w-full"
                  id="gender"
                  {...register("gender", { onChange: handleChange })}
                >
                  <option value=""> Select Gender </option>
                  <option value="Male"> Male </option>
                  <option value="Female"> Female </option>
                </select>
              </div>
              {/* TOURNAMENT AGE CATEGORY */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium"
                >
                  Age Category
                </label>
                <select
                  className="border p-2 w-full"
                  id="category"
                  {...register("category", { onChange: handleChange })}
                >
                  <option value=""> Select Tournament Category </option>
                  <option value="U16"> U16 </option>
                  <option value="U21"> U21 </option>
                  <option value="Open">Open</option>
                </select>
              </div>
              {/* TOURNAMENT ELO RATING RANGE */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="minElo"
                  className="block text-sm font-medium"
                >
                  Elo Rating Range
                </label>
                <div className="flex gap-2">
                  <input
                    className="border p-2 w-full"
                    type="number"
                    id="minElo"
                    {...register("minElo", { onChange: handleChange })}
                  />
                  <span> to </span>
                  <input
                    className="border p-2 w-full"
                    type="number"
                    id="maxElo"
                    {...register("maxElo", { onChange: handleChange })}
                  />
                </div>
              </div>
              {/* PLAYER CAPACITY */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="maxPlayers"
                  className="block text-sm font-medium"
                >
                  Max Players
                </label>
                <input
                  className="border p-2 w-full"
                  type="number"
                  id="maxPlayers"
                  {...register("playerCapacity", { onChange: handleChange })}
                />
              </div>
              {/* TOURNAMENT PLAYERS POOL */}
              {tournament &&
              tournament.playersPool &&
              tournament.playersPool.length > 0 ? (
                <div className="flex flex-col gap-1 mt-5">
                  <h3 className="block text-sm font-medium">
                    Players in Tournament
                  </h3>
                  <ol className="list-decimal pl-5">
                    {tournament.playersPool.map((username, index) => (
                      <li key={index} className="mt-2 mb-2">
                        {username}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No players have registered for this tournament.
                </p>
              )}
  
              {/* ADD PLAYERS TO TOURNAMENT */}
              <div className="flex flex-col gap-1 mt-5">
                <h3 className="block text-sm font-medium">
                  Add Players to Tournament
                </h3>
                {availablePlayers.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {availablePlayers.map((player) => (
                      <li
                        key={player.id}
                        className="mt-2 mb-2 flex items-center justify-between"
                      >
                        <span>
                          {player.username ? player.username : "Unnamed Player"}
                        </span>
                        <button
                          onClick={() => addPlayerLocally(player)}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No available players to add.
                  </p>
                )}
              </div>
  
              {/* TOURNAMENT REMARKS */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="remarks"
                  className="block text-sm font-medium"
                >
                  Remarks
                </label>
                <textarea
                  className="border p-2 w-full"
                  id="remarks"
                  {...register("remarks", { onChange: handleChange })}
                />
              </div>
              
            </div>
            {/* BACK TO PROFILE */}
            <div className = "flex flex-col items-center justify-around mt-4 gap-8">
                <button
                    type = "submit"
                    className = {`rounded-lg border w-1/3 py-2 px-4 text-md font-semibold text-white
                                ${isChanged ? "bg-primary-color-light-green hover:bg-primary-color-green" : "bg-gray-300"}`}
                    disabled = {!isChanged}
                >
                    Save Changes
                </button>
                <button
                    onClick = {handleDeleteClick}
                    className = "py-2 px-4 rounded-lg border font-semibold w-1/3 bg-secondary-color-red hover:bg-red-600 text-white"
                >
                    Delete Tournament
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
}

export default AdministratorEditTournament;