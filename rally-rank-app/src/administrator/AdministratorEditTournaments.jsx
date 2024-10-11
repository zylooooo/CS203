import { useState } from 'react';

const AdminTournamentsEditForm = ({ register, errors, tournamentData }) => {
  const [isSignUp, setIsSignUp] = useState(false); // Default to false for "No"
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  
  const playerOptions = [
    { value: "John Doe", label: "John Doe (Male, Age: 20, Elo: 1500)" },
    { value: "Jane Smith", label: "Jane Smith (Female, Age: 18, Elo: 1600)" },
    { value: "Emily Jones", label: "Emily Jones (Female, Age: 19, Elo: 1400)" },
    { value: "Mark Brown", label: "Mark Brown (Male, Age: 17, Elo: 1550)" },
    { value: "Chris Green", label: "Chris Green (Male, Age: 21, Elo: 1600)" },
  ];

  const handleAddPlayer = (event) => {
    const player = event.target.value;
    if (player && !selectedPlayers.includes(player)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
    event.target.value = ''; // Reset the select input
  };

  const handleRemovePlayer = (player) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p !== player));
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold">Edit Tournament</h2>
      <div className="flex flex-col gap-5 mt-8">
        {/* Tournament Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="tournamentName" className="block text-sm font-medium text-gray-700">
            Tournament Name
          </label>
          <input
            className="border p-2 w-full"
            type="text"
            id="tournamentName"
            placeholder="Enter Tournament Name"
            defaultValue={tournamentData.tournamentName} // Set default value
            {...register("tournamentName", { required: "Tournament name is required" })}
          />
          <p className="error">{errors.tournamentName?.message}</p>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="date"
              id="startDate"
              defaultValue={tournamentData.startDate} // Set default value
              {...register("startDate", { required: "Start date is required" })}
            />
            <span>-</span>
            <input
              className="border p-2 w-full"
              type="date"
              id="endDate"
              defaultValue={tournamentData.endDate} // Set default value
              {...register("endDate", { required: "End date is required" })}
            />
          </div>
          <p className="error">
            {errors.startDate?.message || errors.endDate?.message}
          </p>
        </div>

        {/* Venue */}
        <div className="flex flex-col gap-1">
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
            Venue
          </label>
          <input
            className="border p-2 w-full"
            type="text"
            id="venue"
            placeholder="Enter Venue"
            defaultValue={tournamentData.venue} // Set default value
            {...register("venue", { required: "Venue is required" })}
          />
          <p className="error">{errors.venue?.message}</p>
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender Specification
          </label>
          <select
            className="border p-2 w-full"
            id="gender"
            defaultValue={tournamentData.gender} // Set default value
            {...register("gender", { required: "Gender specification is required" })}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Both">Both</option>
          </select>
          <p className="error">{errors.gender?.message}</p>
        </div>

        {/* Age Range */}
        <div className="flex flex-col gap-1">
          <label htmlFor="minAge" className="block text-sm font-medium text-gray-700">
            Age Range
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="number"
              id="minAge"
              placeholder="Min Age"
              defaultValue={tournamentData.minAge} // Set default value
              {...register("minAge", { required: "Minimum age is required" })}
            />
            <span>-</span>
            <input
              className="border p-2 w-full"
              type="number"
              id="maxAge"
              placeholder="Max Age"
              defaultValue={tournamentData.maxAge} // Set default value
              {...register("maxAge", { required: "Maximum age is required" })}
            />
          </div>
          <p className="error">
            {errors.minAge?.message || errors.maxAge?.message}
          </p>
        </div>

        {/* Elo Rating Range */}
        <div className="flex flex-col gap-1">
          <label htmlFor="minElo" className="block text-sm font-medium text-gray-700">
            Elo Rating Range
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="number"
              id="minElo"
              placeholder="Min Elo"
              defaultValue={tournamentData.minElo} // Set default value
              {...register("minElo", { required: "Minimum Elo rating is required" })}
            />
            <span>-</span>
            <input
              className="border p-2 w-full"
              type="number"
              id="maxElo"
              placeholder="Max Elo"
              defaultValue={tournamentData.maxElo} // Set default value
              {...register("maxElo", { required: "Maximum Elo rating is required" })}
            />
          </div>
          <p className="error">
            {errors.minElo?.message || errors.maxElo?.message}
          </p>
        </div>

        {/* Number of Players */}
        <div className="flex flex-col gap-1">
          <label htmlFor="minPlayers" className="block text-sm font-medium text-gray-700">
            Number of Players
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="number"
              id="minPlayers"
              placeholder="Min Players"
              defaultValue={tournamentData.minPlayers} // Set default value
              {...register("minPlayers", {
                required: "Minimum number of players is required",
              })}
            />
            <span>-</span>
            <input
              className="border p-2 w-full"
              type="number"
              id="maxPlayers"
              placeholder="Max Players"
              defaultValue={tournamentData.maxPlayers} // Set default value
              {...register("maxPlayers", {
                required: "Maximum number of players is required",
              })}
            />
          </div>
          <p className="error">
            {errors.minPlayers?.message || errors.maxPlayers?.message}
          </p>
        </div>

        {/* Sign-Up Basis */}
        <div className="flex flex-col gap-1">
          <label htmlFor="isSignUp" className="block text-sm font-medium text-gray-700">
            Is the Tournament on a Sign-Up Basis?
          </label>
          <select
            className="border p-2 w-full"
            id="isSignUp"
            defaultValue={isSignUp ? "Yes" : "No"}
            onChange={(e) => setIsSignUp(e.target.value === "Yes")}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Players Selection */}
        <div className="flex flex-col gap-1">
          <label htmlFor="playerSelect" className="block text-sm font-medium text-gray-700">
            Select Players
          </label>
          <select id="playerSelect" className="border p-2 w-full" onChange={handleAddPlayer}>
            <option value="">Select a Player</option>
            {playerOptions.map((player) => (
              <option key={player.value} value={player.value}>
                {player.label}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <h4 className="font-medium">Selected Players:</h4>
            <ul className="list-disc pl-5">
              {selectedPlayers.map((player) => (
                <li key={player} className="flex justify-between">
                  {player}
                  <button onClick={() => handleRemovePlayer(player)} className="text-red-500">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdministratorEditTournaments;

