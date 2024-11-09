// Config imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Icons Imports
import { FaPen } from "react-icons/fa";

function UserProfile() {
    const navigate = useNavigate();
    const [pastTournaments, setPastTournaments] = useState([]);
    const [userProfileInformation, setUserProfileInformation] = useState([]);
    const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric"};

    const {
        email,
        phoneNumber,
        elo,
        gender,
        dateOfBirth,
        profilePic,
        username,
        firstName,
        lastName,
        available,
        strikeReports,
    } = userProfileInformation;

    // Function to calculate the proper age of the user
    function calculateAge(dob) {
        const today = new Date();
        const dateOfBirth = new Date(dob);
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDifference = today.getMonth() - dateOfBirth.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        return age;
    };

    const handleJoinTournamentClick = () => {
        navigate("/users/tournaments");
    };

    const handleEditProfileClick = () => {
        navigate("/user-profile/edit", { state: { userPersonalInformation: userProfileInformation } });
    };

    // ------------------------------------- API Call: Retrieiving user's past tournaments -------------------------------------
    async function getPastTournaments() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const response = await axios.get(
                `${API_URL}/users/tournaments/history`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            console.log(response.data);
            setPastTournaments(response.data);
        } catch (error) {
            console.error("Error fetching available tournaments: ", error);
            setPastTournaments([]);
        }
    }

    // ------------------------------------- useEffect() ------------------------------------- 
    useEffect(() => {
        getPastTournaments();
    }, []);

    // ----------------------- API Call: Retrieving the user's profile information -----------------------
    async function getUserProfile() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
                `${API_URL}/users/profile`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                }
            );
            console.log(response.data);
            setUserProfileInformation(response.data);
        } catch (error) {
            console.error("Error fetching user profile: ", error);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getUserProfile();
    }, []);

    return (
        <div className = "h-main flex flex-col items-center w-full">
            <div className = "container w-3/5 mx-auto my-10 p-6 card-background shadow-md rounded-[8px] relative">
                <button
                    className = "absolute top-4 right-4 p-2 bg-gray-200 rounded-[20px] hover:bg-gray-300 border mr-6 mt-5"
                    onClick = {handleEditProfileClick}
                    aria-label = "Edit Profile"
                >
                    <div className = "flex gap-3">
                        <FaPen className = "text-sm mt-1 ml-1" style = {{ color: "#242424" }}/>
                        <p className = "text-sm font-semibold"> Edit Profile </p>
                    </div>
                </button>
                {userProfileInformation && (
                    <>
                        <div className = "flex items-center mb-6">
                            <img
                                src = {"https://via.placeholder.com/150"}
                                alt = "Profile Picture"
                                className = "rounded-full h-32 w-32 object-cover border-4"
                            />
                            <div className = "ml-6">
                                <h2 className = "text-3xl font-bold">
                                    {firstName} {lastName}
                                </h2>
                                <p className = "mt-2 font-semibold"> @{username} </p>
                                <p className = "mt-3 text-sm">
                                    <span className = "font-semibold"> Current Availability Status: </span> {" "}
                                    <span style = {{ color: available ? "green" : "red" }}>
                                        <strong> {available ? "Available" : "Not available"} </strong>
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className = "grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* CONTACT INFORMATION */}
                            <div className = "p-4 rounded-lg shadow-sm">
                                <h3 className = "font-semibold"> Contact Information </h3>
                                <p className = "mt-4 text-sm">
                                    <strong> Email Address: </strong> {email}
                                </p>
                                <p className = "mt-4 text-sm mb-4">
                                    <strong> Phone Number: </strong> {phoneNumber}
                                </p>
                            </div>
                            <div className = "p-4 rounded-lg shadow-sm">
                                {/* CONTACT INFORMATION */}
                                <h3 className = "font-semibold"> Personal Information </h3>
                                <p className = "mt-4 text-sm">
                                    <strong> Gender: </strong> {gender}
                                </p>
                                <p className = "mt-4 text-sm mb-4">
                                    <strong> Date of Birth: </strong> {new Date(dateOfBirth).toLocaleDateString('en-GB', dateOptions)}
                                </p>
                                <p className = "mt-4 text-sm mb-4">
                                    <strong> Age: </strong> {calculateAge(dateOfBirth)}
                                </p>
                                <p className = "mt-4 text-sm mb-4">
                                    <strong> Elo Rating: </strong> {elo}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className = "strike-report container w-3/5 mx-auto my-10 p-6 card-background shadow-md rounded-[8px] mt-0">
                {strikeReports && strikeReports.length > 0 ? (
                    <div className = "p-4 rounded-lg">
                        <h3 className = "font-semibold"> Strike Report: </h3>
                        {strikeReports.map((report, index) => (
                            <div key = {index} className = "mt-4">
                                <p>
                                    <strong> Strike {index + 1}: </strong>
                                </p>
                                <p className = "ml-4">
                                    <strong> Reason: </strong> {report.reportDetails}
                                </p>
                                <p className = "ml-4">
                                    <strong> Date Issued: </strong> {new Date(report.dateCreated).toLocaleDateString()}
                                </p>
                                <p className = "ml-4">
                                    <strong> Issued By: </strong> {report.issuedBy}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className = "p-4 rounded-lg">
                        <h3 className = "font-semibold"> Strike Report: </h3>
                        <p> You have no strikes. Keep up the good behavior! </p>
                    </div>
                )}
            </div>

            <div className = "participated-tournaments-container w-3/5 mx-auto my-10 p-6 card-background shadow-md rounded-[8px] mt-0">
                <>
                    <div className = "p-4 rounded-lg">
                        <h3 className = "font-semibold"> My Participated Tournaments: </h3>
                        {pastTournaments && pastTournaments.length > 0 ? (
                            <ol className = "mt-4 list-decimal pl-5">
                                {pastTournaments.map((tournament, index) => (
                                    <li key = {index} className = "mt-2 text-sm">
                                        {tournament.tournamentName}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className = "mt-4">
                                <p className = "text-sm text-gray-500"> You have no participated tournaments. Join one today! </p>
                                <div className = "mt-6 flex justify-center items-center">
                                    <button
                                        className = "px-4 py-2 bg-primary-color-green text-sm font-semibold text-white rounded-[12px] hover:cursor-pointer shadow-sm w-3/4"
                                        onClick = {() => { handleJoinTournamentClick() }}
                                    >
                                        Join Tournament
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            </div>
        </div>
    );
};

export default UserProfile;