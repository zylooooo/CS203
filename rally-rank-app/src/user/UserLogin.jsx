// React imports
import { useEffect, useState } from "react";

// Navigation imports
import { Link, useNavigate } from "react-router-dom";

// Axios import
import axios from "axios";

// Form imports
import { useForm } from "react-hook-form";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

import loginBackground from "../assets/login-picture.jpg";
import rallyRankLogo from "../assets/Rally-Rank-Logo.svg"; // Import the RallyRank logo

import AlertMessageSuccess from "../components/AlertMessageSuccess"

function UserLogin() {
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const { loginUser, isUserLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState(""); 
    const [successMessage, setSuccessMessage] = useState("");

    // Used for persistent pages. Will redirect the user back to homepage upon reload of page
    useEffect(() => {
        if (isUserLoggedIn) {
            navigate("/users/home")
        }
    }, [navigate, isUserLoggedIn])

    async function authenticateUser(username, password) {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/user-login",
                { username, password },
                { withCredentials: true } // Allow credentials (cookies) to be sent with the request
            );

            if (response.status === 200) {
                setSuccessMessage("You have successfully logged in! Enjoy RallyRank.")

                // Return the LoginResponse object containing JWT and expiration time
                return response.data;
            }
        } catch (error) {
            setLoginError(error.response.data.error);
        }
    }

    async function retrieveUserData(jwtToken) {
        try {
            const response = await axios.get(
                "http://localhost:8080/users/profile",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${jwtToken}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching user data: ", error);
            return null;
        }
    }

    const onSubmit = async (formData) => {
        // Call the authenticateUser function with username and password
        const response = await authenticateUser(
            formData.username,
            formData.password
        );

        const userDataResponse = await retrieveUserData(response.token);

        if (response !== undefined) {
            // Store user in local database
            const userData = {
                username: formData.username,
                role: "USER",
                jwtToken: response.token,
                jwtExpiration: response.expiresIn,
                gender: userDataResponse.gender,
                available: userDataResponse.available,
            };
        
            // Change state to user
            loginUser(userData);

            // Re-route to home
            navigate("/users/home", { state: { successMessage: "You have successfully logged in! Enjoy RallyRank." } });
        } 
    };
    
    return (
        <>
            <div
                className="bg-cover bg-center flex flex-col justify-center items-center h-main w-screen overflow-hidden"
                style={{ backgroundImage: `url(${loginBackground})`, objectFit: 'cover', backgroundAttachment: 'fixed' }}
            >
                <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
                <div className="card rounded-[8px] bg-white border-none items-center my-8 overflow-hidden">
                    {/* Replace heading with RallyRank logo */}
                    <img className="h-[60px] w-auto mb-1" src={rallyRankLogo} alt="RallyRank Logo" />
                    <form
                        className="card px-0 py-4 border-none shadow-none bg-white"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                              
                            </label>
                            <input
                                className="w-full border-0 border-b border-gray-300  focus:outline-none p-2"
                                style={{
                                    borderBottomColor: "#555555",
                                    borderBottomWidth: "1.5px",
                                }}
                                type="text"
                                id="username"
                                placeholder="Username"
                                {...register("username", {
                                    required: "Username is required",
                                })}
                            />
                            <p className="error">{errors.username?.message}</p>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full border-0 border-b border-gray-300 focus:outline-none p-2"
                                style={{
                                    borderBottomColor: "#555555",
                                    borderBottomWidth: "1.5px",
                                }}
                                placeholder="Password"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                            />
                            <p className="error">{errors.password?.message}</p>
                        </div>

                        {loginError && (
                            <p className="error text-red-500 mt-2">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="button mt-6 font-bold hover:bg-primary-color-green bg-primary-color-light-green"
                        >
                            Log In
                        </button>
                        <div className="flex items-center justify-center py-3">
                            <div className="border-t border-gray-200 flex-grow mr-3 opacity-50"></div>
                            <span className="text-gray-199 text-xs opacity-50">
                                OR
                            </span>
                            <div className="border-t border-gray-00 flex-grow ml-3 opacity-50"></div>
                        </div>
                        <div className="text-xs text-center pt-2">
                            Don't have a RallyRank account?
                            <Link
                                to="/auth/user-signup"
                                className="hover:text-primary-color-green font-bold underline p-2 text-secondary-color-dark-green"
                            >
                                <br />
                                Sign up as a new player
                            </Link>
                        </div>
                        <div className="text-xs text-center pt-2">
                            <Link
                                to="/auth/user-verification"
                                className="hover:text-primary-color-light-green p-2 text-secondary-color-dark-green"
                            >
                                Looking to verify? Click here
                            </Link>
                        </div>
                    </form>
                </div>
                <div className="card p-7 rounded-[8px] bg-white border-none items-center">
                    <div className="text-ms flex flex-row justify-center align-item">
                        RallyRank Administrator?
                        <Link
                            to="/administrator-login"
                            className="hover:text-primary-color-light-green font-bold underline pl-2 text-secondary-color-dark-green"
                        >
                            Log in here!
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserLogin;
