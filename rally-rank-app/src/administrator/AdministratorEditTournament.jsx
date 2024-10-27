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
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getTournamentByName();
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
                updatedAt: today,
                createdBy: adminData.adminName,
            };
            const response = await axios.put(
                `http://localhost:8080/admins/tournaments/edit-${tournament.tournamentName}`,
                updatedTournamentDetails,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating tournament:", error.response?.data?.error || error.message);
        }
    };

    const onSubmit = (data) => {
        updateTournament(data);
        // Success Message
        navigate(`/administrator/tournament-details/${tournamentName}`, { state: { tournamentName } });
    };

    const handleCloseButton = () => {
        navigate("/administrator-tournaments");
    };

    const handleChange = () => {
        setIsChanged(true);
    };

    return (
        <div className = "tournaments-page main-container flex w-full p-9 gap-2 justify-evenly h-screen-minus-navbar overflow-auto">
            <div className = "row-container flex flex-col w-full gap-8">
                <div className = "mt-5 edit-tournament-details p-6 card-background rounded-[20px] shadow-md w-3/5 mx-auto">
                    <form onSubmit = {handleSubmit(onSubmit)}>
                        <div className = "flex justify-between items-center mb-5">
                            <h2 className = "text-xl font-extrabold"> Edit Tournament </h2>
                            {/* CLOSE BUTTON */}
                            <button
                                onClick = {handleCloseButton}
                                className = "text-3xl font-bold text-gray-500 hover:text-gray-800"
                                type = "button"
                            >
                                &times;
                            </button>
                        </div>
                        <div className = "flex flex-col gap-5 mt-8">
                            {/* TOURNAMENT NAME */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "tournamentName"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Tournament Name
                                </label>
                                <input
                                    className = "border2 p-2 w-full"
                                    type = "text"
                                    id = "tournamentName"
                                    {...register("tournamentName", { onChange: handleChange })}
                                />
                            </div>
                            {/* TOURNAMENT START DATE */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "startDate"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Start Date
                                </label>
                                <input
                                    className = "border2 p-2 w-full"
                                    type = "date"
                                    id = "startDate"
                                    {...register("startDate", { onChange: handleChange })}
                                />
                            </div>
                            {/* TOURNAMENT VENUE */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "venue"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Venue
                                </label>
                                <input
                                    className = "border2 p-2 w-full"
                                    type = "text"
                                    id = "venue"
                                    {...register("location", { onChange: handleChange })}
                                />
                            </div>
                            {/* TOURNAMENT GENDER SPECIFICATION */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "gender"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Gender Specification
                                </label>
                                <select
                                    className = "border2 p-2 w-full"
                                    id = "gender"
                                    {...register("gender", { onChange: handleChange })}
                                >
                                    <option value = ""> Select Gender </option>
                                    <option value = "Male"> Male </option>
                                    <option value = "Female"> Female </option>
                                </select>
                            </div>
                            {/* TOURNAMENT AGE CATEGORY */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "category"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Age Category
                                </label>
                                <select
                                    className = "border2 p-2 w-full"
                                    id = "category"
                                    {...register("category", { onChange: handleChange })}
                                >
                                    <option value = ""> Select Tournament Category </option>
                                    <option value = "U16"> U16 </option>
                                    <option value = "U21"> U21 </option>
                                    <option value = "Open">Open</option>
                                </select>
                            </div>
                            {/* TOURNAMENT ELO RATING RANGE */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "minElo"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Elo Rating Range
                                </label>
                                <div className = "flex gap-2">
                                    <input
                                        className = "border2 p-2 w-full"
                                        type = "number"
                                        id = "minElo"
                                        {...register("minElo", { onChange: handleChange })}
                                    />
                                    <span> to </span>
                                    <input
                                        className = "border2 p-2 w-full"
                                        type = "number"
                                        id = "maxElo"
                                        {...register("maxElo", { onChange: handleChange })}
                                    />
                                </div>
                            </div>
                            {/* PLAYER CAPACITY */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "maxPlayers"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Max Players
                                </label>
                                <input
                                    className="border2 p-2 w-full"
                                    type="number"
                                    id="maxPlayers"
                                    {...register("playerCapacity", { onChange: handleChange })}
                                />
                            </div>
                            {/* TOURNAMENT REMARKS */}
                            <div className = "flex flex-col gap-1">
                                <label
                                    htmlFor = "remarks"
                                    className = "block text-sm font-medium text-gray-700"
                                >
                                    Remarks
                                </label>
                                <textarea
                                    className = "border2 p-2 w-full"
                                    id = "remarks"
                                    {...register("remarks", { onChange: handleChange })}
                                />
                            </div>
                            <button
                                type = "submit"
                                style = {{
                                    marginTop: '1.25rem',
                                    padding: '0.5rem',
                                    color: 'white',
                                    backgroundColor: isChanged ? 'green' : 'grey',
                                    opacity: isChanged ? 1 : 0.5,
                                    cursor: isChanged ? 'pointer' : 'not-allowed',
                                    display: 'block',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}
                                className="w-1/4 rounded-[20px]"
                                disabled={!isChanged}
                            >
                                Update Tournament
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdministratorEditTournament;