import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Step1, Step2, Step3 } from "./admin-sign-up-components/SignUpSteps";
import signupPicture from "../assets/admin-sign-up-picture.jpg";
import axios from "axios";

function AdminSignUp() {
  const navigate = useNavigate();

  const { register, handleSubmit, watch, trigger, formState: { errors , isValid}} = useForm();

  const [step, setStep] = useState(1);
  const [clickableSteps, setClickableSteps] = useState([]); // clickable steps, including current step
  const [completedSteps, setCompletedSteps] = useState([]); // completed steps, displayed as green

  const [signupError, setSignupError] = useState("");

  const stepFields = {
    1: ["email", "adminName", "firstName", "lastName"],
    2: ["password", "confirmPassword"],
  };

    // CHECK IF EMAIL & ADMINNAME ARE AVAILABLE
    async function checkCredentialsAvailablity(formData) {
      try {
        const response = await axios.get(
          "http://localhost:8080/auth/check-credentials-availability",
          {
            params: {
              accountName: formData.adminName,
              email: formData.email,
            },
           withCredentials: true  
      });
    
         // IF AVAILABLE, PROCEED TO NEXT STEP
         // IF UNAVAILABLE, ALERT USER
         if (response.data.accountNameAvailable && response.data.emailAvailable) {
            setCompletedSteps([...completedSteps, step]);
            setClickableSteps([...clickableSteps, step]);
            setStep(step + 1);
          } else {
            alert(response.data.message);
          }
  
      } catch (error) {
        console.error("Error checking credentials:", error);
        if (error.response) {
          console.log(error.response.data.error);
        }
      }
    }
    
    // CREATE ADMIN ACCOUNT
    async function createAdmin(formData) {
      try {
        const response = await axios.post(
          "http://localhost:8080/auth/admin-signup",
          {
            adminName: formData.adminName,
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          { withCredentials: true } 
        );
  
        if (response.status === 200) {
          setSignupError(
            "Successfully registered! Please move on to verification!"
          );
  
          return response.data;
        }
      } catch (error) {
        setSignupError(error.response.data.error);
      }
    }
  
    // HANDLE CONTINUE / SUBMIT BUTTONCLICK
    const onSubmit = async (formData) => {
      const fieldsToValidate = stepFields[step];
      const isStepValid = await trigger(fieldsToValidate);
  
      if (isStepValid) {
        if (step === 1) {
          checkCredentialsAvailablity(formData);
        } else {
          const response = await createAdmin(formData);
  
          if (response !== undefined) {
            alert("Successfully registered! Please move on to verification!");
            navigate("/auth/admin-verify");
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

  const steps = [1, 2];

  return (
    <>
      {/* MAIN CONTAINER FOR BACKGROUND IMAGE */}
      <div className = "bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col items-center" style={{ backgroundImage: `url(${signupPicture})` }}>
        
        {/* STEPS BUTTONS */}
        <div className = "flex gap-9 p-10 mt-4">
          {steps.map((num) => (
            <div
              key = { num }
              className = {`font-bold text-xl flex justify-center items-center rounded-full w-10 h-10 p-6 
                ${
                  completedSteps.includes(num)
                  ? "bg-primary-color-green border-opacity-50"
                  : "bg-primary-color-white"
                } 
                ${ step === num ? "scale-125" : "" } 
                ${
                  clickableSteps.includes(num) ? "cursor-pointer" : "cursor-default"
                }`}
              onClick = {() => handleStepClick(num) }
            >
              { num }
            </div>
          ))}
        </div>

          {/* FORM CONTAINER */}
          <div className = "card rounded-none bg-primary-color-white flex justify-center border p-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && <Step1 register = {register} errors = {errors} />}
              {step === 2 && <Step2 register = {register} errors = {errors} watch = {watch} />}

              <div className = "flex justify-evenly gap-5 pt-10">

                <button
                  type = "submit"
                  // className = "font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green transition duration-300 ease-in-out"
                  className = "font-bold border px-14 py-2 w-3/4 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green transition duration-300 ease-in-out"
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

export default AdminSignUp;
