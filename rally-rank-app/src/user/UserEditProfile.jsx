import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function UserEditProfile() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});           // Form Data - To be changed when user's edit the profile in the form.
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState({});   // Original Data - To keep the user's personal information for comparison.

    // Function to calculate the proper age of the user.
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

    const handleBackButtonClick = () => {
        navigate("/user-profile");
    };

    // API Call: Checking availibility of username and email address.
    // async function checkCredentialsAvailablity(formData) {
    //     try {
    //         const response = await axios.get(
    //         "http://localhost:8080/auth/check-credentials-availability",
    //         {
    //             params: {
    //             accountName: formData.username,
    //             email: formData.email,
    //             },
    //             withCredentials: true
    //         });
    //         if (response.data.accountNameAvailable && response.data.emailAvailable) {
    //             setAlertMessage(null);
    //         } else {
    //             if (!response.data.accountNameAvailable && !response.data.emailAvailable) {
    //                 setAlertMessage("Both username and email address entered has already been taken.");
    //             }
    //             else if (!response.data.accountNameAvailablee) {
    //                 setAlertMessage("Username taken. Enter another one.");
    //             }
    //             else if (!response.data.emailAvailable) {
    //                 setAlertMessage("Email address already in use. Please enter another one.");
    //             }
    //         }
    //     } catch (error) {
    //         alert("catch error");
    //         console.error("Error checking credentials:", error);
    //         if (error.response) {
    //             console.log(error.response.data.error);
    //         }
    //     }
    // }

    // ----------------------- API Call: Retrieving the user's profile data -----------------------
    const fetchUserProfileData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const response = await axios.get("http://localhost:8080/users/profile", {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${userData.jwtToken}`,
                },
            });

            setFormData(response.data);
            setOriginalData(response.data);
        } catch (error) {
            console.error("Error fetching user profile data: ", error);
        }
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        fetchUserProfileData();
    }, []);

    useEffect(() => {
        const isChanged = Object.keys(originalData).some((key) => formData[key] !== originalData[key]);
        setHasChanges(isChanged);
    }, [formData, originalData]);

    // ----------------------- API Call: Updating user's edited data -----------------------
    const handleSubmitChanges = async (e) => {
        e.preventDefault();

        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const usernameChanged = formData.username !== originalData.username;    // Check if the username has been changed.
            const passwordChanged = formData.password !== originalData.password;    // Check if the password has been changed.

            console.log("formdata: ", formData.password);
            console.log("og data ", originalData.password);

            const response = await axios.put(
                "http://localhost:8080/users/update",
                {
                    email: formData.email || userData.email,
                    password: passwordChanged ? formData.password : originalData.password,
                    phoneNumber: formData.phoneNumber || userData.phoneNumber,
                    gender: formData.gender || userData.gender,
                    dateOfBirth: formData.dateOfBirth || userData.dateOfBirth,
                    age: calculateAge(formData.dateOfBirth) || userData.age, 
                    username: usernameChanged ? formData.username : originalData.username,
                    firstName: formData.firstName || userData.firstName,
                    lastName: formData.lastName || userData.lastName,
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                }
            );

            if (response.status === 200) {
                localStorage.setItem("userData", JSON.stringify({
                    ...userData,
                    ...response.data
                }));

                if (usernameChanged || passwordChanged) {
                    localStorage.removeItem("userData");
                    alert("You have been logged out. Redirecting you to user login page...");
                    setTimeout(() => {
                        navigate("/auth/user-login");
                    }, 1000);
                } else {
                    navigate("/user-profile");
                }
            }
        } catch (error) {
            console.error("Error updating user profile: ", error);
            const errorMessage = error.response?.data?.error || "An error occurred while updating the profile.";
            setError(errorMessage);
        }
    };

    return (
        <div className = "mt-5 edit-profile-information p-6 bg-white rounded-lg shadow-md w-2/5 mx-auto">
            <div className="flex items-center gap-4">
                <FontAwesomeIcon
                    icon = {faArrowLeft}
                    onClick={handleBackButtonClick}
                    className = "back-icon cursor-pointer text-xl"
                />
                <h2 className = "text-xl font-semibold mb-4 mt-3"> Edit Profile </h2>
            </div>

            {/* Display error message */}
            {error && <div className = "text-red-500 mb-4"> {error} </div>} 

            <form onSubmit = {handleSubmitChanges} className = "grid grid-cols-1 gap-4">
                {["firstName", "lastName", "email", "phoneNumber", "dateOfBirth", "username"].map((field) => (
                    <div className = "mt-5" key={field}>
                        <label className = "block text-sm font-medium text-gray-700">
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                           <input
                                type = {field === "dateOfBirth" ? "date" : "text"}
                                name = {field}
                                value = {formData[field] || ''}
                                onChange  ={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                placeholder = {`Enter your new ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                                className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </label>
                    </div>
                ))}

                <div className = "mt-5">
                    <label className = "block text-sm font-medium text-gray-700">
                        Gender:
                        <select
                            name = "gender"
                            value = {formData.gender || ''}
                            onChange = {(e) => setFormData({ ...formData, gender: e.target.value })}
                            className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value = ""> Select your gender </option>
                            <option value = "Male"> Male </option>
                            <option value = "Female"> Female </option>
                        </select>
                    </label>
                </div>

                <div className = "mt-5">
                    <label className = "block text-sm font-medium text-gray-700">
                        Password:
                        <input
                            type = "password"
                            name = "password"
                            placeholder = "Leave blank to keep current password"
                            className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                            onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </label>
                </div>

                <div className = "flex justify-center mt-4">
                    <button
                        type = "submit"
                        style = {{
                            backgroundColor: hasChanges ? "green" : "lightgray",
                            color: "white",
                        }}
                        className = "rounded-lg border w-1/2 py-2 px-4"
                        disabled = {!hasChanges}
                    >
                        Save Changes
                    </button>
                </div>
            </form>

            <div className = "flex justify-center mt-4">
                <button
                    onClick = {handleBackButtonClick}
                    className = "py-2 px-4 rounded-lg border w-1/2"
                >
                    Back to Profile
                </button>
            </div>
        </div>
    );
};

export default UserEditProfile;