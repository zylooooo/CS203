// Configuration imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Step1, Step2, Step3 } from "./admin-sign-up-components/SignUpSteps";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";
import signupPicture from "../assets/admin-sign-up-picture.jpg";

function AdministratorSignUp() {
    const navigate = useNavigate();
    const steps = [1, 2];
    const { register, handleSubmit, watch, trigger, formState: { errors, isValid } } = useForm();
    const [step, setStep] = useState(1);
    const [clickableSteps, setClickableSteps] = useState([]); // Clickable steps, including the current step.
    const [completedSteps, setCompletedSteps] = useState([]); // Completed steps, displayed as green in color.
    const [signupError, setSignupError] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false); // Disable submit after first press

    const stepFields = {
        1: ["email", "adminName", "firstName", "lastName"],
        2: ["password", "confirmPassword"],
    };

    const capitalizeFirstLetter = (name) => name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";
    const lowercaseAdminName = (adminUsername) => adminUsername ? adminUsername.toLowerCase() : "";

    const onSubmit = async (formData) => {
        const fieldsToValidate = stepFields[step];
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            if (step === 1) {
                checkCredentialsAvailablity(formData);
            } else {
                setSubmitDisabled(true); // Disable submit button after submission
                const response = await createAdmin(formData);
                if (response !== undefined) {
                    alert("Successfully registered! Please move on to verification!");
                    navigate("/auth/admin-verification");
                }
            }
        }
    };

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
                "http://localhost:8080/auth/credentials-availability",
                {
                    params: { accountName: formData.adminName, email: formData.email },
                    withCredentials: true
                }
            );
            if (response.data.accountNameAvailable && response.data.emailAvailable) {
                setCompletedSteps([...completedSteps, step]);
                setClickableSteps([...clickableSteps, step]);
                setStep(step + 1);
            } else {
                setAlertMessage(
                    !response.data.accountNameAvailable && !response.data.emailAvailable
                        ? "Both username and email address entered has already been taken."
                        : !response.data.accountNameAvailable
                            ? "Administrator username taken. Enter another one."
                            : "Email address already in use. Please enter another one."
                );
            }
        } catch (error) {
            console.error("Error checking credentials:", error.response?.data?.error || error);
        }
    }

    async function createAdmin(formData) {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/admin-signup",
                {
                    adminName: lowercaseAdminName(formData.adminName),
                    email: formData.email,
                    password: formData.password,
                    firstName: capitalizeFirstLetter(formData.firstName),
                    lastName: capitalizeFirstLetter(formData.lastName),
                },
                { withCredentials: true }
            );
            if (response.status === 200) {
                setSignupError("Successfully registered! Please move on to verification!");
                return response.data;
            }
        } catch (error) {
            setSignupError(error.response?.data?.error || "An error occurred during signup.");
            setSubmitDisabled(false); // Re-enable submit button if there's an error
        }
    }

    return (
        <>
            <div
                className="bg-cover bg-center h-main w-screen flex flex-col items-center"
                style={{ backgroundImage: `url(${signupPicture})` }}
            >
                <AlertMessageWarning message={alertMessage} onClose={() => setAlertMessage("")} />
                <div className="flex gap-9 p-10 mt-4">
                    {steps.map((num) => (
                        <div
                            key={num}
                            className={`font-bold text-xl flex justify-center items-center rounded-full w-10 h-10 p-6 
                                ${completedSteps.includes(num) ? "bg-primary-color-light-green border-opacity-50" : "bg-primary-color-white"} 
                                ${step === num ? "scale-125" : ""} 
                                ${clickableSteps.includes(num) ? "cursor-pointer" : "cursor-default"}`}
                            onClick={() => handleStepClick(num)}
                        >
                            {num}
                        </div>
                    ))}
                </div>

                <div className="card rounded-none bg-primary-color-white flex justify-center border p-10">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step === 1 && <Step1 register={register} errors={errors} />}
                        {step === 2 && <Step2 register={register} errors={errors} watch={watch} />}

                        <div className="flex justify-evenly gap-5 pt-10">
                            <button
                                type="submit"
                                className={`font-bold border px-14 py-2 w-3/4 bg-primary-color-light-green text-primary-color-white hover:bg-primary-color-green transition duration-300 ease-in-out ${submitDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={submitDisabled}
                            >
                                {step === 2 ? "Submit" : "Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AdministratorSignUp;
