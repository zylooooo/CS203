import axios from "axios";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

// Component: Create Tournament Form
const CreateTournamentForm = ({ register, handleSubmit, errors, onSubmit }) => {

    const navigate = useNavigate();

    const handleCloseButtonClick = () => {
        // WIP: Add confirmation prompt
        navigate("/administrator-tournaments");
    }

    return (
        <>
        <div className = "edit-tournament-details p-6 rounded-lg shadow-lg w-5/12 mx-auto">
            <div className = "flex flex-row gap-8 justify-between">
                <h2 className = "text-xl font-extrabold">Create Tournament</h2>
                    <button
                    onClick={handleCloseButtonClick}
                    className="text-3xl font-bold text-gray-400 hover:text-text-grey"
                    type="button"
                >
                    &times;
                </button>
            </div>

            <form onSubmit = { handleSubmit(onSubmit) }>
                <div className="flex flex-col gap-5 mt-8">

                <div className = "flex flex-col gap-1">
                    <label htmlFor = "tournamentName" className = "block text-sm font-medium text-gray-700">
                        Tournament Name 
                    </label>
                    <input
                        className = "shadow-md rounded-xl p-2 pl-4 w-full"
                        type = "text"
                        id = "tournamentName"
                        placeholder = "Enter Tournament Name"
                        {...register("tournamentName", {
                            required: "Tournament name is required",
                            pattern: {
                                value: /^[^@#$%^&*()_+=[\]{};'"\\|,.<>?`~]*$/,
                                message: "Special characters and whitespace are not allowed"
                            }
                        })}
                        
                    />
                    <p className = "error">{errors.tournamentName?.message}</p>
                </div>


                <div className = "flex flex-col gap-1">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
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
                    <p className = "error">{errors.startDate?.message}</p>
                </div>

                <div className = "flex flex-col gap-1">
                    <label htmlFor = "venue" className = "block text-sm font-medium text-gray-700">
                        Venue
                    </label>
                    <input
                        className = "shadow-md rounded-xl p-2 pl-4 w-full"
                        type = "text"
                        id = "venue"
                        placeholder = "Enter Venue"
                        {...register("venue", { required: "Venue is required" })}
                    />
                    <p className = "error">{errors.venue?.message}</p>
                </div>

                <div className = "flex flex-col gap-1">
                    <label htmlFor = "gender" className = "block text-sm font-medium text-gray-700">
                        Gender Specification
                    </label>
                    <select
                        className = "shadow-md rounded-xl p-2 px-4 w-full"
                        id = "gender"
                        {...register("gender", { required: "Gender specification is required" })}
                    >
                        <option value = "">Select Gender</option>
                        <option value = "Male">Male</option>
                        <option value = "Female">Female</option>
                    </select>
                    <p className = "error">{errors.gender?.message}</p>
                </div>

                <div className = "flex flex-col gap-1">
                    <label
                        htmlFor = "category"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Age Category
                    </label>
                    <select
                        className = "shadow-md rounded-xl p-2 pl-4 w-full"
                        id = "category"
                        {...register("category", {
                        required: "Category is required",
                        })}
                    >
                        <option value = "">Select Category</option>
                        <option value = "U16">U16</option>
                        <option value = "U21">U21</option>
                        <option value = "Open">Open</option>
                    </select>

                    <p className = "error">{errors.category?.message}</p>
                </div>

                <div className = "flex flex-col gap-1">
                    <label
                        htmlFor = "minElo"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Elo Rating Range
                    </label>
                    <div className = "flex gap-2">
                        <input
                            className="shadow-md rounded-xl p-2 pl-4 w-full"
                            type="number"
                            id="minElo"
                            placeholder="Min Elo"
                            {...register("minElo", {
                            required: "Minimum Elo rating is required",
                        })}
                        />
                        <span>-</span>
                        <input
                            className = "shadow-md rounded-xl p-2 pl-4 w-full"
                            type = "number"
                            id = "maxElo"
                            placeholder = "Max Elo"
                            {...register("maxElo", {
                            required: "Maximum Elo rating is required",
                        })}
                        />
                    </div>
                    <p className = "error">
                        {errors.minElo?.message || errors.maxElo?.message}
                    </p>
                </div>

                <div className = "flex flex-col gap-1">
                    <label
                        htmlFor = "maxPlayers"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Max Players
                    </label>
                    <div className = "flex gap-2">
                        <input
                            className = "shadow-md rounded-xl p-2 pl-4 w-full"
                            type = "number"
                            id = "maxPlayers"
                            placeholder = "Max Players"
                            {...register("maxPlayers", {
                            required: "Maximum number of players is required",
                        })}
                        />
                    </div>
                    <p className = "error">
                        {errors.maxPlayers?.message}
                    </p>
                </div>

                <div className = "flex flex-col gap-1">
                    <label
                        htmlFor = "remarks"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Remarks
                    </label>
                    <input
                        className = "shadow-md rounded-xl p-2 pl-4 w-full"
                        type = "text"
                        id = "remarks"
                        placeholder = "Enter Remarks"
                    />
                </div>

                <div className = "flex justify-evenly gap-5 p-4">
                    <button
                        className = "font-bold border px-14 py-2 bg-primary-color--light-green text-primary-color-white hover:bg-primary-color-green"
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

CreateTournamentForm.propTypes = {
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


function AdministratorCreateTournaments() {

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();

   // API Call: Create new tournament
    async function createNewTournament(data) {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const today = new Date();

            const trimmedTournamentName = data.tournamentName.trim();

            const response = await axios.post(
                "http://localhost:8080/admins/tournaments",
                {
                    tournamentName: trimmedTournamentName,
                    createdAt: today,
                    updatedAt: today,
                    createdBy: adminData.adminName,
                    startDate: data.startDate,
                    endDate: null,
                    location: data.venue,
                    minElo: data.minElo,
                    maxElo: data.maxElo,
                    gender: data.gender,
                    playersPool: [],
                    remarks: data.remarks,
                    category: data.category,
                    playerCapacity: data.maxPlayers,
                    bracket: null
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            if (response.status === 200) {
                if (response.data.error !== undefined) {
                    alert("error: ", response.data.error);
                    
                }
                return response.data;
            }

        } catch (error) {
            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert("error ", error.response.data.error);
            console.error('Error creating tournaments:', error.response.data.error);
        }
    }

    // API Call: Check if tournament name is available
    async function checkTournamentNameAvailability(tournamentName) {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const firstResponse = await axios.get(
                `http://localhost:8080/admins/tournaments/name-availability?tournamentName=${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            console.log(firstResponse.data);
            if (firstResponse.data.isAvailable && firstResponse.status === 200) {
                return firstResponse.data.isAvailable;
            } else {
                alert("Tournament name is already taken! Please try another name.");
            }

        } catch (error) {
            // WIP: dunno how to get out the error message
            alert(error.response.data.error);
        } 
    }

    const onSubmit = async (data) => {
        const firstResponse = await checkTournamentNameAvailability(data.tournamentName);

        if (firstResponse === true) {
            const response = await createNewTournament(data);

            if (response !== undefined) {
                alert("Tournament successfully created!");
                setTimeout(() => {
                    navigate("/administrator-tournaments");
                }, 300);
            }
        }
    }

    return (
        <>
        <div className="create-tournament-page main-container flex p-9 gap-2 justify-evenly h-main overflow-auto">
            <div className="row-container flex flex-col w-full gap-8">

                <CreateTournamentForm register = {register} handleSubmit = {handleSubmit} errors = {errors} onSubmit = {onSubmit} />

            </div>
        </div>
        </>
    );
}

export default AdministratorCreateTournaments;