// Package Imports
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";


// Assets and Components Imports
import signupPicture from "../assets/user-sign-up-picture.jpg";
import AlertMessageWarning from "../components/AlertMessageWarning";
import AlertMessageSuccess from "../components/AlertMessageSuccess"
import { Step1, Step2, Step3 } from "./user-sign-up-components/SignUpSteps";

function UserSignUp() {
    const location = useLocation();
    const navigate = useNavigate();
    const steps = [1, 2, 3];
    const [step, setStep] = useState(1);
    const { email } = location.state || {};
    const [signupError, setSignupError] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { register, handleSubmit, watch, trigger, formState: { errors }} = useForm();
    const [clickableSteps, setClickableSteps] = useState([]); // Clickable steps, including the current step.
    const [completedSteps, setCompletedSteps] = useState([]); // Completed steps, displayed as green in color.
    
    const stepFields = {
        1: ["email", "username"],
        2: ["firstName", "lastName", "gender", "dob", "phone"],
        3: ["password", "confirmPassword"],
    };

    const handleStepClick = async (stepNumber) => {
        const fieldsToValidate = stepFields[step];
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid && clickableSteps.includes(stepNumber)) {
            setClickableSteps([...clickableSteps, step]);
            setStep(stepNumber);
        }
    };

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

    // Function to capitalize the first letter of the user's first name and last name.
    const capitalizeFirstLetter = (name) => {
        if (!name) {
            return "";
        }
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    // Function to lowercase the user's username
    const lowercaseUsername = (username) => {
        if (!username) {
            return "";
        }
        return username.toLowerCase();
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
                const response = await createUser(formData);
                if (response !== undefined) {
                setSuccessMessage("You have successfully verified and account! Login to enter RallyRank!"); // may need to let state enter to authverify
                navigate("/auth/user-verify");
                }
            }
        }
    };

    // API Call: Checking availibility of username and email address.
    async function checkCredentialsAvailablity(formData) {
        try {
            const response = await axios.get(
            "http://localhost:8080/auth/check-credentials-availability",
            {
                params: {
                accountName: formData.username,
                email: formData.email,
                },
                withCredentials: true
            });
            if (response.data.accountNameAvailable && response.data.emailAvailable) {
                setCompletedSteps([...completedSteps, step]);
                setClickableSteps([...clickableSteps, step]);
                setStep(step + 1);
                setAlertMessage("Both username and email address are available");
            } else {
                if (!response.data.accountNameAvailable && !response.data.emailAvailable) {
                    setAlertMessage("Both username and email address entered has already been taken.");
                }
                else if (!response.data.accountNameAvailable) {
                    setAlertMessage("Username taken. Enter another one.");
                }
                else if (!response.data.emailAvailable) {
                    setAlertMessage("Email address already in use. Please enter another one.");
                }
            }
        } catch (error) {
            alert("catch error");
            console.error("Error checking credentials:", error);
            if (error.response) {
                console.log(error.response.data.error);
            }
        }
    }

    // API Call: Creating the user profile to be sent to backend.
    async function createUser(formData) {
        try {
            const response = await axios.post(
            "http://localhost:8080/auth/user-signup",
            {
                username: lowercaseUsername(formData.username),
                email: formData.email,
                password: formData.password,
                firstName: capitalizeFirstLetter(formData.firstName),
                lastName: capitalizeFirstLetter(formData.lastName),
                phoneNumber: formData.phone,
                gender: formData.gender,
                dateOfBirth: formData.dob,
                age: calculateAge(formData.dob),
            },
            { withCredentials: true }
          );
    
          if (response.status === 200) {
            setSignupError("Successfully registered! Please move on to verification!");
            return response.data;
          }

        } catch (error) {
            setSignupError(error.response.data.error);
        }
    }

    return (
        <>
            <div
                className = "bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col items-center"
                style = {{ backgroundImage: `url(${signupPicture})` }}
            >
                <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
                <AlertMessageWarning message = {alertMessage} onClose = {() => setAlertMessage("")} />
                <div className = "flex gap-9 p-10 mt-4">
                    {steps.map((num) => (
                        <div
                            key = {num}
                            className = {`font-bold text-xl flex justify-center items-center rounded-full w-10 h-10 p-6 
                                ${
                                completedSteps.includes(num)
                                    ? "bg-primary-color-green border-opacity-50"
                                    : "bg-primary-color-white"
                                } 
                                ${step === num ? "scale-110" : ""} 
                                ${
                                clickableSteps.includes(num)
                                    ? "cursor-pointer"
                                    : "cursor-default"
                                }`}
                            onClick = {() => handleStepClick(num)}
                        >
                            {num}
                        </div>
                    ))}
                </div>

                <div className = "card rounded-none bg-primary-color-white flex justify-center border p-10">
                    <form onSubmit = {handleSubmit(onSubmit)}>
                        {step === 1 && (
                            <Step1 register = {register} errors = {errors} email = {email} />
                        )}
                        {step === 2 && <Step2 register = {register} errors = {errors} />}
                        {step === 3 && (
                            <Step3 register = {register} errors = {errors} watch = {watch} />
                        )}
                        {signupError && (
                            <p className = "error text-red-500 mt-10"> {signupError} </p>
                        )}
                        <div className = "flex justify-evenly gap-5 pt-10">
                        <button
                            type = "submit"
                            className = "font-bold border px-14 py-2 w-3/4 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green transition duration-300 ease-in-out"
                        >
                            {step === 3 ? "Submit" : "Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
  );
}

export default UserSignUp;