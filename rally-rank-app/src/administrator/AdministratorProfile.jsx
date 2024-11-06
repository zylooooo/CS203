// Package Imports
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Icons Imports
import { FaPen } from "react-icons/fa";

function AdministratorProfile() {
    const navigate = useNavigate();

    const [adminProfileInformation, setAdminProfileInformation] = useState({});

    const handleEditProfileClick = () => {
        navigate("/administrator-account/edit", { state: { adminProfileInformation: adminProfileInformation } });
    };

    // ----------------------- API Call: Retrieving the admin's profile data -----------------------
    async function getAdminProfile() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/admins/profile",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                }
            );

            setAdminProfileInformation(response.data);

        } catch (error) {
            console.error("Error fetching admin profile: ", error);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getAdminProfile();
    }, []);

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

            console.log(response.data);

            // WIP: DOUBLE CHECK BACKEND RESPONSE
            return response.data;

        } catch (error) {
            console.error("Error deleting admin profile: ", error);
        }
    }

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const ConfirmDeleteCard = () => {
        return (
            <div className = "fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                <div className = "flex flex-col gap-5 bg-primary-color-white p-8 rounded-lg shadow-lg">
                    <h2 className = "text-xl font-bold">Are you sure you want to delete your account?</h2>
                    <p className = "text-md text-red-color"><strong>This action is irreversible.</strong></p>
                    <div className = "flex justify-between">
                        {/* CANCEL */}
                    <button
                        type = "button"
                        onClick = {() => setIsConfirmDeleteOpen(false)}
                        className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>

                    {/* SUBMIT */}
                    <button
                        type = "submit"
                        onClick = {handleConfirmDeleteClick}
                        className = "shadow-md px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Confirm
                    </button>
                </div>
                </div>
            </div>
        );
    }

    const handleDeleteClick = () => {
        setIsConfirmDeleteOpen(true);
    }

    const handleConfirmDeleteClick = async () => {
        const response = await deleteAdminProfile();
        if (response.status === 200) {
            localStorage.removeItem('adminData');
            alert(response.message);
            setIsConfirmDeleteOpen(false);
        }
    }

    return (
        <div className = "h-main flex flex-col items-center w-full">
            <div className = "container w-3/5 mx-auto my-10 p-6 bg-white shadow-md rounded-[8px] relative">
                <button
                    className = "absolute top-4 right-4 p-2 bg-gray-200 rounded-[20px] hover:bg-gray-300 border mr-5 mt-5"
                    onClick = {handleEditProfileClick}
                    aria-label = "Edit Profile"
                >
                    <div className = "flex gap-3">
                        <FaPen className = "text-sm mt-1 ml-1" style = {{ color: "#222222" }}/>
                        <p className = "text-sm font-semibold"> Edit Profile </p>
                    </div>
                </button>
                {adminProfileInformation && (
                    <>
                        <div className = "flex items-center mb-6">
                            <img
                                src = {"https://via.placeholder.com/150"}
                                alt = "Profile Picture"
                                className = "rounded-full h-32 w-32 object-cover border-4"
                            />
                            <div className = "flex flex-col ml-6 mt-3">
                                <h2 className = "text-3xl font-bold">
                                    {adminProfileInformation.firstName} {adminProfileInformation.lastName}
                                </h2>
                                <div className = "flex flex-col mt-5">
                                    <p><strong> @{adminProfileInformation.adminName} </strong></p>
                                    <p className = "text-sm"> Players see this name when signing up for your tournaments.</p>
                                </div>
                            </div>
                        </div>

                        <div className = "p-4 ">
                            <p className = "mt-4 text-sm">
                                <strong> Email Address: </strong> {adminProfileInformation.email}
                            </p>
                        </div>

                    </>
                )}

            </div>

            {/* DELETE ACCOUNT BUTTON */}
            <div className = "w-3/5 mx-auto flex justify-end">
                <button
                onClick = { handleDeleteClick }
                className = "font-semibold py-2 px-4 rounded-lg shadow-md text-sm text-primary-color-white hover:shadow-md transition duration-300 ease-in-out"
                style = {{ backgroundColor: "#FF6961"}}
                >
                    Delete Account
                </button>
            </div>

            {isConfirmDeleteOpen && <ConfirmDeleteCard />}

        </div>
    );
};

export default AdministratorProfile;