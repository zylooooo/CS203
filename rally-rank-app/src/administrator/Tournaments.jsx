import React from "react";

const AdminTournamentForm = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Create Tournament</h2>
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
            placeholder="Start Date"
            {...register("startDate", { required: "Start date is required" })}
          />
          <span>-</span>
          <input
            className="border p-2 w-full"
            type="date"
            id="endDate"
            placeholder="End Date"
            {...register("endDate", { required: "End date is required" })}
          />
        </div>
        <p className="error">{errors.startDate?.message || errors.endDate?.message}</p>
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
            {...register("minAge", { required: "Minimum age is required" })}
          />
          <span>-</span>
          <input
            className="border p-2 w-full"
            type="number"
            id="maxAge"
            placeholder="Max Age"
            {...register("maxAge", { required: "Maximum age is required" })}
          />
        </div>
        <p className="error">{errors.minAge?.message || errors.maxAge?.message}</p>
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
            {...register("minElo", { required: "Minimum Elo rating is required" })}
          />
          <span>-</span>
          <input
            className="border p-2 w-full"
            type="number"
            id="maxElo"
            placeholder="Max Elo"
            {...register("maxElo", { required: "Maximum Elo rating is required" })}
          />
        </div>
        <p className="error">{errors.minElo?.message || errors.maxElo?.message}</p>
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
            {...register("minPlayers", { required: "Minimum number of players is required" })}
          />
          <span>-</span>
          <input
            className="border p-2 w-full"
            type="number"
            id="maxPlayers"
            placeholder="Max Players"
            {...register("maxPlayers", { required: "Maximum number of players is required" })}
          />
        </div>
        <p className="error">{errors.minPlayers?.message || errors.maxPlayers?.message}</p>
      </div>
    </div>
  </div>
);

const UserTournaments = () => {
  return (
    <div className="tournaments-page flex w-full p-9 gap-2 justify-evenly">
      <div className="row-container flex flex-col w-3/5 gap-8">
        {/* Form for admin to create a tournament */}
        <AdminTournamentForm register={() => {}} errors={{}} />
      </div>
    </div>
  );
};

export default UserTournaments;

