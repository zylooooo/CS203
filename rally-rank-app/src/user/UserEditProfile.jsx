// Configuration imports
import { API_URL } from '../../config';

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

// Assets and Components Imports
import ConfirmationPopUp from '../components/ConfirmationPopUp';
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

function UserEditProfile() {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();
    const [isChanged, setIsChanged] = useState(false);
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

    // Consts: Store the original data
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalUsername, setOriginalUsername] = useState("");
    const [originalUserData, setOriginalUserData] = useState({});

    // Consts: Check to see if important fields are changed
    const [isEmailChanged, setIsEmailChanged] = useState(false);
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);
    const [isUsernameChanged, setIsUsernameChanged] = useState(false);

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // For Confirmation Popup
    const [showConfirmationPopUp, setShowConfirmationPopUp] = useState(false);

    const handleDeleteAccount = () => {
        setShowConfirmationPopUp(true);
    };

    const handleDeleteAccountConfirmation = async () => {
        const result = await deleteUserProfile();
        if (result) {
            setSuccessMessage("Your profile has been deleted successfully! You will now be redirected out of RallyRank...");
            setTimeout(() => {
                logoutUser();
                navigate("/auth/user-login");
            }, 2000);
            setShowConfirmationPopUp(false);
        }
    };

    const handleBackButtonClick = () => {
        navigate("/user/profile");
    };

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

    // Function to capitalize the first letter (for first name or last name)
    const capitalizeFirstLetter = (name) => name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

    // ----------------------- API Call: Deleting the user's profile -----------------------
    async function deleteUserProfile() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const response = await axios.delete(
                `${API_URL}/users/profile`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                },
            );

            if (response.status === 204) {
                return true;
            } else {
                alert("Error deleteing account.");
            }

        } catch (error) {
            setWarningMessage("Unable to delete your account. Please reload the page and try again.");
            console.error("Error deleting user profile: ", error);
        }
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
            `${API_URL}/auth/credentials-availability`,
            {
                params: {
                accountName: formData.username || originalUserData.username,
                email: formData.email || originalUserData.email,
                },
                withCredentials: true,
            });
            
            if ((response.data.accountNameAvailable && response.data.emailAvailable) ||
                (!isUsernameChanged && response.data.emailAvailable) ||
                (!isEmailChanged && response.data.accountNameAvailable) ||
                (!isUsernameChanged && !isEmailChanged)) {
                return true;
            } else {
                if (isUsernameChanged && isEmailChanged && !response.data.accountNameAvailable && !response.data.emailAvailable) {
                    setWarningMessage("Both username and email address entered has already been taken.");
                }
                else if (isUsernameChanged && !response.data.accountNameAvailable) {
                    setWarningMessage("Username taken. Enter another one.");
                }
                else if (isEmailChanged && !response.data.emailAvailable) {
                    setWarningMessage("Email address already in use. Please enter another one.");
                }
                return false;
            }
        } catch (error) {
            setWarningMessage("Unable to check credentials. Please reload the page and try again.");
            console.error("Error checking credentials:", error);
        }
    };

    // ----------------------- API Call: Retrieving the user's profile data -----------------------
    const fetchUserProfileData = async () => {
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
                },
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
            setWarningMessage("Unable to fetch your profile information. Please reload the page and try again.");
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
                `${API_URL}/users/profile`,
                {
                    username: formData.username || originalUserData.username,
                    email: formData.email || originalUserData.email,
                    firstName: capitalizeFirstLetter(formData.firstName) || originalUserData.firstName,
                    lastName: capitalizeFirstLetter(formData.lastName) || originalUserData.lastName,
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
            setWarningMessage("Unable to update details. Please reload the page and try again.");
            console.error("Error updating user profile: ", error.response.data.error);
        }
    };

    const onSubmit = async(formData) => {
        setWarningMessage("");
        setSuccessMessage("");
        const firstResponse = await checkCredentialsAvailability(formData);
        if (firstResponse) {
            const updatedData = {
                username: formData.username || originalUserData.username,
                email: formData.email || originalUserData.email,
                firstName: capitalizeFirstLetter(formData.firstName) || originalUserData.firstName,
                lastName: capitalizeFirstLetter(formData.lastName) || originalUserData.lastName,
                phoneNumber: formData.phoneNumber || originalUserData.phoneNumber,
                dateOfBirth: formData.dateOfBirth || originalUserData.dateOfBirth,
                gender: formData.gender || originalUserData.gender,
                password: formData.password || originalUserData.password,
            };
            await updateUserProfile(updatedData);
            if (isUsernameChanged) {
                setIsUsernameChanged(false);
                setSuccessMessage("Username successfully updated! Redirecting you to RallyRank's login page...");
            } else if (isPasswordChanged) {
                setIsPasswordChanged(false);
                setSuccessMessage("Password successfully updated! Redirecting you to RallyRank's login page...");
            } else if (isEmailChanged) {
                setIsEmailChanged(false);
                setSuccessMessage("Email address successfully updated! Redirecting you to RallyRank's login page...");
            }
            if (isUsernameChanged || isPasswordChanged || isEmailChanged) {
                setTimeout(() => {
                    logoutUser();
                    navigate("/auth/user-login");
                }, 2000);
            } else {
                setSuccessMessage("Successfully updated your profile!")
                setTimeout(() => {
                    navigate("/user/profile");
                }, 2000);
            }
        }
    };

    return (
        <div className = "edit-profile-information p-6 rounded-lg w-3/5 mx-auto my-5 ">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
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
                                    ${isChanged ? "bg-primary-color-light-green hover:bg-primary-color-green" : "bg-gray-300"}`}
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
                            {...register("password", {
                                onChange: handlePasswordChange,
                                ...(isPasswordChanged && {
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters long.",
                                    },
                                    validate: {
                                        alphanumeric: (value) =>
                                            /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value) || "Password must be alphanumeric.",
                                        uppercase: (value) =>
                                            /(?=.*[A-Z])/.test(value) || "Password must contain at least one uppercase letter.",
                                        lowercase: (value) =>
                                            /(?=.*[a-z])/.test(value) || "Password must contain at least one lowercase letter.",
                                        symbol: (value) =>
                                            /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value) || "Password must contain at least one special character.",
                                    },
                                }),
                            })}
                        />
                        {errors.password && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.password.message} </p>
                        )}
                    </div>
                    {/* EMAIL ADDRESS */}
                    <div className = "mt-5 mb-3">
                        <label
                            htmlFor = "email"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-10"
                        >
                            Email Address
                        
                        </label>
                        <input
                            type = "text"
                            id = "email"
                            placeholder = {originalUserData.email || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("email", {
                                onChange: handleEmailChange,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Please enter a valid email address."
                                }
                            })}
                        />
                        {errors.email && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.email.message} </p>
                        )}
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
                        <div className = "rounded-[12px]" style = {{ backgroundColor: "#EBEBEB" }}>
                        <select
                            id = "gender"
                            className = "block w-full rounded-[12px] p-3 mr-6 text-md font-semibold mt-3 mb-4"
                            style = {{ backgroundColor: "#EBEBEB", width: 'calc(100% - 12px)', paddingRight: "2rem" }}
                            {...register("gender", { onChange: handleChange })}
                        >
                            <option value = ""> Select your gender </option>
                            <option value = "Male"> Male </option>
                            <option value = "Female"> Female </option>
                        </select> 
                        </div>
                    </div>
                </div>
            </form>
            {/* BACK TO PROFILE */}
            <div className = "flex justify-between mt-6">
                <button
                    onClick = {handleBackButtonClick}
                    className = "py-2 px-4 rounded-lg border w-1/3 text-center bg-primary-color-light-green text-primary-color-white hover:bg-primary-color-green hover:text-white transition duration-300 ease-in-out"
                >
                    Back to Profile
                </button>
                <button
                    className = "bg-secondary-color-red hover:bg-red-600 font-semibold py-2 px-4 rounded-lg shadow-md w-1/3 text-white hover:shadow-md transition duration-300 ease-in-out text-center"
                    onClick = {handleDeleteAccount}
                >
                    Delete Account
                </button>
                {showConfirmationPopUp && (
                    <ConfirmationPopUp
                        message = "Do you want to delete your RallyRank account? This action is irreversible!"
                        onConfirm = {handleDeleteAccountConfirmation}
                        onCancel = {() => setShowConfirmationPopUp(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default UserEditProfile;