import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Component: Create Tournament Form
const AdministratorCreateTournamentForm = ({ register, handleSubmit, errors, onSubmit, getValues }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className = "create-tournament-card p-6 rounded-[12px] shadow-xl w-3/5 mx-auto mb-28">
                <div className = "flex flex-row gap-8 justify-between">
                    <h2 className = "text-xl font-bold mt-5"> Create Tournament </h2>
                        <button
                            onClick = {() => navigate("administrator-tournaments")}
                            className = "text-3xl font-bold text-gray-400 hover:text-text-grey"
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
                                className = "shadow-md rounded-xl p-2 pl-4 w-full"
                                type = "text"
                                id = "tournamentName"
                                placeholder = "Enter tournament name"
                                {...register("tournamentName", {
                                    required: "Tournament name is required",
                                    pattern: {
                                        value: /^[^/@#$%^&*()_+=[\]{};'"\\|,.<>?`~]*$/,
                                        message: "Special characters and whitespace are not allowed"
                                    }
                                })}
                                
                            />
                            <p className = "error mt-1"> {errors.tournamentName?.message} </p>
                        </div>

                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "startDate"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Start Date
                            </label>
                            <div className = "flex gap-2">
                                <input
                                    className = "shadow-md rounded-xl p-2 pl-4 w-full"
                                    type = "date"
                                    id = "startDate"
                                    placeholder = "Start Date"
                                    {...register("startDate", { required: "Start date is required" })}
                                />
                            </div>
                            <p className = "error mt-1"> {errors.startDate?.message} </p>
                        </div>
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "venue"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Venue
                            </label>
                            <input
                                className = "shadow-md rounded-xl p-2 pl-4 w-full"
                                type = "text"
                                id = "venue"
                                placeholder = "Enter tournament venue"
                                {...register("venue", { required: "Venue is required" })}
                            />
                            <p className = "error mt-1"> {errors.venue?.message} </p>
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
                                        className = "rounded-xl p-2 px-4" 
                                        style = {{ width: 'calc(100% - 12px)' }}
                                        id = "gender"
                                        {...register("gender", { required: "Gender specification is required" })}
                                    >
                                        <option value = ""> Select Gender </option>
                                        <option value = "Male"> Male </option>
                                        <option value = "Female"> Female </option>
                                    </select>
                                </div>
                                <p className = "error mt-1"> {errors.gender?.message} </p>
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
                                        className = "rounded-xl p-2 pl-4 w-full"
                                        style = {{ width: 'calc(100% - 12px)' }}
                                        id = "category"
                                        {...register("category", { required: "Category is required" })}
                                    >
                                        <option value = ""> Select Category </option>
                                        <option value = "U16"> U16 </option>
                                        <option value = "U21"> U21 </option>
                                        <option value = "Open"> Open </option>
                                    </select>
                                </div>
                                <p className = "error mt-1"> {errors.category?.message} </p>
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
                                    className = "shadow-md rounded-xl p-2 pl-4 w-full"
                                    type = "number"
                                    id = "minElo"
                                    placeholder="Minimum Elo"
                                    {...register("minElo", { required: "Minimum Elo rating is required" })}
                                />
                                <span className = "text-center font-semibold"> to </span>
                                <input
                                    className = "shadow-md rounded-xl p-2 pl-4 w-full"
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
                            <p className = "error mt-1"> {errors.minElo?.message || errors.maxElo?.message} </p>
                        </div>
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "maxPlayers"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Max Players
                            </label>
                            <div className = "flex gap-2">
                                <input
                                    className = "shadow-md rounded-xl p-2 pl-4 w-full"
                                    type = "number"
                                    id = "maxPlayers"
                                    placeholder = "Enter the maximum player capacity"
                                    {...register("maxPlayers", { required: "Maximum number of players is required" })}
                                />
                            </div>
                            <p className = "error mt-1"> {errors.maxPlayers?.message} </p>
                        </div>
                        <div className = "flex flex-col gap-1">
                            <label
                                htmlFor = "remarks"
                                className = "block text-md font-semibold mb-2 ml-3"
                            >
                                Remarks
                            </label>
                            <input
                                className = "shadow-md rounded-xl p-2 pl-4 w-full"
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