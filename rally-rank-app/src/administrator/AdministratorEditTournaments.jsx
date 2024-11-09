// Config imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


function AdministratorEditTournaments() {
    const navigate = useNavigate();
    const location = useLocation();
    const tournamentName = location.state || {};
    const [isChanged, setIsChanged] = useState(false);
    const [newPlayersPool, setNewPlayersPool] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [originalTournamentInformation, setOriginalTournamentInformation] = useState({});
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

    // ----------------------- API Call: Retrieving the tournament details by the tournament name -----------------------
    async function getTournamentByName() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            }
            const response = await axios.get(
                `${API_URL}/admins/tournaments/${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            if (response.status === 200) {
                setOriginalTournamentInformation(response.data);
                for (const key in response.data) {
                    setValue(key, "");
                }
            }
        } catch (error) {
            console.error("Error fetching tournament:", error.response.data.error);
            setOriginalTournamentInformation(null);
        }
    };

    // ----------------------- API Call: Deleting the tournament by the tourmanent name -----------------------
    async function deleteTournament() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            }

            const response = await axios.delete(
                `${API_URL}/admins/tournaments/${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            console.log(response.data);
            if (response.status === 200) {
                alert("Tournament deleted successfully");
                navigate("/administrator-tournaments");
            }

        } catch (error) {
            console.error("Error deleting tournament:", error.response.data.error);
        }
    };

    // ----------------------- API Call: Retrieving the players who fit the criteria to join a tournament by the tourmanent name -----------------------
    async function getAvailablePlayers() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            }
    
            const response = await axios.get(
                `${API_URL}/admins/tournaments/${tournamentName}/available-users`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            if (response.status === 200) {
                setAvailablePlayers(response.data);
            }
        } catch (error) {
            console.error("Error fetching players:", error.response.data.error);
            setAvailablePlayers(null);
        }
    };

    // ----------------------- API Call: Updating the tournament details -----------------------
    async function updateTournament(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }
            
            const response = await axios.put(
                `${API_URL}/admins/tournaments/${tournamentName}`,
                {
                    ...originalTournamentInformation,
                    tournamentName: formData.tournamentName || originalTournamentInformation.tournamentName,
                    startDate: formData.startDate || originalTournamentInformation.startDate,
                    location: formData.location || originalTournamentInformation.location,
                    minElo: formData.minElo || originalTournamentInformation.minElo,
                    maxElo: formData.maxElo || originalTournamentInformation.maxElo,
                    playersPool: newPlayersPool || originalTournamentInformation.playersPool,
                    gender: formData.gender || originalTournamentInformation.gender,
                    remarks: formData.remarks || originalTournamentInformation.remarks,
                    category: formData.category || originalTournamentInformation.category,
                    playerCapacity: formData.playerCapacity || originalTournamentInformation.playerCapacity,
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            if (response.status === 200) {
                return response.data;
            }

        } catch (error) {
            console.error("Error updating tournament: ", error.response.data.error);
        }
    };

    const addPlayerToTournament = async (player) => {
        try {
            const updatedPlayers = [...newPlayersPool, player.username];
            setNewPlayersPool(updatedPlayers);
            
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT token found");
                return;
            }

            const response = await axios.put(
                `${API_URL}/admins/tournaments/${tournamentName}/add-players`,
                updatedPlayers,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );
    
            if (response.status === 200) {
                alert("Added player successfully");
            }
    
        } catch (error) {
            if (error.response) {
                console.error("Error adding player:", error.response.data.error);
            } else {
                console.error("Error adding player:", error.message);
            }
        }
    };
    
    const onSubmit = async (formData) => {
        const updatedTournamentData = {
                ...originalTournamentInformation,
                tournamentName: formData.tournamentName || originalTournamentInformation.tournamentName,
                startDate: formData.startDate || originalTournamentInformation.startDate,
                location: formData.location || originalTournamentInformation.location,
                minElo: formData.minElo || originalTournamentInformation.minElo,
                maxElo: formData.maxElo || originalTournamentInformation.maxElo,
                playersPool: newPlayersPool || originalTournamentInformation.playersPool,
                gender: formData.gender || originalTournamentInformation.gender,
                remarks: formData.remarks || originalTournamentInformation.remarks,
                category: formData.category || originalTournamentInformation.category,
                playerCapacity: formData.playerCapacity || originalTournamentInformation.playerCapacity,
        };
        await updateTournament(updatedTournamentData);
        navigate("/administrator-tournaments")
    };

    const handleBackButtonClick = () => {
        navigate("/administrator-tournaments")
    };

    const handleChange = () => {
        const formValues = getValues();
        const hasChanges = Object.keys(formValues).some((key) => {
            return formValues[key] !== originalTournamentInformation[key] && formValues[key] !== "";
        });
        setIsChanged(hasChanges);
    };

    // ----------------------- useEffect() -----------------------
    useEffect(() => {
        getTournamentByName(tournamentName);
        getAvailablePlayers();
    }, []);

    return (
        <div className = "mt-5 edit-profile-information p-6 bg-white rounded-lg w-3/5 mx-auto">
            <div className = "flex items-center gap-4">
                <FontAwesomeIcon
                    icon = {faArrowLeft}
                    onClick = {handleBackButtonClick}
                    className = "back-icon cursor-pointer text-xl"
                />
                <h2 className = "text-xl font-bold mb-4 mt-3"> Edit Tournaments </h2>
            </div>
            <form onSubmit = {handleSubmit(onSubmit)} className = "grid grid-cols-1 gap-4">
                {/* SAVE CHANGES BUTTON */}
                <div className = "flex justify-end mt-4 mb-3">
                    <button
                        type = "submit"
                        className = {`rounded-lg border w-1/3 py-2 px-4 text-md font-semibold text-white
                                    ${isChanged ? "bg-primary-color-green" : "bg-gray-300"}`}
                        disabled = {!isChanged}
                    >
                        Save Changes
                    </button>
                </div>
                {/* TOURNAMENT NAME */}
                <div className = "mt-2">
                    <label
                        htmlFor = "tournamentName"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-6"
                    >
                        Tournament Name
                    </label>
                    <input
                        type = "text"
                        id = "tournamentName"
                        placeholder =   {originalTournamentInformation.tournamentName || ""}
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("tournamentName", { onChange: handleChange })}
                    />
                </div>
                {/* START DATE */}
                <div className = "mt-5">
                    <label
                        htmlFor = "startDate"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                    >
                        Tournament Start Date
                    </label>
                    <input
                        type = "date"
                        id = "startDate"
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("startDate", { onChange: handleChange })}
                    />
                </div>
                {/* LOCATION */}
                <div className = "mt-2">
                    <label
                        htmlFor = "location"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-6"
                    >
                        Location
                    </label>
                    <input
                        type = "text"
                        id = "location"
                        placeholder = {originalTournamentInformation.location || ""}
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("location", { onChange: handleChange })}
                    />
                </div>
                {/* MIN ELO */}
                <div className = "mt-5">
                    <label
                        htmlFor = "minElo"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                    >
                        Minimum Elo Rating
                    </label>
                    <input
                        type = "number"
                        id = "minElo"
                        placeholder = {originalTournamentInformation.minElo || ""}
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("minElo", { onChange: handleChange })}
                    />
                </div>
                {/* MAX ELO */}
                <div className = "mt-5">
                    <label
                        htmlFor = "maxElo"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                    >
                        Maximum Elo Rating
                    </label>
                    <input
                        type = "number"
                        id = "maxElo"
                        placeholder = {originalTournamentInformation.maxElo || ""}
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("maxElo", { onChange: handleChange })}
                    />
                </div>
                {/* TOURNAMENT GENDER */}
                <div className = "mt-5">
                    <label
                        htmlFor = "gender"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                    >
                        Tournament Gender
                    </label>
                    <select
                        id = "gender"
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3 mb-4"
                        style = {{ backgroundColor: "#EBEBEB", paddingRight: "2rem" }}
                        {...register("gender", { onChange: handleChange })}
                    >
                        <option value = ""> Select your gender </option>
                        <option value = "Male"> Male </option>
                        <option value = "Female"> Female </option>
                    </select> 
                </div>
                {/* GAME CATEGORY */}
                <div className = "mt-5">
                    <label
                        htmlFor = "category"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                    >
                        Game Category:
                    </label>
                    <select
                        id = "category"
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3 mb-4"
                        style = {{ backgroundColor: "#EBEBEB", paddingRight: "2rem" }}
                        {...register("category", { onChange: handleChange })}
                    >
                        <option value = ""> Select the game/age category </option>
                        <option value = "U16"> U16 </option>
                        <option value = "U21"> U21 </option>
                        <option value = "Open"> Open </option>
                    </select> 
                </div>
                {/* REMARKS */}
                <div className = "mt-2">
                    <label
                        htmlFor = "remarks"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-6"
                    >
                        Remarks
                    </label>
                    <input
                        type = "text"
                        id = "remarks"
                        placeholder = {originalTournamentInformation.remarks || ""}
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("remarks", { onChange: handleChange })}
                    />
                </div>
                {/* PLAYER CAPACITY */}
                <div className = "mt-5">
                    <label
                        htmlFor = "playerCapacity"
                        className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                    >
                        Player Capacity
                    </label>
                    <input
                        type = "number"
                        id = "playerCapacity"
                        placeholder = {originalTournamentInformation.playerCapacity || ""}
                        className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                        style = {{ backgroundColor: "#EBEBEB" }}
                        {...register("playerCapacity", { onChange: handleChange })}
                    />
                </div>
            </form>
            <div className = "mt-6">
                {/* Current Player Pool */}
                <div className = "bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                    <h2 className = "text-xl font-bold text-gray-800 mb-4"> Current Player Pool </h2>
                    {originalTournamentInformation.playersPool && originalTournamentInformation.playersPool.length > 0 ? (
                        <ol className = "list-decimal pl-5 space-y-3">
                            {originalTournamentInformation.playersPool.map((player, index) => (
                                <li key = {index} className = "text-lg font-medium text-gray-700">
                                    {player}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className = "text-gray-600"> No players have joined this tournament yet. </p>
                    )}
                </div>
                <div className = "mt-6">
                    {/* Available Player Pool */}
                    <div className = "bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                        <h2 className = "text-xl font-bold text-gray-800 mb-4"> Available Players </h2>
                        {availablePlayers?.length ? (
                            <ul className = "space-y-4">
                                {availablePlayers.map((player, index) => (
                                    <li
                                        key = {index}
                                        className = "flex items-center justify-between p-4 rounded-lg bg-gray-50 shadow-sm hover:bg-gray-100 transition-all duration-200"
                                    >
                                    <div>
                                        <span className = "text-xl font-medium text-gray-800"> {player.firstName} {player.lastName} </span>
                                        <div className = "text-sm text-gray-500"> {player.username} </div>
                                    </div>
                                    <button
                                        className = "bg-primary-color-green text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-primary-color-dark-green transition-colors duration-300"
                                        onClick = {() => addPlayerToTournament(player)}
                                    >
                                        Add
                                    </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className = "text-sm text-gray-500"> No available players at the moment. </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdministratorEditTournaments;