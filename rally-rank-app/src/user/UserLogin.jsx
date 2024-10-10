import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/login-picture.jpg";

// Form imports
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

function UserLogin() {
    const form = useForm();
    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;
    const { loginUser } = useAuth(); // Destructure loginUser from AuthContext
    const navigate = useNavigate(); // For navigation after login
    const [loginError, setLoginError] = useState(""); // State for handling login errors

    const onSubmit = async (data) => {
        try {
            // Implement your API call for user authentication
            const response = await authenticateUser(data.email, data.password);
            
            if (response.success) {
                // Assume response.user contains user data
                loginUser(response.user); // Update AuthContext with user data
                navigate("/home"); // Redirect to user home page
            } else {
                // Handle authentication failure
                setLoginError(response.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <>
        <div className="bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col justify-center items-center" style={{ backgroundImage: `url(${loginBackground})` }}>
        {/* TESTING CODE REMOVE LATER */}
        <button
            type="button"
            className="button mt-6 font-bold hover:shadow-inner"
            onClick={() => {
                loginUser({ name: "Test User", role: "user" });
                navigate("/home");
            }}
        >
        Manual User Login
        </button>
            <div className = "card rounded-none bg-primary-color-white border-none items-center m-8">
                <h1 className=" font-bold text-2xl bg-special-blue">
                    Player Login
                </h1>
                <form
                    className="card px-0 py-4 border-none shadow-none bg-primary-color-white"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            className="input"
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            {...register("email", {
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email format",
                                },
                                required: "Email is required",
                            })}
                        />
                        <p className="error">{errors.email?.message}</p>
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
                        <p className="error text-red-500 mt-2">{loginError}</p>
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
                </form>
                <DevTool control={control} />
                </div>
                <div className = "card p-7 rounded-none bg-primary-color-white border-none items-center">
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