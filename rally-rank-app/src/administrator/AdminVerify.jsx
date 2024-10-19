import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import background from "../assets/admin-sign-up-picture.jpg";

// Axios import
import axios from "axios";

// Form imports
import { useForm } from "react-hook-form";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext


function AdminVerify() {
    const form = useForm();
    const modalForm = useForm();

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
    async function verifyAdmin(adminName, verificationCode) {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/admin-verify",
                { adminName, verificationCode },
                { withCredentials: true } // Allow credentials (cookies) to be sent with the request
            );

            if (response.status === 200) {
                setVerifyError("Successfully verified!");
                alert("Successfully verified!");
            }

            // Return the VerifyResponse object containing JWT and other info
            return response.data;
        } catch (error) {
            setVerifyError(error.response.data.error)
        }
    }

    const onVerifyAdminSubmit = async (formData) => {
        // Call the verifyUser function with username and otpCode
        const response = await verifyAdmin(
            formData.adminName,
            formData.verificationCode
        );

        if (response !== undefined) {
            // Re-route to home after successful verification
            navigate("/auth/administrator-login");
        }
    };

    async function resendVerificationCode(email) {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/resend-verification",
                { email }
            );
            if (response.status === 200) {
                setResendError("Verification code resent successfully!");
                alert("Verification code resent successfully!")

                return response;
            }
        } catch (error) {
            const status = error.status;
    
            if (status === 400) {
                setResendError("Admin is already verified!");
            } else if (status === 404) {
                setResendError("Admin is not found!");
            } else if (status === 500) {
                setResendError(
                    "Internal server error. Please try again or contact support."
                );
            }
        }
    }

    // Handle modal form submit to resend code
    const onResendVerificationCodeSubmit = async (formData) => {
        const response = await resendVerificationCode(formData.email);

        if (response) {
            setModalOpen(false);
        }
    };

    return (
        <>
            {!isModalOpen && (
                <div
                    className="bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col justify-center items-center"
                    style={{ backgroundImage: `url(${background})` }}
                >
                    <div className="card rounded-none bg-primary-color-white border-none items-center m-8">
                        <h1 className="font-bold text-2xl bg-special-blue">
                            Admin Verification
                        </h1>
                        <form
                            className="card px-0 py-4 border-none shadow-none bg-primary-color-white"
                            onSubmit={handleSubmit(onVerifyAdminSubmit)}
                            noValidate
                        >
                            <div>
                                <label
                                    htmlFor="adminName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Admin Username
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    id="adminName"
                                    placeholder="Admin Username"
                                    {...register("adminName", {
                                        required: "Admin Username is required",
                                    })}
                                />
                                <p className="error">
                                    {errors.adminName?.message}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="verificationCode"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="verificationCode"
                                    className="input"
                                    placeholder="Enter verification code"
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
                            onClick={() => setModalOpen(true)}
                        >
                            Resend verification code
                        </button>
                    </div>
                    <div className="card p-7 rounded-none bg-primary-color-white border-none items-center">
                        <div className="text-ms flex flex-row justify-center align-item">
                            Already verified?
                            <Link
                                to="/auth/administrator-login"
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
                        <div className="flex justify-between gap-2 items-center">
                            <h2 className="text-xl font-bold">
                                Resend Verification Code
                            </h2>
                            <button
                                type="button"
                                className="flex items-center justify-center border w-5 h-5 p-1 text-center rounded-none"
                                onClick={() => setModalOpen(false)}
                            >
                                X
                            </button>
                        </div>
                        <form onSubmit={modalForm.handleSubmit(onResendVerificationCodeSubmit)} className="flex flex-col ">
                            <div>
                                <label
                                    htmlFor="resendEmail"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Enter your email to resend the code
                                </label>
                                <input
                                    type="email"
                                    id="resendEmail"
                                    className="input"
                                    placeholder="helloworld@gmail.com"
                                    {...modalForm.register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: "Invalid email format",
                                        },
                                    })}
                                />
                                <p className = "error">{errors.email?.message}</p>

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

export default AdminVerify;
