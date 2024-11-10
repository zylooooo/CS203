// Configuration imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";

// Icons Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faPen } from '@fortawesome/free-solid-svg-icons';

function AdministratorProfile() {
    const navigate = useNavigate();
    const [myCreatedTournaments, setMyCreatedTournaments] = useState({});
    const [administratorProfileInformation, setAdministratorProfileInformation] = useState({});

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleEditProfileClick = () => {
        navigate("/administrator-account/edit", { state: { administratorProfileInformation: administratorProfileInformation } });
    };

    // ----------------------- API Call: Retrieving the administrator's profile data -----------------------
    async function getAdminProfile() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/profile`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            setAdministratorProfileInformation(response.data);

        } catch (error) {
            setWarningMessage("Unable to fetch your RallyRank administrator profile. Please try again.");
            console.error("Error fetching admin profile: ", error);
        }
    };

    // ----------------------- API Call: Retrieve all tournaments created by the administrator -----------------------
    async function getMyTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/scheduled`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            setMyCreatedTournaments(response.data);
            console.log(response.data);

        } catch (error) {
            setWarningMessage("Unable to retrieve your created tournaments.");
            setMyCreatedTournaments([]); 
        }
    };

    // ----------------------- useEffect() -----------------------
    useEffect(() => {
        getAdminProfile();
        getMyTournaments();
    }, []);

    return (
        <div className = "h-main flex flex-col items-center w-full">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <div className = "container w-3/5 mx-auto my-10 p-6 card-background shadow-md rounded-[8px] relative">
                <button
                    className = "absolute top-4 right-4 p-2 bg-gray-200 rounded-[20px] hover:bg-gray-300 border mr-5 mt-5"
                    onClick = {handleEditProfileClick}
                    aria-label = "Edit Profile"
                >
                    <div className = "flex gap-3">
                        <FontAwesomeIcon icon = {faPen} className = "text-sm mt-1 ml-1" style = {{ color: "#242424" }}/>
                        <p className = "text-sm font-semibold"> Edit Profile </p>
                    </div>
                </button>
                {administratorProfileInformation && (
                    <>
                        <div className = "flex items-center mb-6">
                            <img
                                src = {"https://via.placeholder.com/150"}
                                alt = "Profile Picture"
                                className = "rounded-full h-32 w-32 object-cover border-4"
                            />
                            <div className = "flex flex-col ml-6 mt-3">
                                <h2 className = "text-3xl font-bold">
                                    {administratorProfileInformation.firstName} {administratorProfileInformation.lastName}
                                </h2>
                                <div className = "flex flex-col mt-5">
                                    <p> <strong> @{administratorProfileInformation.adminName} </strong> </p>
                                    <p className = "text-xs"> Players see your username when signing up for your tournaments. </p>
                                </div>
                            </div>
                        </div>
                        <div className = "p-4 ">
                            <h2 className = "text-lg font-semibold"> Contact Information </h2>
                            <p className = "mt-4 text-sm">
                                <strong> Email Address: </strong> {administratorProfileInformation.email}
                            </p>
                        </div>
                    </>
                )}
            </div>
            <div className = "container w-3/5 mx-auto mt-2 mb-10 p-6 card-background shadow-md rounded-[8px] relative">
                <div className = "p-4">
                    <h2 className = "text-lg font-bold"> My Created Tournaments </h2>
                    {myCreatedTournaments && myCreatedTournaments.length > 0 ? (
                        <ol className = "mt-4 list pl-5">
                            {myCreatedTournaments.map((tournament, index) => (
                                <li key = {index} className = "mt-3 text-md flex justify-between items-center">
                                    <div>
                                        <span className = "font-semibold"> {index + 1}. </span> 
                                        <span> {tournament.tournamentName} </span>
                                    </div>
                                    <div className = "flex items-center space-x-2">
                                        <FontAwesomeIcon 
                                            icon = {faCircle} 
                                            className = {`${tournament.endDate ? 'text-gray-400' : 'text-green-500'}`}
                                            style = {{ fontSize: '8px' }}
                                        />
                                        <span className = {`text-sm font-semibold ${tournament.endDate ? 'text-gray-500' : 'text-green-500'}`}>
                                            {tournament.endDate ? 'Completed' : 'Ongoing'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className = "mt-4">
                            <p className = "text-sm text-gray-500"> You have yet to create any tournaments. Create one today! </p>
                            <div className = "mt-6 flex justify-center items-center">
                                <button
                                    className = "px-4 py-2 bg-primary-color-green text-sm font-semibold text-white rounded-[12px] hover:cursor-pointer shadow-sm w-3/4"
                                    onClick = {() => navigate("/administrator-create-tournaments")}
                                >
                                    Create Tournament
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdministratorProfile;