import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Step1, Step2, Step3, Step4 } from "./user-sign-up-components/SignUpSteps";
import signupPicture from "../assets/user-sign-up-picture.jpg";

import { Link, useNavigate } from "react-router-dom";

// Axios import
import axios from "axios";

function UserSignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const { register, handleSubmit, watch, trigger, formState: { errors, isValid }} = useForm();

  const [step, setStep] = useState(1);
  const [clickableSteps, setClickableSteps] = useState([]); // clickable steps, including current step
  const [completedSteps, setCompletedSteps] = useState([]); // completed steps, displayed as green

  const [signupError, setSignupError] = useState("");

  const stepFields = {
    1: ["email", "username"],
    2: ["firstName", "lastName", "gender", "dob", "phone"],
    3: ["elo", "yearsOfExperience"],
    4: ["password", "confirmPassword"],
  };

  function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // If the current month is before the birth month, or if it's the same month but the current day is before the birth day, subtract 1 from age
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Function to check if the email & username are already in use
  async function checkCredentialsAvailablity(formData) {
    try {
      const response = await axios.get(
        "http://localhost:8080/users/signup/check-credentials-availability",
        {
          params: {
            username: formData.username,
            email: formData.email,
          },
         withCredentials: true  // Allow credentials (cookies) to be sent with the request
    });
  
       // // handle case where email & username are available/not available
       if (response.data.emailAvailable && response.data.usernameAvailable) {
          setCompletedSteps([...completedSteps, step]);
          setClickableSteps([...clickableSteps, step]);
          setStep(step + 1);
        } else {
          if (!response.data.usernameAvailable) {
            alert("Username is already taken.");
          }
          if (!response.data.emailAvailable) {
            alert("Email is already in use.");
          }
        }

    } catch (error) {
      console.error("Error checking credentials:", error);
      if (error.response) {
        console.log(error.response.data.error);
      }
    }
  }

  async function createUser(formData) {
    try {
      const response = await axios.post(
        "http://localhost:8080/auth/user-signup",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dob,
          age: calculateAge(formData.dob),
        },
        { withCredentials: true } // Allow credentials (cookies) to be sent with the request
      );

      if (response.status === 200) {
        // setStep(4);
        setSignupError(
          "Successfully registered! Please move on to verification!"
        );

        // Return the LoginResponse object containing JWT and expiration time
        return response.data;
      }
    } catch (error) {
      setSignupError(error.response.data.error);
    }
  }

  const onSubmit = async (formData) => {
    const fieldsToValidate = stepFields[step];
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      if (step === 1) {
        // Check if the email & username are already in use
        console.log("form data:", formData.email, formData.username);
        checkCredentialsAvailablity(formData);

      } else if (step < 3) {
        setCompletedSteps([...completedSteps, step]);
        setClickableSteps([...clickableSteps, step]);
        setStep(step + 1);
      } else {
        // Create account logic there
        const response = await createUser(formData);

        if (response !== undefined) {
          alert("Successfully registered! Please move on to verification!");
          navigate("/auth/user-verify");
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

  const steps = [1, 2, 3];

  return (
    <>
      {/* MAIN CONTAINER FOR BACKGROUND IMAGE */}
      <div
        className="bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col items-center"
        style={{ backgroundImage: `url(${signupPicture})` }}
      >
        {/* STEPS BUTTONS */}
        <div className="flex gap-9 p-10 mt-4">
          {steps.map((num) => (
            <div
              key={num}
              className={`font-bold text-xl flex justify-center items-center rounded-full w-10 h-10 p-6 
                ${
                  completedSteps.includes(num)
                    ? "bg-primary-color-green border-opacity-50"
                    : "bg-primary-color-white"
                } 
                ${step === num ? "scale-125" : ""} 
                ${
                  clickableSteps.includes(num)
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
              onClick={() => handleStepClick(num)}
            >
              {num}
            </div>
          ))}
        </div>

        {/* FORM CONTAINER */}
        <div className="card rounded-none bg-primary-color-white flex justify-center border p-10">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <Step1 register={register} errors={errors} email={email} />
            )}
            {step === 2 && <Step2 register={register} errors={errors} />}
            {step === 3 && (
              <Step3 register={register} errors={errors} watch={watch} />
            )}
            {/* {step === 4 && <Step4 register = {register} errors = {errors} />} */}

            {signupError && (
              <p className="error text-red-500 mt-10">{signupError}</p>
            )}
            <div className="flex justify-evenly gap-5 pt-10">
              <button
                type="submit"
                className="font-bold border px-14 py-2 w-3/4 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green transition duration-300 ease-in-out"
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
