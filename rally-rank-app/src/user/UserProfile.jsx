import userProfilePicture from "../assets/profile-picture-user.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserProfile() {
    const navigate = useNavigate();

    const handleEditProfile = () => {
        navigate("/user-profile/edit", {state : {userPersonalInformation} });
    };

    const [userPersonalInformation, setUserPersonalInformation] = useState({
        email: "",
        password: "",
        phoneNumber: "",
        elo: 0,
        gender: "",
        dateOfBirth: "",
        age: 0,
        participatedTournaments: [
            // not working yet
        ],
        profilePic: "",
        medicalInformation: {
            emergencyContactNumber: "",
            emergencyContactName: "",
            relationship: ""
        },
        username: "",
        firstName: "",
        lastName: "",
        isAvailable: false,
        role: "",
        enabled: false,
        _class: "",
    });

    // const [userPersonalInformation, setUserPersonalInformation] = useState();
    async function getUserProfile() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/profile",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );

            console.log("user profile data received:" + response.data);
            setUserPersonalInformation(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    useEffect(() => {
        getUserProfile();
    }, []);

    return (
        <div className = "profile-page flex flex-col w-3/5 p-9 gap-5 justify-center mx-auto">
            
            {/* EDIT PROFILE BUTTON */}
            <div className = "flex justify-end">
                <button
                    onClick = { handleEditProfile }
                    className = "py-2 px-4 rounded-lg mt-4 border transition duration-300"
                >
                    Edit Profile
                </button>
            </div>

            {/* USER PROFILE */}
            <div className = "profile-information flex flex-col items-center w-full m-10 justify-center rounded-lg bg-white">
                <div className = "text-center">
                    <img
                        src = {userPersonalInformation.profilePic}
                        alt = "Profile Picture"
                        className = "w-[250px] h-[250px] rounded-full object-cover border mb-4"
                    />
                    <h1 className = "text-2xl font-bold mb-2" style = {{ color: "#676767" }}>
                        Name: {userPersonalInformation.firstName} {userPersonalInformation.lastName}
                    </h1>

                    <p className = "mt-1 text-lg font-medium"> Date of Birth: {userPersonalInformation.dateOfBirth} </p>

                    <p className = "mt-1 text-lg font-medium"> Email Address: {userPersonalInformation.email} </p>

                    <p className = "mt-1 text-lg font-medium"> Tournaments Played: {userPersonalInformation.participatedTournaments} </p>

                    <p className = "mt-1 text-lg font-medium"> Elo Rating: {userPersonalInformation.eloRating} </p>
                </div>
            </div>

            {/* LIST OF PARTICIPATED MATCHES */}
            <div className = "mt-5 border border-gray-300 rounded-lg shadow-md p-5 bg-white">
                <h2 className = "text-lg font-bold mb-2"> Participated Tournaments: </h2>
                {/* <ul className = "list-disc ml-5">
                    {userPersonalInformation.participatedTournaments.map((tournament, index) => (
                        <li key = {index}> {tournament} </li>
                    ))}
                </ul> */}
            </div>
        </div>
    );
};

export default UserProfile;