// Configuration imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Step1, Step2, Step3 } from "./admin-sign-up-components/SignUpSteps";

// Assets and Components Imports
import signupPicture from "../assets/admin-sign-up-picture.jpg";
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";


function AdministratorSignUp() {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, trigger, formState: { errors, isValid } } = useForm();

    const steps = [1, 2];
    const [step, setStep] = useState(1);
    const [clickableSteps, setClickableSteps] = useState([]); // Clickable steps, including the current step.
    const [completedSteps, setCompletedSteps] = useState([]); // Completed steps, displayed as green in color.
    const [submitDisabled, setSubmitDisabled] = useState(false); // Disable submit after first press

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const stepFields = {
        1: ["email", "adminName", "firstName", "lastName"],
        2: ["password", "confirmPassword"],
    };

    // Function to capitalize the first letter (for first name or last name)
    const capitalizeFirstLetter = (name) => name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

    const handleStepClick = async (stepNumber) => {
        const fieldsToValidate = stepFields[step];
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid && clickableSteps.includes(stepNumber)) {
            setClickableSteps([...clickableSteps, step]);
            setStep(stepNumber);
        }
    };

    async function checkCredentialsAvailablity(formData) {
        try {
            const response = await axios.get(
                `${API_URL}/auth/credentials-availability`,
                {
                    params: {
                        accountName: formData.adminName,
                        email: formData.email
                    },
                    withCredentials: true,
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
                            ? "Administrator username taken. Please enter another one."
                            : "Email address already in use. Please enter another one."
                );
            }
        } catch (error) {
            setWarningMessage("Unable to check credentials. Please reload the page and try again.");
            console.error("Error checking credentials:", error.response?.data?.error || error);
        }
    };

    // -------------------------- API Call: Create administrator account ---------------------------
    async function createAdmin(formData) {
        try {
            const response = await axios.post(
                `${API_URL}/auth/admin-signup`,
                {
                    adminName: formData.adminName,
                    email: formData.email,
                    password: formData.password,
                    firstName: capitalizeFirstLetter(formData.firstName),
                    lastName: capitalizeFirstLetter(formData.lastName),
                },
                {
                    withCredentials: true,
                },
            );
            if (response.status === 200) {
                setSuccessMessage("Account successfully created!")
                return response.data;
            }
        } catch (error) {
            setWarningMessage("Error occured during signup. Please try again.");
            setSignupError(error.response?.data?.error || "An error occurred during signup.");
            setSubmitDisabled(false);
        }
    };

    const onSubmit = async (formData) => {
        const fieldsToValidate = stepFields[step];
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            if (step === 1) {
                checkCredentialsAvailablity(formData);
            } else {
                setSubmitDisabled(true);
                const response = await createAdmin(formData);
                if (response !== undefined) {
                    setSuccessMessage("Successfully registered! Redirecting you to the verification page...");
                    setTimeout(() => {
                        navigate("/auth/admin-verification");
                    }, 2000);
                }
            }
        }
    };

    return (
        <>
            <div className = "bg-cover bg-center h-main w-screen flex flex-col items-center" style = {{ backgroundImage: `url(${signupPicture})` }}>
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
                <div className = "card rounded-[12px] bg-primary-color-white flex justify-center border p-10 mb-10">
                    <form onSubmit = {handleSubmit(onSubmit)}>
                        {step === 1 && <Step1 register = {register} errors = {errors} />}
                        {step === 2 && <Step2 register = {register} errors = {errors} watch = {watch} />}
                        <div className = "flex justify-evenly gap-5 pt-10">
                            <button
                                type = "submit"
                                className = {`font-bold border px-14 py-2 w-3/4 bg-primary-color-light-green text-primary-color-white hover:bg-primary-color-green transition duration-300 ease-in-out ${submitDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled = {submitDisabled}
                            >
                                {step === 2 ? "Submit" : "Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdministratorSignUp;