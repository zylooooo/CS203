// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons Imports
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Authentication Imports
import { useAuth } from "../authentication/AuthContext";

function UserEditProfile() {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const [error, setError] = useState(null);
    const [isChanged, setIsChanged] = useState(false);
    const [password, setPassword] = useState("");
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

    // Constants to store the value of the original data
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalUsername, setOriginalUsername] = useState("");
    const [originalUserData, setOriginalUserData] = useState({});

    // Constants to check or set the boolean value of any changes made to the email or username
    const [isEmailChanged, setIsEmailChanged] = useState(false);
    const [isUsernameChanged, setIsUsernameChanged] = useState(false);
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    // Constants to store the warning or success alert messages
    // const [warningAlertMessage, setWarningAlertMessage] = useState("");
    // const [successAlertMessage, setSuccessAlertMessage] = useState("");

    const handleBackButtonClick = () => {
        navigate("/user/profile");
    }

    const handleChange = () => {
        const formValues = getValues();
        const hasChanges = Object.keys(formValues).some((key) => {
            return formValues[key] !== originalUserData[key] && formValues[key] !== "";
        });
        setIsChanged(hasChanges);
    };

    const handleUsernameChange = () => {
        handleChange();
        setIsUsernameChanged(true);
    };

    const handleEmailChange = () => {
        handleChange();
        setIsEmailChanged(true);
    };

    const handlePasswordChange = () => {
        handleChange();
        setIsPasswordChanged(true);
    };

    // ----------------------- API Call: Checking the availability of username and email address -----------------------
    async function checkCredentialsAvailability(formData) {
        try {
             const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
            "http://localhost:8080/auth/credentials-availability",
            {
                params: {
                accountName: formData.username || originalUserData.username,
                email: formData.email || originalUserData.email,
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
                        setValue(key, "");
                    }
                }
            }
        } catch (error) {
            alert("Catch error");
            console.error("Error fetching user profile data: ", error);
            setOriginalUserData(null);
        }
    };

    // ----------------------- useEffect() -----------------------
    useEffect(() => {
        fetchUserProfileData();
    }, []);

    // ----------------------- API Call: Updating the user's edited profile information -----------------------
    async function updateUserProfile(formData) {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.put(
                "http://localhost:8080/users/profile",
                {
                    username: formData.username || originalUserData.username,
                    email: formData.email || originalUserData.email,
                    firstName: formData.firstName || originalUserData.firstName,
                    lastName: formData.lastName || originalUserData.lastName,
                    phoneNumber: formData.phoneNumber || originalUserData.phoneNumber,
                    dateOfBirth: formData.dateOfBirth || originalUserData.dateOfBirth,
                    gender: formData.gender || originalUserData.gender,
                    password: formData.password || originalUserData.password,
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                },
            );
            if (response.status === 200) {
                userData.username = formData.username;
                localStorage.setItem("userData", JSON.stringify(userData));
                return response.data;
            }
        } catch (error) {
            alert("Catch error");
            console.error("Error updating user profile: ", error.response.data.error);
            setError(error.response?.data?.error || "An error occured while updating profile.");
        }
    };

    const onSubmit = async(formData) => {
        const firstResponse = await checkCredentialsAvailability(formData);
        if (firstResponse) {
            const updatedData = {
                username: formData.username || originalUserData.username,
                email: formData.email || originalUserData.email,
                firstName: formData.firstName || originalUserData.firstName,
                lastName: formData.lastName || originalUserData.lastName,
                phoneNumber: formData.phoneNumber || originalUserData.phoneNumber,
                dateOfBirth: formData.dateOfBirth || originalUserData.dateOfBirth,
                gender: formData.gender || originalUserData.gender,
                password: formData.password || originalUserData.password,
            };
            await updateUserProfile(updatedData);
            if (isUsernameChanged || isPasswordChanged || isEmailChanged) {
                setIsEmailChanged(false);
                setIsUsernameChanged(false);
                setIsPasswordChanged(false);
                navigate("/auth/user-login");
            }
            navigate("/user/profile");
        }
    };
    
    return (
        <div className = "mt-5 edit-profile-information p-6 rounded-lg w-3/5 mx-auto">
            <div className = "flex items-center gap-4">
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
                        className = {`rounded-lg border w-1/3 py-2 px-4 text-md font-semibold text-white
                                    ${isChanged ? "bg-primary-color-green" : "bg-gray-300"}`}
                        disabled = {!isChanged}
                    >
                        Save Changes
                    </button>
                </div>
                <div className = "p-6 shadow-lg rounded-[12px] card-background">
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
                            placeholder = {originalUsername || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("username", { 
                                onChange: handleUsernameChange,
                                pattern: {
                                    value: /^[a-zA-Z0-9_]*$/,
                                    message: "Username can only contain letters, numbers, and underscores."
                                }
                            })}
                        />
                        {errors.username && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.username.message} </p>
                        )}
                    </div>
                    {/* PASSWORD*/}
                    <div className = "mt-5">
                        <label className = "block text-lg font-medium text-gray-700 ml-1 mt-10">
                            Password:
                        </label>
                        <input
                            type = "password"
                            id = "password"
                            placeholder = "••••••••"
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3 mb-4"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("password", { onChange: handlePasswordChange })}
                        />
                    </div>
                    {/* EMAIL ADDRESS */}
                    <div className = "mt-5 mb-3">
                        <label
                            htmlFor = "email"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                            {...register("email", {
                                onChange: handleEmailChange,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Please enter a valid email address."
                                }
                            })}
                        >
                            Email Address
                        {errors.email && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.email.message} </p>
                        )}
                        </label>
                        <input
                            type = "text"
                            id = "email"
                            placeholder = {originalUserData.email || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("email", { onChange: handleEmailChange })}
                        />
                    </div>
                </div>
                <div className = "p-6 shadow-lg rounded-[12px] mt-6 card-background">
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
                            placeholder = {originalUserData.firstName || ""}
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
                            placeholder = {originalUserData.lastName || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("lastName", { onChange: handleChange })}
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
                            placeholder = {originalUserData.phoneNumber || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("phoneNumber", { 
                                onChange: handleChange,
                                pattern: {
                                    value: /^[896]\d{7}$/,
                                    message: "Please enter a valid phone number."
                                }
                            })}
                        />
                        {errors.phoneNumber && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.phoneNumber.message} </p>
                        )}
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
                            {...register("dateOfBirth", {
                                onChange: handleChange,
                                validate: (value) => {
                                    const today = new Date();
                                    const inputDate = new Date(value);
                                    if (inputDate >= today) {
                                        return "Please enter a valid date of birth.";
                                    }
                                    return true;
                                }
                            })}
                            max={new Date().toISOString().split("T")[0]}
                        />
                        {errors.dateOfBirth && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.dateOfBirth.message} </p>
                        )}
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