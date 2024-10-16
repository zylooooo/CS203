import userProfilePicture from "../assets/profile-picture-user.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserProfile() {
    // ------------------------------------- API CALLS - MOCK PLAYER DATA ------------------------------------------------
    // API calls - Mock player data
    const [userPersonalInformation, setUserPersonalInformation] = useState(
        {
            _id: "XXX",
            emailAddress: "iamfat@willywonka.com",
            phoneNumber: "98765432",
            eloRating: 400,
            gender: "M",
            dateOfBirth: "1996-02-29",
            participatedTournaments: [
                "Pro tennis pro max competition",
                "SMU Tennis expertz Competition",
            ],
            profilePic: userProfilePicture,
            password: "UserPassword",
            userName: "FattyBomBom",
            firstName: "Augustus",
            lastName: "Gloop",
            isAvailable: true,
            strikeReport: [{
                reportedDetails: "Reason for ban",
                dateCreated: "2024-09-29 13:30",
                issuedBy: "AdminName"
            }]
        }
    );
    // ---------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();

    const handleEditProfile = () => {
        navigate("/user-profile/edit", {state : {userPersonalInformation} });
    };

    return (
        <div className = "profile-page flex flex-col w-3/5 p-9 gap-5 justify-center mx-auto">
            
            {/* EDIT PROFILE BUTTON */}
            <div className = "flex justify-end">
                <button
                    onClick = {handleEditProfile}
                    className = "py-2 px-4 rounded-lg mt-4 border transition duration-300"
                >
                    Edit Profile
                </button>
            </div>

            {/* USER PROFILE */}
            <div className = "profile-information flex flex-col items-center w-full m-10 justify-center rounded-lg bg-white">
                <img
                    src = {userPersonalInformation.profilePic}
                    alt = "Profile Picture"
                    className = "w-[250px] h-[250px] rounded-full object-cover border mb-4"
                />
                <div className = "text-center">
                    <h1 className = "text-2xl font-bold mb-2" style = {{ color: "#676767" }}>
                        Name: {userPersonalInformation.firstName} {userPersonalInformation.lastName}
                    </h1>

                    <p className = "mt-1 text-lg font-medium"> Date of Birth: {userPersonalInformation.dateOfBirth} </p>

                    <p className = "mt-1 text-lg font-medium"> Email Address: {userPersonalInformation.emailAddress} </p>

                    <p className = "mt-1 text-lg font-medium"> Tournaments Played: {userPersonalInformation.participatedTournaments.length} </p>

                    <p className = "mt-1 text-lg font-medium"> Elo Rating: {userPersonalInformation.eloRating} </p>
                </div>
            </div>

            {/* LIST OF PARTICIPATED MATCHES */}
            <div className = "mt-5 border border-gray-300 rounded-lg shadow-md p-5 bg-white">
                <h2 className = "text-lg font-bold mb-2"> Participated Tournaments: </h2>
                <ul className = "list-disc ml-5">
                    {userPersonalInformation.participatedTournaments.map((tournament, index) => (
                        <li key = {index}> {tournament} </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserProfile;