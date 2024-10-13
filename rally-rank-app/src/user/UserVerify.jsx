import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/login-picture.jpg";

// Axios import
import axios from "axios";

// Form imports
import { useForm } from "react-hook-form";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

async function resendCode(username, setResendError) {
    try {
        const response = await axios.post(
            "http://localhost:8080/auth/user-resend",
            { username },
            { withCredentials: true }
        );
        if (response.status === 200) {
            setResendError("Verification code resent successfully!");
        }
    } catch (error) {
        const status = error.status;

        if (status === 400) {
            setResendError("User is already verified!");
        } else if (status === 404) {
            setResendError("User is not found!");
        } else if (status === 500) {
            setResendError(
                "Internal server error. Please try again or contact support."
            );
        } else {
            setResendError("Failed to resend code. Please try again.");
        }
    }
}

function UserVerify() {
    const form = useForm();
    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;
    const { loginUser } = useAuth(); // Destructure loginUser from AuthContext
    const navigate = useNavigate(); // For navigation after verification
    const [verifyError, setVerifyError] = useState(""); // State for handling verification errors

    // State to manage modal visibility
    const [isModalOpen, setModalOpen] = useState(false);
    const [resendEmail, setResendEmail] = useState(""); // Email for resending the verification code
    const [resendError, setResendError] = useState(""); // State for handling resend errors

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
        const response = await verifyUser(
            formData.username,
            formData.verificationCode
        );

        if (response !== undefined) {
            // Re-route to home after successful verification
            navigate("/auth/user-login");
        }
    };

    // Handle modal form submit to resend code
    const handleResendSubmit = async (event) => {
        event.preventDefault();
        await resendCode(resendEmail, setResendError); // Pass setResendError to update error state
    };

    return (
        <>
            {!isModalOpen && (
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
                                <p className="error">
                                    {errors.username?.message}
                                </p>
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
                                        required:
                                            "Verification code is required",
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
                        </form>
                        <button
                            className="text-xs underline text-secondary-color-dark-green text-center pt-5 hover:text-primary-color-green"
                            onClick={() => setModalOpen(true)} // Open modal on click
                        >
                            Resend verification code
                        </button>
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
            )}

            {/* Modal for resending code */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white p-6 rounded-md shadow-lg">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-bold">
                                Resend Verification Code
                            </h2>
                            <button
                                type="button"
                                className="border p-1"
                                onClick={() => setModalOpen(false)} // Close modal on cancel
                            >
                                X
                            </button>
                        </div>
                        <form onSubmit={handleResendSubmit}>
                            <div>
                                <label
                                    htmlFor="resendEmail"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Enter your email to resend the code
                                </label>
                                <input
                                    type="text"
                                    id="resendEmail"
                                    className="input"
                                    placeholder="Your email"
                                    value={resendEmail}
                                    onChange={(e) =>
                                        setResendEmail(e.target.value)
                                    } // Update email state
                                    required
                                />

                                {resendError && (
                                    <p className="error text-red-500 mt-2">
                                        {resendError}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="button mt-4 font-bold hover:shadow-inner"
                            >
                                Resend Code
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserVerify;
