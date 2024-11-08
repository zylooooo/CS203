import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteTournamentCard = ({ tournamentName, setShowDeleteTournamentCard }) => {

    const navigate = useNavigate();

    // -------------------------- API Call: Delete Tournament ---------------------------
    async function deleteTournament() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.delete(
                `http://localhost:8080/admins/${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );

            console.log(response.data);
            console.log(response.status);

            if (response.status === 200) {
                alert(response.data.message);
                navigate("/administrator-tournaments");
                setShowDeleteTournamentCard(false);
            } else {
                alert("Error deleteing tournament: ", response.data.message);
            }

        } catch (error) {
            console.error("Error deleting tournament: ", error);
        }
    }

    const handleConfirmClick = async () => {
        await deleteTournament();
    }

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "flex flex-col bg-white p-8 rounded-lg shadow-lg max-w-1/2">
                <h2 className = "text-xl font-bold mb-5">Are you sure you want to delete this tournament?</h2>
                <p className = "text-md"> All current players will be removed from the tournament and any progress in the tournament will be lost.</p>
                <p className = "text-md text-secondary-color-red mb-10"><strong>This action is irreversible.</strong></p>
                <div className = "flex justify-between">
                    {/* CANCEL */}
                <button
                    type = "button"
                    onClick = {() => setShowDeleteTournamentCard(false)}
                    className = "shadow-md px-4 py-2 rounded-lg mr-2 font-semibold hover:bg-gray-300 transition"
                >
                    Cancel
                </button>

                {/* SUBMIT */}
                <button
                    type = "submit"
                    onClick = {handleConfirmClick}
                    className = "shadow-md px-4 py-2 rounded-lg font-semibold hover:bg-secondary-color-red hover:text-white transition"
                >
                    Confirm
                </button>
            </div>
            </div>
        </div>
    );
}

export default DeleteTournamentCard;

