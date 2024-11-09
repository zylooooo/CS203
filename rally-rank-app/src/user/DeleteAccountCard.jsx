import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';


const DeleteAccountCard = ({ setShowDeleteAccountCard }) => {

    const navigate = useNavigate();

    const { logoutUser } = useAuth();

    // ----------------------- API Call: Deleting the user's profile -----------------------
    async function deleteUserProfile() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const response = await axios.delete(
                "http://localhost:8080/users/profile",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                }
            );

            if (response.status === 204) {
                localStorage.removeItem('userData');
                logoutUser();
                alert("Account successfully deleted.");
                navigate("/auth/user-login");
                setShowDeleteAccountCard(false);
            } else {
                alert("Error deleteing account.");
            }


        } catch (error) {
            console.error("Error deleting user profile: ", error);
        }
    }

    const handleConfirmClick = async () => {
        await deleteUserProfile();
    }

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "flex flex-col bg-white p-8 rounded-lg shadow-lg max-w-1/2">
                <h2 className = "text-xl font-bold mb-5">Are you sure you want to delete your account?</h2>
                <p className = "text-sm"><strong>You will be removed from all future and ongoing tournaments.</strong></p>
                <p className = "text-md text-secondary-color-red mb-10"><strong>This action is irreversible.</strong></p>
                <div className = "flex justify-between">
                    {/* CANCEL */}
                <button
                    type = "button"
                    onClick = {() => setShowDeleteAccountCard(false)}
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

export default DeleteAccountCard;

