// Configuration Imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";

// Assets and Components Imports
import signupPicture from "../assets/user-sign-up-picture.jpg";
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";
import { Step1, Step2, Step3 } from "./user-sign-up-components/SignUpSteps";

function UserSignUp() {
    const location = useLocation();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, trigger, formState: { errors }} = useForm();

    const { email } = location.state || {};

    const steps = [1, 2, 3];
    const [step, setStep] = useState(1);
    const [clickableSteps, setClickableSteps] = useState([]);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    
    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [signupError, setSignupError] = useState("");

    const stepFields = {
        1: ["email", "username"],
        2: ["firstName", "lastName", "gender", "dob", "phone"],
        3: ["password", "confirmPassword"],
    };

    // Function to capitalize the first letter (for first name or last name)
    const capitalizeFirstLetter = (name) => name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

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

    const handleStepClick = async (stepNumber) => {
        const fieldsToValidate = stepFields[step];
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid && clickableSteps.includes(stepNumber)) {
            setClickableSteps([...clickableSteps, step]);
            setStep(stepNumber);
        }
    };

    // -------------------------- API Call: Check availability of credentials ---------------------------
    async function checkCredentialsAvailablity(formData) {
        try {
            const response = await axios.get(
                `${API_URL}/auth/credentials-availability`,
                {
                    params: {
                        accountName: formData.username,
                        email: formData.email,
                    },
                    withCredentials: true
                }
            );
            if (response.data.accountNameAvailable && response.data.emailAvailable) {
                setCompletedSteps([...completedSteps, step]);
                setClickableSteps([...clickableSteps, step]);
                setStep(step + 1);
            } else {
                setWarningMessage(
                    !response.data.accountNameAvailable && !response.data.emailAvailable
                        ? "Both account name and email address entered has already been taken."
                        : !response.data.accountNameAvailable
                            ? "Username taken. Please enter another one."
                            : "Email address already in use. Please enter another one."
                );
            }
        } catch (error) {
            setWarningMessage("Unable to check credentials. Please reload the page and try again.");
            console.error("Error checking credentials:", error);
        }
    };

    // -------------------------- API Call: Create user account ---------------------------
    async function createUser(formData) {
        try {
            const response = await axios.post(
                `${API_URL}/auth/user-signup`,
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    firstName: capitalizeFirstLetter(formData.firstName),
                    lastName: capitalizeFirstLetter(formData.lastName),
                    phoneNumber: formData.phone,
                    gender: formData.gender,
                    dateOfBirth: formData.dob,
                    age: calculateAge(formData.dob),
                },
                {
                    withCredentials: true
                },
            );
            if (response.status === 200) {
                setSuccessMessage("Account successfully created!");
                return response.data;
            }
        } catch (error) {
            setWarningMessage("Error occured during registration. Please try again.");
            setSignupError(error.response?.data?.error || "An error occured during signup.");
            setSubmitDisabled(false);
        }
    };

    const onSubmit = async (formData) => {
        const fieldsToValidate = stepFields[step];
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            if (step === 1) {
                checkCredentialsAvailablity(formData);
            } else if (step < 3) {
                setCompletedSteps([...completedSteps, step]);
                setClickableSteps([...clickableSteps, step]);
                setStep(step + 1);
            } else {
                setSubmitDisabled(true);
                const response = await createUser(formData);
                if (response !== undefined) {
                    setSuccessMessage("Successfully registered! Redirecting you to the verification page...");
                    setTimeout(() => {
                        navigate("/auth/user-verification", {state: {username: formData.username}});
                    }, 1500);
                }
            }
        }
    };

    return (
        <>
            <div className = "bg-cover bg-center h-main w-full flex flex-col items-center" style = {{ backgroundImage: `url(${signupPicture})` }}>
                <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
                <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
                <div className = "flex gap-9 p-10 mt-4">
                    {steps.map((stepNumber) => (
                        <div
                            key = {stepNumber}
                            className = {`font-bold text-xl flex justify-center items-center rounded-full w-10 h-10 p-6
                                ${completedSteps.includes(stepNumber) ? "bg-primary-color-light-green border-opacity-50" : "bg-gray-300"}
                                ${step === stepNumber ? "scale-110" : ""}
                                ${clickableSteps.includes(stepNumber) ? "cursor-pointer" : "cursor-default"}`}
                            onClick = {() => handleStepClick(stepNumber)}
                        >
                            {stepNumber}
                        </div>
                    ))}
                </div>
                <div className = "card rounded-[12px] bg-primary-color-white flex justify-center border p-10 mb-10 m-8">
                    <form onSubmit = {handleSubmit(onSubmit)}>
                        {step === 1 && <Step1 register = {register} errors = {errors} email = {email || ""} />}
                        {step === 2 && <Step2 register = {register} errors = {errors} />}
                        {step === 3 && <Step3 register = {register} errors = {errors} watch = {watch} />}
                        {signupError && (
                            <p className = "error text-red-500 mt-10"> {signupError} </p>
                        )}
                        <div className = "flex justify-evenly gap-5 pt-10">
                            <button
                                type = "submit"
                                className = {`font-bold border px-14 py-2 w-3/4 bg-primary-color-light-green text-primary-color-white hover:bg-primary-color-green transition duration-300 ease-in-out ${submitDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled = {submitDisabled}
                            >
                                {step === 3 ? "Submit" : "Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UserSignUp;