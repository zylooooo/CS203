// Configuration Imports
import { API_URL } from '../../config';

// Authentication Imports
import { useAuth } from "../authentication/AuthContext";

// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Assets and Components Imports
import loginBackground from "../assets/login-picture.jpg";
import rallyRankLogo from "../assets/Rally-Rank-Logo.svg";
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

function UserLogin() {
    const form = useForm();
    const navigate = useNavigate();
    const { loginUser, isUserLoggedIn } = useAuth();

    const { register, handleSubmit, formState } = form;
    const { errors } = formState;

    useEffect(() => {
        if (isUserLoggedIn) {
            const currUrl = localStorage.getItem("currUrl");
            navigate(currUrl); 
        }
    }, [navigate, isUserLoggedIn]);

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // -------------------------- API Call: Authenticate user's login details ---------------------------
    async function authenticateUser(username, password) {
        try {
            const response = await axios.post(
                `${API_URL}/auth/user-login`,
                {
                    username,
                    password
                },
                {
                    withCredentials: true
                },
            );
            if (response.status === 200) {
                return response.data;
            } else {
                console.log("response.data.error: ", response.data.error);
            }
        } catch (error) {
            const errorMessage = error.response.data.error;
            if (errorMessage === "User not found") {
                setWarningMessage("User not found!");
            } else if (errorMessage === "Invalid password") {
                setWarningMessage("Invalid Password!");
            } else if (errorMessage === "Your account is not enabled. Please check your email to enable your account.") {
                setWarningMessage(errorMessage);
            } else {
                setWarningMessage("Unable to log in. Please reload the page and try again.");
            }
        }
    };

    async function retrieveUserData(jwtToken) {
        try {
            const response = await axios.get(
                `${API_URL}/users/profile`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            setWarningMessage("Unable to fetch your user details. Please try again.");
            console.error("Error fetching user data: ", error);
            return null;
        }
    };

    const onSubmit = async (formData) => {
        const response = await authenticateUser(
            formData.username,
            formData.password
        );
        const userDataResponse = await retrieveUserData(response.token);
        if (response !== undefined) {
            const userData = {
                username: formData.username,
                role: "USER",
                jwtToken: response.token,
                jwtExpiration: response.expiresIn,
                gender: userDataResponse.gender,
                available: userDataResponse.available,
            };
            setSuccessMessage("Login Successful! Redirecting...");
            loginUser(userData);
            setTimeout(() => {
                navigate("/users/home");
            }, 2000);
        }
    };

    return (
        <>
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div
                className = "bg-cover bg-center flex flex-col justify-center items-center h-main w-screen overflow-hidden"
                style = {{ backgroundImage: `url(${loginBackground})`, objectFit: 'cover', backgroundAttachment: 'fixed'}}
            >
                <div className = "card rounded-[12px] bg-white border-none items-center m-6">
                    <img className = "h-[60px] w-full mb-1" src = {rallyRankLogo} alt="RallyRank Logo" />
                    <form
                        className = "card px-2 py-4 border-none shadow-none bg-white"
                        onSubmit = {handleSubmit(onSubmit)}
                        noValidate
                    >
                    <div>
                        <label
                            htmlFor = "username"
                            className = "block text-sm font-medium text-gray-700"
                        >
                        </label>
                        <input
                            className = "w-full border-0 border-b border-gray-300  focus:outline-none p-2"
                            style = {{
                                borderBottomColor: "#555555",
                                borderBottomWidth: "1.5px",
                            }}
                            type = "text"
                            id = "username"
                            placeholder = "Username"
                            {...register("username", {required: "Username is required"})}
                        />
                        <p className = "error"> {errors.username?.message} </p>
                    </div>
                    <div>
                        <label
                            htmlFor = "password"
                            className = "block text-sm font-medium text-gray-700"
                        >
                        </label>
                        <input
                            type = "password"
                            id = "password"
                            className = "w-full border-0 border-b border-gray-300  focus:outline-none p-2"
                            style = {{
                                borderBottomColor: "#555555",
                                borderBottomWidth: "1.5px",
                            }}
                            placeholder = "Password"
                            {...register("password", {required: "Password is required"})}
                        />
                        <p className = "error"> {errors.password?.message} </p>
                    </div>
                    <button
                        type = "submit"
                        className = "button mt-6 font-bold hover:shadow-inner bg-primary-color-light-green hover:bg-primary-color-green"
                    >
                        Log In
                    </button>
                    <div className = "flex items-center justify-center py-3 mt-2">
                        <div className = "border-t border-gray-600 flex-grow mr-3 opacity-75"></div>
                        <span className = "text-gray-600 text-xs font-semibold opacity-75"> OR </span>
                        <div className = "border-t border-gray-600 flex-grow ml-3 opacity-75"></div>
                    </div>
                    <div className = "text-xs text-center p-2">
                        <Link
                            to = "/auth/user-signup"
                            className = "hover:text-primary-color-light-green font-semibold underline p-2 text-secondary-color-dark-green text-sm"
                        >
                            Sign up as a RallyRank Player!
                        </Link>
                    </div>
                    <div className = "text-sm text-center">
                        <Link
                            to = "/auth/user-verification"
                            className = "hover:text-primary-color-light-green p-2 text-secondary-color-dark-green"
                        >
                            Looking to verify? Click <span className = "underline"> here </span>
                        </Link>
                    </div>
                    </form>
                </div>
                <div className = "card p-7 rounded-[12px] bg-primary-color-white border-none items-center">
                    <div className = "text-md flex flex-row justify-center align-item font-semibold">
                        RallyRank Administrator?
                        <Link
                            to = "/administrator-login"
                            className = "hover:text-primary-color-light-green font-bold underline pl-2 text-secondary-color-dark-green"
                        >
                            Log in here!
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserLogin;