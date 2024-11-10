// Configuration Imports
import { API_URL } from '../../config';

// Icons Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faTimes } from "@fortawesome/free-solid-svg-icons";

// Package Imports
import axios from 'axios';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

// Assets and Components Imports
import rallyRankLogo from "../assets/Rally-Rank-Logo.svg";
import loginBackground from "../assets/login-picture.jpg";
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

function UserVerification() {
    const form = useForm();
    const modalForm = useForm();
    const navigate = useNavigate();

    const { register, handleSubmit, formState } = form;
    const { errors } = formState;

    // Consts: State to manage modal visibility
    const [isModalOpen, setModalOpen] = useState(false);
    const [isResendDisabled, setResendDisabled] = useState(false);

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // -------------------------- API Call: Verify user's account with OTP and username ---------------------------
        async function verifyUser(username, verificationCode) {
        try {
            const response = await axios.post(
               `${API_URL}/auth/user-verification`,
                {
                    username,
                    verificationCode
                },
                { 
                    withCredentials: true,
                },
            );

            if (response.status === 200) {
                return response.data;
            }

        } catch (error) {
            setWarningMessage("Unable to verify credentials. Please reload and try again.");
        }
    };

    const onVerifyUserSubmit = async (formData) => {
        const response = await verifyUser(
            formData.username,
            formData.verificationCode
        );

        if (response !== undefined) {
            setSuccessMessage("Successfully verified! Redirecting you to RallyRank user login page...")
            setTimeout(() => {
                navigate("/auth/user-login");
            }, 2000);
        }
    };

    // -------------------------- API Call: Resend the verification code ---------------------------
    async function resendVerificationCode(email) {
        setResendDisabled(true);
        try {
            const response = await axios.post(
                `${API_URL}/auth/reverification`,
                {
                    email
                },
            );

            if (response.status === 200) {
                return response;
            }

        } catch (error) {
            const status = error.status;
            if (status === 400) {
                setWarningMessage("User already verified!");
            } else if (status === 404) {
                setWarningMessage("User is not found!");
            } else if (status === 500) {
                setWarningMessage("Internal Server Error. Please reload the page and try again.");
            }
        } finally {
            setResendDisabled(false);
        }
    };

    // Function: Handle modal form submit to resend code
    const onResendVerificationCodeSubmit = async (formData) => {
        const response = await resendVerificationCode(formData.email);
        if (response) {
            setSuccessMessage("Verification code has been sent to your email.")
            setTimeout(() => {}, 2000);
            setModalOpen(false);
        }
    };

    return (
        <>
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            {!isModalOpen && (
                <div
                    className = "bg-cover bg-center h-main w-screen flex flex-col justify-center items-center"
                    style = {{ backgroundImage: `url(${loginBackground})` }}
                >
                    <div className = "card rounded-[12px] bg-white border-none items-center mb-8">
                        <img className = "h-[60px] w-auto mb-2" src = {rallyRankLogo} alt = "RallyRank Logo" />
                        <h1 className = "font-bold text-2xl bg-special-blue">
                            User Verification
                        </h1>
                        <form
                            className = "card px-0 py-4 border-none shadow-none bg-white"
                            onSubmit = {handleSubmit(onVerifyUserSubmit)}
                            noValidate
                        >
                            <div>
                                <label
                                    htmlFor = "username"
                                    className = "block text-sm font-medium text-gray-700 mb-2"
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
                                    {...register("username", {
                                        required: "Username is required!",
                                    })}
                                />
                                <p className = "error">
                                    {errors.username?.message}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor = "verificationCode"
                                    className = "block text-sm font-medium text-gray-700 mb-2"
                                >
                                </label>
                                <input
                                    type = "text"
                                    id = "verificationCode"
                                    className = "w-full border-0 border-b border-gray-300  focus:outline-none p-2"
                                    style = {{
                                        borderBottomColor: "#555555",
                                        borderBottomWidth: "1.5px",
                                    }}
                                    placeholder = "Enter Verification Code"
                                    {...register("verificationCode", {
                                        required:
                                            "Verification code is required!",
                                    })}
                                />
                                <p className = "error">
                                    {errors.verificationCode?.message}
                                </p>
                            </div>
                            <button
                                type = "submit"
                                className = "button mt-6 font-bold hover:shadow-inner"
                            >
                                Verify Account
                            </button>
                        </form>
                        <button
                            className = "text-sm font-semibold underline text-secondary-color-dark-green text-center pt-5 hover:text-primary-color-light-green"
                            onClick = {() => setModalOpen(true)}
                        >
                            <FontAwesomeIcon icon = {faSync} className = "mr-2 text-xs" />Resend Verification Code
                        </button>
                    </div>
                    <div className = "card p-7 rounded-[12px] bg-white border-none items-center">
                        <div className = "text-md flex flex-row justify-center align-item font-semibold">
                            Already verified?
                            <Link
                                to = "/auth/user-login"
                                className = "hover:text-primary-color-light-green font-bold underline pl-2 text-secondary-color-dark-green"
                            >
                                Log in here!
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className = "bg-white p-6 rounded-md shadow-lg">
                        <div className = "flex justify-between gap-2 items-center">
                            <h2 className = "text-xl font-bold mb-5">
                                Resend Verification Code
                            </h2>
                            <button
                                type = "button"
                                className = "flex items-center justify-center w-5 h-5 p-1 text-center rounded-none"
                                onClick = {() => setModalOpen(false)}
                            >
                                <FontAwesomeIcon icon = {faTimes} className = "text-xl mb-4"/>
                            </button>
                        </div>
                        <form onSubmit = {modalForm.handleSubmit(onResendVerificationCodeSubmit)} className="flex flex-col ">
                            <div>
                                <label
                                    htmlFor = "resendEmail"
                                    className = "block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Enter your email address to resend the verification code
                                </label>
                                <input
                                    type = "email"
                                    id = "resendEmail"
                                    className = "w-full border-0 border-b border-gray-300 focus:outline-none p-2 mb-3"
                                    style = {{
                                        borderBottomColor: "#555555",
                                        borderBottomWidth: "1.5px",
                                    }}
                                    placeholder = "helloworld@gmail.com"
                                    {...modalForm.register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: "Invalid email format",
                                        },
                                    })}
                                />
                                <p className = "error"> {errors.email?.message} </p>
                            </div>
                            <button
                                type = "submit"
                                className = "button mt-4 font-bold hover:shadow-inner"
                                disabled = {isResendDisabled}
                            >
                                Resend Verification Code
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserVerification;