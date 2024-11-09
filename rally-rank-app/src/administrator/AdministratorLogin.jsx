// Configuration imports
import { API_URL } from '../../config';

// Authentication Imports
import { useAuth } from "../authentication/AuthContext";

// Package Imports
import axios from "axios";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Assets and Components Imports
import loginBackground from "../assets/login-picture.jpg";
import rallyRankLogo from "../assets/Rally-Rank-Logo.svg";
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

function AdministratorLogin() {
    const form = useForm();
    const navigate = useNavigate();
    const { loginAdmin } = useAuth();

    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // -------------------------- API Call: Authenticate administrator's login details ---------------------------
    async function authenticateAdmin(adminName, password) {
        try {
            const response = await axios.post(
                `${API_URL}/auth/admin-login`,
                {
                    adminName,
                    password,
                },
                {
                    withCredentials: true,
                },
            );

            if (response.status === 200) {
                return response.data;
            } else {
                console.log("response.data.error: ", response.data.error);
            }
        } catch (error) {
            const errorMessage = error.response.data.error;
            if (errorMessage === "Admin not found") {
                setWarningMessage("Administrator not found!");
            } else if (errorMessage === "Invalid password") {
                setWarningMessage("Invalid Password!");
            } else if (errorMessage === "Your account is not enabled. Please check your email to enable your account.") {
                setWarningMessage(errorMessage);
            } else {
                setWarningMessage("Unable to log in. Please reload the page and try again.");
            }
        }
    };

    const onSubmit = async (formData) => {
        const response = await authenticateAdmin(
            formData.adminName,
            formData.password
        );
        if (response !== undefined) {
            const adminData = {
                adminName: formData.adminName,
                role: "ADMIN",
                jwtToken: response.token,
                jwtExpiration: response.expiresIn,
            };
            loginAdmin(adminData);
            setSuccessMessage("Login Successful! Redirecting...");
            setTimeout(() => {
                navigate("/administrator-tournaments");
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
                            htmlFor = "adminName"
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
                            id = "adminName"
                            placeholder = "Administrator Username"
                            {...register("adminName", {required: "Admin Username is required"})}
                        />
                        <p className = "error"> {errors.adminName?.message} </p>
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
                            to = "/administrator-sign-up"
                            className = "hover:text-primary-color-light-green font-semibold underline p-2 text-secondary-color-dark-green text-sm"
                        >
                            Sign up as a RallyRank Administrator!
                        </Link>
                    </div>
                    <div className = "text-sm text-center">
                        <Link
                            to = "/auth/admin-verification"
                            className = "hover:text-primary-color-light-green p-2 text-secondary-color-dark-green"
                        >
                            Looking to verify? Click <span className = "underline"> here </span>
                        </Link>
                    </div>
                    </form>
                </div>
                <DevTool control = {control} />
                <div className = "card p-7 rounded-[12px] bg-primary-color-white border-none items-center">
                    <div className = "text-md flex flex-row justify-center align-item font-semibold">
                        RallyRank Player?
                        <Link
                            to = "/auth/user-login"
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

export default AdministratorLogin;