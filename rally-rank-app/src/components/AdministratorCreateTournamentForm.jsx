// Package Imports
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const AdministratorCreateTournamentForm = ({ register, handleSubmit, errors, onSubmit, getValues }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className = "create-tournament-card p-6 rounded-[12px] shadow-xl w-3/5 mx-auto mb-28">
                <div className = "flex flex-row gap-8 justify-between">
                    <h2 className = "text-2xl font-bold mt-5 ml-3"> Create Tournament Form </h2>
                        <button
                            onClick = {() => navigate("/administrator-tournaments")}
                            className = "text-4xl font-bold text-gray-400 hover:text-text-grey"
                            type = "button"
                    >
                        &times;
                    </button>
                </div>
                <form onSubmit = {handleSubmit(onSubmit)}>
                    <div className = "flex flex-col gap-5 mt-8">
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "tournamentName"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Tournament Name
                            </label>
                            <input
                                className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                style = {{ backgroundColor: "#EBEBEB" }}
                                type = "text"
                                id = "tournamentName"
                                placeholder = "Enter tournament name"
                                {...register("tournamentName", {
                                    required: "Tournament name is required",
                                    pattern: {
                                        value: /^[^/@#$%^&*()_+=[\]{};'"\\|,.<>?`~]*$/,
                                        message: "Special characters and leading or trailing whitespaces are not allowed"
                                    }
                                })}
                                
                            />
                            <p className = "error mt-1 ml-2"> {errors.tournamentName?.message} </p>
                        </div>
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "venue"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Venue
                            </label>
                            <input
                                className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                style = {{ backgroundColor: "#EBEBEB" }}
                                type = "text"
                                id = "venue"
                                placeholder = "Enter tournament venue"
                                {...register("venue", { required: "Venue is required" })}
                            />
                            <p className = "error mt-1 ml-2"> {errors.venue?.message} </p>
                        </div>
                        <div className = "flex flex-row gap-6 w-full">
                            <div className = "flex flex-col gap-1 w-1/2">
                                <label
                                    htmlFor = "startDate"
                                    className = "block text-md font-semibold mb-2 ml-3"
                                >
                                    Start Date
                                </label>
                                <div className = "flex gap-2">
                                    <input
                                        className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                        style = {{ backgroundColor: "#EBEBEB" }}
                                        type = "date"
                                        id = "startDate"
                                        placeholder = "Start Date"
                                        {...register("startDate", { required: "Start date is required" })}
                                    />
                                </div>
                                <p className = "error mt-1 ml-2"> {errors.startDate?.message} </p>
                            </div>
                            <div className = "flex flex-col gap-1 w-1/2">
                                <label
                                    htmlFor = "maxPlayers"
                                    className = "block text-md font-semibold mb-2 ml-3"
                                >
                                    Max Players
                                </label>
                                <div className = "flex gap-2">
                                    <input
                                        className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                        style = {{ backgroundColor: "#EBEBEB" }}
                                        type = "number"
                                        id = "maxPlayers"
                                        placeholder = "Enter the maximum player capacity"
                                        {...register("maxPlayers", { required: "Maximum number of players is required" })}
                                    />
                                </div>
                                <p className = "error mt-1 ml-2"> {errors.maxPlayers?.message} </p>
                            </div>
                        </div>
                        <div className = "flex flex-row gap-6 w-full">
                            <div className = "flex flex-col gap-1 w-1/2">
                                <label
                                    htmlFor = "gender"
                                    className = "block text-md font-semibold mb-2 ml-3"
                                >
                                    Gender Specification
                                </label>
                                <div className = "shadow-md rounded-xl bg-white w-full">
                                    <select
                                        className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                        style = {{ backgroundColor: "#EBEBEB" }}
                                        id = "gender"
                                        {...register("gender", { required: "Gender specification is required" })}
                                    >
                                        <option value = ""> Select Gender </option>
                                        <option value = "Male"> Male </option>
                                        <option value = "Female"> Female </option>
                                    </select>
                                </div>
                                <p className = "error mt-1 ml-2"> {errors.gender?.message} </p>
                            </div>
                            <div className = "flex flex-col gap-1 w-1/2">
                                <label
                                    htmlFor = "category"
                                    className = "block text-md font-semibold mb-2 ml-3"
                                >
                                    Age Category
                                </label>
                                <div className = "shadow-md rounded-xl bg-white w-full">
                                    <select
                                        className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                        style = {{ backgroundColor: "#EBEBEB" }}
                                        id = "category"
                                        {...register("category", { required: "Category is required" })}
                                    >
                                        <option value = ""> Select Category </option>
                                        <option value = "U16"> U16 </option>
                                        <option value = "U21"> U21 </option>
                                        <option value = "Open"> Open </option>
                                    </select>
                                </div>
                                <p className = "error mt-1 ml-2"> {errors.category?.message} </p>
                            </div>
                        </div>
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "minElo"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Elo Rating Range
                            </label>
                            <div className = "flex gap-2 items-center">
                                <input
                                    className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                    style = {{ backgroundColor: "#EBEBEB" }}
                                    type = "number"
                                    id = "minElo"
                                    placeholder="Minimum Elo"
                                    {...register("minElo", { required: "Minimum Elo rating is required" })}
                                />
                                <span className = "text-center font-semibold"> to </span>
                                <input
                                    className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                    style = {{ backgroundColor: "#EBEBEB" }}
                                    type = "number"
                                    id = "maxElo"
                                    placeholder = "Maximum Elo"
                                    {...register("maxElo", {
                                        required: "Maximum Elo rating is required",
                                        validate: (value) =>
                                            parseInt(value) > parseInt(getValues("minElo")) ||
                                            "Maximum Elo must be greater than Minimum Elo",
                                    })}
                                />
                            </div>
                            <p className = "error mt-1 ml-2"> {errors.minElo?.message || errors.maxElo?.message} </p>
                        </div>
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "remarks"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Remarks
                            </label>
                            <input
                                className = "block w-full rounded-[12px] p-3 text-md font-semibold"
                                style = {{ backgroundColor: "#EBEBEB" }}
                                type = "text"
                                id = "remarks"
                                placeholder = "Enter remarks (optional)"
                                {...register("remarks")}
                            />
                        </div>
                        <div className = "flex justify-evenly gap-5 p-4">
                            <button
                                className = "font-bold border px-14 py-2 bg-primary-color-light-green text-white hover:bg-primary-color-green"
                                type = "submit"
                            >
                                Create Tournament
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

AdministratorCreateTournamentForm.propTypes = {
    register: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        tournamentName: PropTypes.object,
        startDate: PropTypes.object,
        venue: PropTypes.object,
        gender: PropTypes.object,
        category: PropTypes.object,
        minElo: PropTypes.object,
        maxElo: PropTypes.object,
    }).isRequired,
};

export default AdministratorCreateTournamentForm;