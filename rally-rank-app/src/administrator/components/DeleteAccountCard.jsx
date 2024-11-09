import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authentication/AuthContext';


const DeleteAccountCard = ({ setShowDeleteAccountCard }) => {

    const navigate = useNavigate();

    const { logoutAdmin } = useAuth();

    // -------------------------- API Call: Delete Admin's Account ---------------------------
    async function deleteAdminProfile() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.delete(
                "http://localhost:8080/admins/profile",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );

            if (response.status === 200) {
                localStorage.removeItem('adminData');
                logoutAdmin();
                alert(response.data.message);
                navigate("/administrator-login");
                setShowDeleteAccountCard(false);
            } else {
                alert("Error deleteing account: ", response.data.message);
            }

        } catch (error) {
            console.error("Error deleting admin profile: ", error);
        }
    }

    const handleConfirmClick = async () => {
        await deleteAdminProfile();
    }

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "flex flex-col bg-white p-8 rounded-lg shadow-lg max-w-1/2">
                <h2 className = "text-xl font-bold mb-5">Are you sure you want to delete your account?</h2>
                <p className = "text-md"> All ongoing and future tournaments you have created will be deleted permanently.</p>
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

