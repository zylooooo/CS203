import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/login-picture.jpg";

// Axios import
import axios from "axios";

// Form imports
import { useForm } from "react-hook-form";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

async function resendCode(username) {}

function UserVerify() {
    const form = useForm();
    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;
    const { loginUser } = useAuth(); // Destructure loginUser from AuthContext
    const navigate = useNavigate(); // For navigation after verification
    const [verifyError, setVerifyError] = useState(""); // State for handling verification errors

    // Function to verify user with username and OTP code
    async function verifyUser(username, verificationCode) {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/user-verify",
                { username, verificationCode },
                { withCredentials: true } // Allow credentials (cookies) to be sent with the request
            );

            if (response.status === 200) {
                setVerifyError("Successfully verified!");
            }

            // Return the VerifyResponse object containing JWT and other info
            return response.data;
        } catch (error) {
            console.log(error.status);
            const status = error.status;

            if (status === 404) {
                setVerifyError("Username is not found!");
            } else if (status === 400) {
                setVerifyError(
                    "Verification code is expired, invalid, or user is already verified!"
                );
            } else if (status === 500) {
                setVerifyError(
                    "Internal server error. Contact rallyrank@gmail.com for help!"
                );
            }
        }
    }

    const onSubmit = async (formData) => {
        // Call the verifyUser function with username and otpCode
        const response = await verifyUser(formData.username, formData.otpCode);

        if (response !== undefined) {
            // Re-route to home after successful verification
            navigate("/auth/user-login");
        }
    };

    return (
        <>
            <div
                className="bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col justify-center items-center"
                style={{ backgroundImage: `url(${loginBackground})` }}
            >
                <div className="card rounded-none bg-primary-color-white border-none items-center m-8">
                    <h1 className="font-bold text-2xl bg-special-blue">
                        User Verification
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
                                htmlFor="verificationCode"
                                className="block text-sm font-medium text-gray-700"
                            >
                                OTP Code
                            </label>
                            <input
                                type="text"
                                id="verificationCode"
                                className="input"
                                placeholder="Enter OTP Code"
                                {...register("verificationCode", {
                                    required: "Verification code is required",
                                })}
                            />
                            <p className="error">
                                {errors.verificationCode?.message}
                            </p>
                        </div>

                        {verifyError && (
                            <p className="error text-red-500 mt-2">
                                {verifyError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="button mt-6 font-bold hover:shadow-inner"
                        >
                            Verify
                        </button>

                        <button
                            className="text-xs underline text-secondary-color-dark-green text-center pt-5 hover:text-primary-color-green"
                            onClick={resendCode}
                        >
                            Resend verification code
                        </button>
                    </form>
                </div>
                <div className="card p-7 rounded-none bg-primary-color-white border-none items-center">
                    <div className="text-ms flex flex-row justify-center align-item">
                        Already verified?
                        <Link
                            to="/auth/user-login"
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

export default UserVerify;
