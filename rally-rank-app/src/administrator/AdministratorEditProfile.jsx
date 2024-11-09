// Configuration imports
import { API_URL } from '../../config';

// Authentication Imports
import { useAuth } from "../authentication/AuthContext";

// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icon Imports
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Assets and Components Imports
import ConfirmationPopUp from '../components/ConfirmationPopUp';
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

function AdministratorEditProfile() {
    const navigate = useNavigate();
    const { logoutAdmin } = useAuth();
    const [isChanged, setIsChanged] = useState(false);
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

    // Consts: Store the original data
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalAdminName, setOriginalAdminName] = useState("");
    const [originalAdminData, setOriginalAdminData] = useState({});

    // Consts: Check to see if important fields are changed
    const [isEmailChanged, setIsEmailChanged] = useState(false);
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);
    const [isAdminNameChanged, setIsAdminNameChanged] = useState(false);

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // For Confirmation Popup
    const [showConfirmationPopUp, setShowConfirmationPopUp] = useState(false);

    const handleBackButtonClick = () => {
        navigate("/administrator-account");
    };

    const handleDeleteAccount = () => {
        setShowConfirmationPopUp(true);
    };

    const handleDeleteAccountConfirmation = async () => {
        const result = await deleteAdminProfile();
        if (result) {
            setSuccessMessage("Your profile has been deleted successfully! You will now be redirected out of RallyRank...");
            setTimeout(() => {
                logoutAdmin();
                navigate("/administrator-login");
            }, 2000);
            setShowConfirmationPopUp(false);
        }
    };

    const handleChange = () => {
        const formValues = getValues();
        const hasChanges = Object.keys(formValues).some((key) => {
            return formValues[key] !== originalAdminData[key] && formValues[key] !== "";
        });
        setIsChanged(hasChanges);
    };

    const handleAdminNameChange = () => {
        handleChange();
        setIsAdminNameChanged(true);
    };

    const handleEmailChange = () => {
        handleChange();
        setIsEmailChanged(true);
    };

    const handlePasswordChange = () => {
        handleChange();
        setIsPasswordChanged(true);
    };

    // -------------------------- API Call: Delete administrator's account ---------------------------
    async function deleteAdminProfile() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.delete(
                `${API_URL}/admins/profile`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            if (response.status === 200) {
                return true;
            }

        } catch (error) {
            setWarningMessage("Unable to delete your account. Please reload the page and try again.");
            console.error("Error deleting admin profile: ", error);
        }
    };

    // ----------------------- API Call: Checking the availability of username and email address -----------------------
    async function checkCredentialsAvailablity(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
              console.error("No JWT token found");
              return;
            }
            const response = await axios.get(
                `${API_URL}/auth/credentials-availability`,
                {
                    params: {
                        accountName: formData.adminName || originalAdminData.adminName,
                        email: formData.email || originalAdminData.email,
                    },
                    withCredentials: true,
                },
            );
            
            if ((response.data.accountNameAvailable && response.data.emailAvailable) ||
                (!isAdminNameChanged && response.data.emailAvailable) ||
                (!isEmailChanged && response.data.accountNameAvailable) ||
                (!isAdminNameChanged && !isEmailChanged)) {
                return true;
            } else {
                if (isAdminNameChanged && isEmailChanged && !response.data.accountNameAvailable && !response.data.emailAvailable) {
                    setWarningMessage("Both username and email address entered has already been taken!");
                }
                else if (isAdminNameChanged && !response.data.accountNameAvailable) {
                    setWarningMessage("Username taken! Please enter another one.");
                }
                else if (isEmailChanged && !response.data.emailAvailable) {
                    setWarningMessage("Email address already in use! Please enter another one.");
                }
                return false;
            }

        } catch (error) {
            setWarningMessage("Unable to check credentials. Please reload the page and try again.");
            console.error("Error checking credentials:", error);
        }
    };

    // ----------------------- API Call: Retrieving the administrator's profile data -----------------------
    const fetchAdminProfile = async () => {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
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

            if (response.status === 200) {
                setOriginalAdminData(response.data);
                setOriginalEmail(response.data.email);
                setOriginalAdminName(response.data.adminName);
                for (const key in response.data) {
                    if (key !== "password") {
                        setValue(key, "");
                    }
                };
            };

        } catch (error) {
            setWarningMessage("Unable to fetch your profile information. Please reload and try again.");
            console.error("Error fetching admin profile data: ", error.response.data.error);
            setOriginalAdminData(null);
        }
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        fetchAdminProfile();
    }, []);

    // ----------------------- API Call: Updating user's edited data -----------------------
    async function updateAdminProfile(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }
            
            const response = await axios.put(
                `${API_URL}/admins/profile`,
                {
                    ...originalAdminData,
                    adminName: formData.adminName || originalAdminData.adminName,
                    email: formData.email || originalAdminData.email,
                    firstName : formData.firstName || originalAdminData.firstName,
                    lastName: formData.lastName || originalAdminData.lastName,
                    password: formData.password || originalAdminData.password,

                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            if (response.status === 200) {
                adminData.adminName = formData.adminName;
                localStorage.setItem("adminData", JSON.stringify(adminData));
                return response.data;
            }

        } catch (error) {
            console.error("Error updating admin profile: ", error.response.data.error);
            setWarningMessage("Unable to update details. Please reload the page and try again.");
        }
    };

    const onSubmit = async (formData) => {
        setWarningMessage("");
        setSuccessMessage("");
        const firstResponse = await checkCredentialsAvailablity(formData);
        if (firstResponse) {
            const updatedData = {
                ...originalAdminData,
                adminName: formData.adminName || originalAdminData.adminName,
                email: formData.email || originalAdminData.email,
                firstName: formData.firstName || originalAdminData.firstName,
                lastName: formData.lastName || originalAdminData.lastName,
                password: formData.password || originalAdminData.password,
            };
            await updateAdminProfile(updatedData);
            if (isAdminNameChanged) {
                setIsAdminNameChanged(false);
                setSuccessMessage("Administrator username successfully updated! Redirecting you to RallyRank's login page...");
            } else if (isPasswordChanged) {
                setIsPasswordChanged(false);
                setSuccessMessage("Password successfully updated! Redirecting you to RallyRank's login page...");
            } else if (isEmailChanged) {
                setIsEmailChanged(false);
                setSuccessMessage("Email address successfully updated! Redirecting you to RallyRank's login page...");
            }
            if (isAdminNameChanged || isPasswordChanged || isEmailChanged) {
                setTimeout(() => {
                    logoutAdmin();
                    navigate("/administrator-login");
                }, 2000);
            } else {
                setSuccessMessage("Successfully updated your profile!")
                setTimeout(() => {
                    navigate("/administrator-account");
                }, 2000);
            }
        }
    };

    return (
        <div className = "mt-5 edit-profile-information p-6 rounded-lg w-3/5 mx-auto">
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
                        className = {`rounded-lg border w-1/4 py-2 px-4 text-md font-semibold text-white
                                    ${isChanged ? "bg-primary-color-green" : "bg-gray-300"}`}
                        disabled = {!isChanged}
                    >
                        Save Changes
                    </button>
                </div>
                {/* ACCOUNT INFORMATION */}
                <div className = "p-6 shadow-lg rounded-[12px] card-background">
                    <h2 className = "text-2xl font-bold mt-2 ml-2"> Account Information </h2>
                    {/* ADMINISTRATOR USERNAME */}
                    <div className = "mt-2">
                        <label
                            htmlFor = "adminName"
                            className = "block text-lg font-medium text-gray-700 ml-1 mt-6"
                        >
                            Admin Username
                        </label>
                        <input
                            type = "text"
                            id = "adminName"
                            placeholder = {originalAdminName || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("adminName", { 
                                onChange: handleAdminNameChange,
                                pattern: {
                                    value: /^[a-zA-Z0-9_]*$/,
                                    message: "Admin username can only contain letters, numbers, and underscores."
                                }
                            })}
                        />
                        {errors.adminName && (
                            <p className = "text-red-600 text-sm mt-2"> {errors.adminName.message} </p>
                        )}
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
                            placeholder = {originalEmail || ""}
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
                </div>
                {/* PERSONAL INFORMATION */}
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
                            placeholder = {originalAdminData.firstName || ""}
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
                            placeholder = {originalAdminData.lastName || ""}
                            className = "block w-full rounded-[12px] p-3 text-md font-semibold mt-3"
                            style = {{ backgroundColor: "#EBEBEB" }}
                            {...register("lastName", { onChange: handleChange })}
                        />
                    </div>
                </div>
            </form>
            <div className = "flex justify-between items-center mt-6">
                {/* BACK TO PROFILE */}
                <button
                    onClick = {handleBackButtonClick}
                    className = "py-2 px-4 rounded-lg border w-1/3 text-center bg-primary-color-light-green text-primary-color-white hover:bg-primary-color-green hover:text-white transition duration-300 ease-in-out"
                >
                    Back to Profile
                </button>
                {/* DELETE ACCOUNT BUTTON */}
                <button
                    className = "bg-secondary-color-red hover:bg-red-600 font-semibold py-2 px-4 rounded-lg shadow-md w-1/3 text-white hover:shadow-md transition duration-300 ease-in-out text-center"
                    onClick = {handleDeleteAccount}
                >
                    Delete Account
                </button>
                {showConfirmationPopUp && (
                    <ConfirmationPopUp
                        message = "Do you want to delete your RallyRank administrator account? This action is irreversible!"
                        onConfirm = {handleDeleteAccountConfirmation}
                        onCancel = {() => setShowConfirmationPopUp(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default AdministratorEditProfile;