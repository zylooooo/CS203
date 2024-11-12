// Configuration Imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// Assets and Components Imports
import AlertMessageWarning from '../components/AlertMessageWarning';
import AlertMessageSuccess from '../components/AlertMessageSuccess';
import AdministratorCreateTournamentForm from '../components/AdministratorCreateTournamentForm';

function AdministratorCreateTournaments() {
    const navigate = useNavigate();
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { register, handleSubmit, getValues, formState: { errors } } = useForm();

    // ----------------------- API Call: Creating a new tournament -----------------------
    async function createNewTournament(data) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const today = new Date();
            const trimmedTournamentName = data.tournamentName.trim();
            const newTournament = {
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
            };

            const response = await axios.post(
                `${API_URL}/admins/tournaments`,
                newTournament,
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
            setWarningMessage("Unable to create tournament. Please try again.")
            console.error('Error creating tournaments:', error.response.data.error);
        }
    };

    // ----------------------- API Call: Check if tournament name is available -----------------------
    async function checkTournamentNameAvailability(tournamentName) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const firstResponse = await axios.get(
                `${API_URL}/admins/tournaments/name-availability?tournamentName=${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            if (firstResponse.data.isAvailable && firstResponse.status === 200) {
                return firstResponse.data.isAvailable;
            } else {
                setWarningMessage("Tournament name is already taken! Try another one.")
            }

        } catch (error) {
            setWarningMessage("Unable to check tournament name availability. Please try again.");
        } 
    };

    const onSubmit = async (data) => {
        const firstResponse = await checkTournamentNameAvailability(data.tournamentName);
        if (firstResponse === true) {
            const response = await createNewTournament(data);
            if (response !== undefined) {
                setSuccessMessage("Tournament created! Redirecting...");
                setTimeout(() => {
                    navigate("/administrator-tournaments");
                }, 1000);
            }
        }
    };

    return (
        <>
            <div className = "create-tournament-page main-container flex p-9 gap-2 justify-evenly h-main overflow-auto">
                <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
                <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
                <div className = "row-container flex flex-col w-full gap-8">
                    <AdministratorCreateTournamentForm register = {register} handleSubmit = {handleSubmit} getValues = {getValues} errors = {errors} onSubmit = {onSubmit} />
                </div>
            </div>
        </>
    );
};

export default AdministratorCreateTournaments;