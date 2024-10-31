// Package Imports
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

// Icon Imports
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";

function UserEditProfile() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isChanged, setIsChanged] = useState(false);
    const [isUsernameChanged, setIsUsernameChanged] = useState(false);
    const [isEmailChanged, setIsEmailChanged] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalUsername, setOriginalUsername] = useState("");
    const { register, handleSubmit, setValue } = useForm();
    const [alertMessage, setAlertMessage] = useState("");
    const [originalUserData, setOriginalUserData] = useState({});


    const handleBackButtonClick = () => {
        navigate("/user-profile");
    };

    //API Call: Checking availibility of username and email address.
    async function checkCredentialsAvailablity(formData) {
        try {
             const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
            "http://localhost:8080/auth/check-credentials-availability",
            {
                params: {
                accountName: formData.username,
                email: formData.email,
                },
                withCredentials: true
            });
            
            if ((response.data.accountNameAvailable && response.data.emailAvailable) ||
                (!isUsernameChanged && response.data.emailAvailable) ||
                (!isEmailChanged && response.data.accountNameAvailable) ||
                (!isUsernameChanged && !isEmailChanged)) {
                return true;
            } else {
                if (isUsernameChanged && isEmailChanged && !response.data.accountNameAvailable && !response.data.emailAvailable) {
                    setAlertMessage("Both username and email address entered has already been taken.");
                }
                else if (isUsernameChanged && !response.data.accountNameAvailable) {
                    setAlertMessage("Username taken. Enter another one.");
                }
                else if (isEmailChanged && !response.data.emailAvailable) {
                    setAlertMessage("Email address already in use. Please enter another one.");
                }
                return false;
            }
        } catch (error) {
            alert("catch error");
            console.error("Error checking credentials:", error);
            if (error.response) {
                console.log(error.response.data.error);
            }
        }
    }

    // ----------------------- API Call: Retrieving the user's profile data -----------------------
    const fetchUserProfileData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
                "http://localhost:8080/users/profile",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                }
            );
            if (response.status === 200) {
                setOriginalUserData(response.data);
                setOriginalEmail(response.data.email);
                setOriginalUsername(response.data.username);
                for (const key in response.data) {
                    if (key !== "password") {
                        setValue(key, response.data[key]);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user profile data: ", error);
            setOriginalUserData(null);
        }
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        fetchUserProfileData();
    }, []);

    // ----------------------- API Call: Updating user's edited data -----------------------
    async function updateUserProfile(formData) {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            
            const response = await axios.put(
                "http://localhost:8080/users/update",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                }
            );

            if (response.status === 200) {
                userData.username = formData.username;
                localStorage.setItem("userData", JSON.stringify(userData));     // Updates the new availability in the userData to be passed around
                return response.data;
            }

            // return response.data;

        } catch (error) {
            console.error("Error updating user profile: ", error.response.data.error);
            const errorMessage = error.response?.data?.error || "An error occurred while updating the profile.";
            setError(errorMessage);
        }
    };

    const [password, setPassword] = useState("");

    const onSubmit = async (formData) => {
        setAlertMessage("");
        const firstResponse = await checkCredentialsAvailablity(formData);

        // if new username and/or new email are available, allow user to update profile
        if (firstResponse) {
            const updatedData = {
                ...formData,
                password: password || originalUserData.password,
            };
            
            await updateUserProfile(updatedData);
            setIsEmailChanged(false);
            setIsUsernameChanged(false);
            navigate("/user-profile");

        }
        
    };
    
    const handleChange = () => {
        setIsChanged(true);
    }

    const handleUsernameChange = () => {
        setIsChanged(true);
        // if (originalUsername !== )
        setIsUsernameChanged(true);
    }

    const handleEmailChange = () => {
        setIsChanged(true);
        setIsEmailChanged(true);
    }

    return (
        <div className = "mt-5 edit-profile-information p-6 bg-white rounded-lg w-3/5 mx-auto">
            <AlertMessageWarning message = {alertMessage} onClose = {() => setAlertMessage("")} />
            <div className="flex items-center gap-4">
                <FontAwesomeIcon
                    icon = {faArrowLeft}
                    onClick = {handleBackButtonClick}
                    className = "back-icon cursor-pointer text-xl"
                />
                <h2 className = "text-xl font-bold mb-4 mt-3"> Edit Profile </h2>
            </div>
            <form onSubmit = {handleSubmit(onSubmit)} className = "grid grid-cols-1 gap-4">
                {/* SAVE CHANGES BUTTON */}
                <div className = "flex justify-end mt-4 mb-3">
                    <button
                        type = "submit"
                        style = {{
                            backgroundColor: isChanged ? "green" : "lightgray",
                            color: "white",
                        }}
                        className = "rounded-lg border w-1/3 py-2 px-4 text-md font-semibold"
                        disabled = {!isChanged}
                    >
                        Save Changes
                    </button>
                </div>
                <div className = "p-6 shadow-lg rounded-[12px]">
                    <h2 className = "text-2xl font-bold mt-2 ml-2"> Account Information </h2>
                    {/* USERNAME */}
                    <div className = "mt-2">
                        <label
                            htmlFor = "username"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-6"
                        >
                            Username
                        </label>
                        <input
                            type = "text"
                            id = "username"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("username", { onChange: handleUsernameChange })}
                            // {...register("username", { onChange: handleChange })}
                        />
                    </div>
                    {/* PASSWORD*/}
                    <div className = "mt-5">
                        <label className = "block text-lg font-medium text-gray-700 ml-1 mt-10">
                            Password:
                        </label>
                        <input
                            type = "password"
                            id = "password"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3 mb-4"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            onChange={(e) =>{ setPassword(e.target.value); handleChange(); }}
                            // {...register("password", { onChange: handleChange })}
                        />
                    </div>
                </div>
                <div className = "p-6 shadow-lg rounded-[12px] mt-6">
                    <h2 className = "text-2xl font-bold mt-5 ml-2"> Personal Information </h2>
                    {/* FIRST NAME */}
                    <div className = "mt-2">
                        <label
                            htmlFor = "firstName"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            First Name
                        </label>
                        <input
                            type = "text"
                            id = "firstName"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("firstName", { onChange: handleChange })}
                        />
                    </div>
                    {/* LAST NAME */}
                    <div className = "mt-5">
                        <label
                            htmlFor = "lastName"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            Last Name
                        </label>
                        <input
                            type = "text"
                            id = "lastName"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("lastName", { onChange: handleChange })}
                        />
                    </div>
                    {/* EMAIL ADDRESS */}
                    <div className = "mt-5">
                        <label
                            htmlFor = "email"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            Email Address
                        </label>
                        <input
                            type = "text"
                            id = "email"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("email", { onChange: handleEmailChange })}
                            // {...register("email", { onChange: handleChange })}
                        />
                    </div>
                    {/* PHONE NUMBER */}
                    <div className = "mt-5">
                        <label
                            htmlFor = "phoneNumber"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            Phone Number
                        </label>
                        <input
                            type = "text"
                            id = "phoneNumber"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("phoneNumber", { onChange: handleChange })}
                        />
                    </div>
                    {/* DATE OF BIRTH */}
                    <div className = "mt-5">
                        <label
                            htmlFor = "dateOfBirth"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            Date Of Birth
                        </label>
                        <input
                            type = "date"
                            id = "dateOfBirth"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("dateOfBirth", { onChange: handleChange })}
                        />
                    </div>
                    {/* GENDER */}
                    <div className = "mt-5">
                        <label
                            htmlFor = "gender"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            Gender:
                        </label>
                        <select
                            id = "gender"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3 mb-4"
                            style = {{ backgroundColor: "#EBEBEB", paddingRight: "2rem" }}
                            {...register("gender", { onChange: handleChange })}
                        >
                            <option value = ""> Select your gender </option>
                            <option value = "Male"> Male </option>
                            <option value = "Female"> Female </option>
                        </select> 
                    </div>
                </div>
            </form>
            {/* BACK TO PROFILE */}
            <div className = "flex justify-center mt-4">
                <button
                    onClick = {handleBackButtonClick}
                    className = "py-2 px-4 rounded-lg border w-1/3"
                >
                    Back to Profile
                </button>
            </div>
        </div>
    );
};

export default UserEditProfile;