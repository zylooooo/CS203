const AdminTournamentsEditForm = ({ register, errors, tournamentData }) => (
    <div>
      <h2 className="text-xl font-extrabold">Edit Tournament</h2>
      <div className="flex flex-col gap-5 mt-8">
        {/* Tournament Name */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="tournamentName"
            className="block text-sm font-medium text-gray-700"
          >
            Tournament Name
          </label>
          <input
            className="border p-2 w-full"
            type="text"
            id="tournamentName"
            placeholder="Enter Tournament Name"
            defaultValue={tournamentData.tournamentName} // Set default value
            {...register("tournamentName", {
              required: "Tournament name is required",
            })}
          />
          <p className="error">{errors.tournamentName?.message}</p>
        </div>
  
        {/* Date Range */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="venue"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender Specification
          </label>
          <select
            className="border p-2 w-full"
            id="gender"
            defaultValue={tournamentData.gender} // Set default value
            {...register("gender", {
              required: "Gender specification is required",
            })}
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
          <label
            htmlFor="minAge"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="minElo"
            className="block text-sm font-medium text-gray-700"
          >
            Elo Rating Range
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="number"
              id="minElo"
              placeholder="Min Elo"
              defaultValue={tournamentData.minElo} // Set default value
              {...register("minElo", {
                required: "Minimum Elo rating is required",
              })}
            />
            <span>-</span>
            <input
              className="border p-2 w-full"
              type="number"
              id="maxElo"
              placeholder="Max Elo"
              defaultValue={tournamentData.maxElo} // Set default value
              {...register("maxElo", {
                required: "Maximum Elo rating is required",
              })}
            />
          </div>
          <p className="error">
            {errors.minElo?.message || errors.maxElo?.message}
          </p>
        </div>
  
        {/* Number of Players */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="minPlayers"
            className="block text-sm font-medium text-gray-700"
          >
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
        {/* Remarks */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="remarks"
            className="block text-sm font-medium text-gray-700"
          >
            Remarks
          </label>
          <input
            className="border p-2 w-full"
            type="text"
            id="remarks"
            placeholder="Enter Remarks"
            defaultValue={tournamentData.remarks} // Set default value
          />
        </div>
        <div className="flex justify-evenly gap-5 pt-10">
          <button
            className="font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
            type="submit"
          >
            Update Tournament
          </button>
        </div>
      </div>
    </div>
  );
  
  function AdministratorEditTournaments() {
    // Mock tournament data; replace this with API data
    const tournamentData = {
      tournamentName: "Summer Tennis Championship",
      startDate: "2024-07-01",
      endDate: "2024-07-05",
      venue: "Central Park Tennis Club",
      gender: "Both",
      minAge: 18,
      maxAge: 40,
      minElo: 1200,
      maxElo: 2000,
      minPlayers: 4,
      maxPlayers: 16,
      remarks: "This tournament is open to all skill levels."
    };
  
    return (
      <div className="tournaments-page flex w-full p-9 gap-2 justify-evenly">
        <div className="row-container flex flex-col w-3/5 gap-8">
          {/* Form for admin to edit a tournament */}
          <AdminTournamentsEditForm 
            register={() => {}} 
            errors={{}} 
            tournamentData={tournamentData} 
          />
        </div>
      </div>
    );
  }
  
  export default AdministratorEditTournaments;
  