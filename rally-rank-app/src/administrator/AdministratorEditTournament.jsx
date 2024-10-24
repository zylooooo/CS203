import axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

// Component: Admin Edit Tournament Form
const AdminEditTournamentForm = ({ register, handleSubmit, errors, onSubmit }) => {
    const location = useLocation();

    const tournamentName = location.state || {};

    const [tournament, setTournament] = useState({});

    // API Call: Retrieve tournament details by tournament name
    async function getTournamentByName() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/admins/tournaments/${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            if (response.status === 200) {
                setTournament(response.data);
            }

        } catch (error) {

            console.error('Error fetching tournament:', error);
            setTournament({});

        } 
    }

    useEffect(() => {
        getTournamentByName();
    }, []);

    return (
        <div className = "mt-5 edit-tournament-details p-6 card-background rounded-lg shadow-md w-3/5 mx-auto">
            <form onSubmit = { handleSubmit(onSubmit) }>
                <h2 className = "text-xl font-extrabold">Edit Tournament</h2>

                <div className = "flex flex-col gap-5 mt-8">

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "tournamentName" className = "block text-sm font-medium text-gray-700">Tournament Name</label>
                        <input
                            className = "border2 p-2 w-full"
                            type = "text"
                            id = "tournamentName"
                            placeholder = "Enter Tournament Name"
                            defaultValue = { tournament.tournamentName }
                            {...register("tournamentName", { required: "Tournament name is required" })}
                        />
                        <p className = "error">{ errors.tournamentName?.message }</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "startDate" className = "block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            className = "border2 p-2 w-full"
                            type = "date"
                            id = "startDate"
                            defaultValue = { tournament.startDate }
                            {...register("startDate", { required: "Start date is required" })}
                        />
                        <p className="error">{errors.startDate?.message}</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "venue" className = "block text-sm font-medium text-gray-700">Venue</label>
                        <input
                            className = "border2 p-2 w-full"
                            type = "text"
                            id = "venue"
                            defaultValue = { tournament.location }
                            {...register("venue", { required: "Venue is required" })}
                        />
                        <p className="error">{errors.venue?.message}</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "gender" className = "block text-sm font-medium text-gray-700">Gender Specification</label>
                        <select
                            className = "border2 p-2 w-full"
                            id = "gender"
                            defaultValue = { tournament.gender }
                            {...register("gender", { required: "Gender specification is required" })}
                        >
                            <option value = "">Select Gender</option>
                            <option value = "Male">Male</option>
                            <option value = "Female">Female</option>
                        </select>
                        <p className="error">{errors.gender?.message}</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "category" className = "block text-sm font-medium text-gray-700">Age Category</label>
                        <select
                            className = "border2 p-2 w-full"
                            id = "category"
                            defaultValue = { tournament.category }
                            {...register("category", { required: "Age category is required" })}
                        >
                            <option value = "">Select Category</option>
                            <option value = "U16">U16</option>
                            <option value = "U21">U21</option>
                            <option value = "Open">Open</option>
                        </select>
                        <p className="error">{errors.category?.message}</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "minElo" className = "block text-sm font-medium text-gray-700">Elo Rating Range</label>
                        <div className="flex gap-2">
                            <input
                                className = "border2 p-2 w-full"
                                type = "number"
                                id = "minElo"
                                placeholder = "Min Elo"
                                defaultValue = { tournament.minElo }
                                {...register("minElo", { required: "Minimum Elo rating is required" })}
                            />
                            <span>-</span>
                            <input
                                className = "border2 p-2 w-full"
                                type = "number"
                                id = "maxElo"
                                placeholder = "Max Elo"
                                defaultValue = { tournament.maxElo }
                                {...register("maxElo", { required: "Maximum Elo rating is required" })}
                            />
                        </div>
                        <p className="error">{errors.minElo?.message || errors.maxElo?.message}</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "maxPlayers" className = "block text-sm font-medium text-gray-700">Max Players</label>
                        <input
                            className = "border2 p-2 w-full"
                            type = "number"
                            id = "maxPlayers"
                            defaultValue = { tournament.playerCapacity }
                            {...register("maxPlayers", { required: "Maximum number of players is required" })}
                        />
                        <p className="error">{errors.maxPlayers?.message}</p>
                    </div>

                    <div className = "flex flex-col gap-1">
                        <label htmlFor = "remarks" className = "block text-sm font-medium text-gray-700">Remarks</label>
                        <input
                            className = "border2 p-2 w-full"
                            type = "text"
                            id = "remarks"
                            defaultValue = { tournament.remarks }
                        />
                    </div>

                    <div className = "flex justify-evenly gap-5 p-10">
                        <button
                            className = "font-bold border2 px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
                            type = "submit"
                        >
                            Update Tournament
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

// API Call: Update tournament details
async function updateTournament(data) {
    try {
        const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
            return;
        }

        const today = new Date();

        const response = await axios.put(
            // WIP: REPLACE WITH ACTUAL ROUTER
            "http://localhost:8080/admins/tournaments",
            {
                tournamentName: data.tournamentName,
                startDate: data.startDate,
                location: data.venue,
                gender: data.gender,
                category: data.category,
                minElo: data.minElo,
                maxElo: data.maxElo,
                playerCapacity: data.maxPlayers,
                remarks: data.remarks
            },
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${adminData.jwtToken}`
                }
            }
        );

        if (response.status === 200) {
            return response.data;
        }

    } catch (error) {
        console.error('Error updating tournament:', error);
    }
}


function AdministratorEditTournament() {

    const { register, handleSubmit, formState: { errors }} = useForm();

    const onSubmit = (data) => {
        // WIP: REPLACE WITH API CALL 
        // updateTournament(data);
        console.log("Form submitted:", data);
      };

    return (
        <div className="tournaments-page main-container flex w-full p-9 gap-2 justify-evenly h-screen-minus-navbar overflow-auto">
            <div className="row-container flex flex-col w-full gap-8">
                <AdminEditTournamentForm register = {register} handleSubmit = {handleSubmit} errors = {errors} onSubmit = {onSubmit} />
            </div>
        </div>
    );
}

export default AdministratorEditTournament;