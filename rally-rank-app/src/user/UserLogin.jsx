import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/login-picture.jpg";

// Axios import
import axios from "axios";

// Form imports
import { useForm } from "react-hook-form";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

function UserLogin() {
    const form = useForm();
    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;
    const { loginUser } = useAuth(); // Destructure loginUser from AuthContext
    const navigate = useNavigate(); // For navigation after login
    const [loginError, setLoginError] = useState(""); // State for handling login errors

    async function authenticateUser(username, password) {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/user-login",
                { username, password },
                { withCredentials: true } // Allow credentials (cookies) to be sent with the request
            );

            if (response.status === 200) {
                setLoginError("Successfully login!");

                // Return the LoginResponse object containing JWT and expiration time
                return response.data;
            }
        } catch (error) {
            const status = error.status;

            if (status === 404) {
                setLoginError("Username is not found!");
            } else if (status === 403) {
                setLoginError("Account is not verified!");
            } else if (status === 401) {
                setLoginError("Wrong password!");
            } else if (status === 500) {
                setLoginError(
                    "Internal server error. Contact rallyrank@gmail.com for help!"
                );
            }
        }
    }

    const onSubmit = async (formData) => {
        // Call the authenticateUser function with username and password
        const response = await authenticateUser(
            formData.username,
            formData.password
        );

        if (response !== undefined) {
            // Store user in local database
            const userData = {
                username: formData.username,
                role: "USER",
                jwtToken: response.token,
            };

            // Change state to user
            loginUser(userData);

            // Re-route to home
            navigate("/users/home");
        }
    };

    return (
        <>
            <div
                className="bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col justify-center items-center"
                style={{ backgroundImage: `url(${loginBackground})` }}
            >
                {/* TESTING CODE REMOVE LATER */}
                <button
                    type="button"
                    className="button mt-6 font-bold hover:shadow-inner"
                    onClick={() => {
                        loginUser({ name: "Test User", role: "user" });
                        navigate("/users/home");
                    }}
                >
                    Manual User Login
                </button>
                <div className="card rounded-none bg-primary-color-white border-none items-center m-8">
                    <h1 className="font-bold text-2xl bg-special-blue">
                        Player Login
                    </h1>
                    <form
                        className="card px-0 py-4 border-none shadow-none bg-primary-color-white"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                className="input"
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
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="input"
                                placeholder="••••••••"
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
                            className="button mt-6 font-bold hover:shadow-inner"
                        >
                            Log In
                        </button>
                        <div className="flex items-center justify-center py-3">
                            <div className="border-t border-gray-100 flex-grow mr-3 opacity-50"></div>
                            <span className="text-gray-199 text-xs opacity-50">
                                OR
                            </span>
                            <div className="border-t border-gray-100 flex-grow ml-3 opacity-50"></div>
                        </div>
                        <div className="text-xs text-center pt-2">
                            Don't have a RallyRank account?
                            <Link
                                to="/sign-up"
                                className="hover:text-primary-color-green font-bold underline p-2 text-secondary-color-dark-green"
                            >
                                <br />
                                Sign up as a new player
                            </Link>
                        </div>
                        <div className="text-xs text-center pt-2">
                            <Link
                                to="/auth/user-verify"
                                className="hover:text-primary-color-green p-2 text-secondary-color-dark-green"
                            >
                                Looking to verify? Click here
                            </Link>
                        </div>
                    </form>
                </div>
                <div className="card p-7 rounded-none bg-primary-color-white border-none items-center">
                    <div className="text-ms flex flex-row justify-center align-item">
                        RallyRank Administrator?
                        <Link
                            to="/administrator-login"
                            className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
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
