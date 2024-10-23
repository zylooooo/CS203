import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from "axios";

const AdminTournamentsForm = ({ register, handleSubmit, errors, onSubmit }) => {
 
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            {...register("tournamentName", {
              required: "Tournament name is required",
            })}
          />
          <p className="error">{errors.tournamentName?.message}</p>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="date"
              id="startDate"
              placeholder="Start Date"
              {...register("startDate", { required: "Start date is required" })}
            />
          </div>
          <p className="error">{errors.startDate?.message}</p>
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
          </select>
          <p className="error">{errors.gender?.message}</p>
        </div>

                {/* Age Category */}
                <div className="flex flex-col gap-1">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Age Category
          </label>
          <select
            className="border p-2"
            id="category"
            {...register("category", {
              required: "Category is required",
            })}
          >
            <option value="">Select Category</option>
            <option value="U16">U16</option>
            <option value="U21">U21</option>
            <option value="Open">Open</option>
          </select>

          <p className="error">{errors.category?.message}</p>
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
            htmlFor="maxPlayers"
            className="block text-sm font-medium text-gray-700"
          >
            Max Players
          </label>
          <div className="flex gap-2">
            <input
              className="border p-2 w-full"
              type="number"
              id="maxPlayers"
              placeholder="Max Players"
              {...register("maxPlayers", {
                required: "Maximum number of players is required",
              })}
            />
          </div>
          <p className="error">
            {errors.maxPlayers?.message}
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
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-evenly gap-5 p-10">
          <button
            className="font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
            type="submit"
          >
            Create Tournament
          </button>
        </div>
      </div>
    </form>
  );
};

function AdministratorCreateTournaments() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async(data) => {
    // Handle successful form submission, e.g., call an API or update state
    console.log("Form submitted:", data);
    const response = await createTournament(data);
    if (response !== undefined) {
      alert("Successfully created!");
    }
  };

  async function createTournament(data) {
    try {
        const response = await axios.post(
            "http://localhost:8080/admins/tournaments/create",
            { 
              "tournamentName" : data.tournamentName,
              "createdBy": data.email,
              "startDate": data.startDate,
              "endDate": data.endDate,
              "location": data.venue,
              "minElo": data.minElo,
              "maxElo": data.maxElo,
              "gender": data.gender,
              "category": data.category,
              "playerCapacity": data.maxPlayers,
            },
            { withCredentials: true } 
        );

        if (response.status === 201) {
          console.log("good");

          return response.data;
        }
    } catch (error) {
      console.log(error.response.data.error);

      console.log("bad");
    }
}

  return (
    <div className="tournaments-page main-container flex w-full p-9 gap-2 justify-evenly h-screen-minus-navbar overflow-auto">
      <div className="row-container flex flex-col w-3/5 gap-8">
        {/* Form for admin to create a tournament */}
        <AdminTournamentsForm
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

export default AdministratorCreateTournaments;







