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

    return (
        <div className = "h-main flex flex-col items-center w-full">
            <div className = "container w-3/5 mx-auto my-10 p-6 card-background shadow-md rounded-[8px] relative">
                <button
                    className = "absolute top-4 right-4 p-2 bg-gray-200 rounded-[20px] hover:bg-gray-300 border mr-5 mt-5"
                    onClick = {handleEditProfileClick}
                    aria-label = "Edit Profile"
                >
                    <div className = "flex gap-3">
                        <FaPen className = "text-sm mt-1 ml-1" style = {{ color: "#242424" }}/>
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
        </div>
    );
};

export default AdministratorProfile;