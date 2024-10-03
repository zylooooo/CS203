import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Step1, Step2, Step3, Step4, Step5 } from "./sign-up-components/SignUpSteps";
import signupPicture from "../assets/sign-up-picture.jpg";

function SignUp() {
  const location = useLocation(); 
  const { email } = location.state || {}; 
  const { register, handleSubmit, watch, trigger, formState: { errors , isValid}} = useForm();

  const [step, setStep] = useState(1);
  const [clickableSteps, setClickableSteps] = useState([]); // clickable steps, including current step
  const [completedSteps, setCompletedSteps] = useState([]); // completed steps, displayed as green

  const stepFields = {
    1: ["email"],
    2: ["firstName", "lastName", "gender", "dob", "phone"],
    3: ["elo", "yearsOfExperience"],
    4: ["username", "password", "confirmPassword"],
  };

  const onSubmit = async (data) => {

    const fieldsToValidate = stepFields[step];
    const isStepValid = await trigger(fieldsToValidate);
  
    if (isStepValid) {
      if (step < 4) {
        setCompletedSteps([...completedSteps, step]);
        setClickableSteps([...clickableSteps, step]);
        setStep(step + 1);
      } else {
        // Replace with POST request to backend
        console.log(data);
      }
    } else {
      console.log("Please fill all required fields.");
    }

    // if (step < 4) {
    //   setCompletedSteps([...completedSteps, step]);
    //   setClickableSteps([...clickableSteps, step]);
    //   setStep(step + 1);
    // } else {
    //   // Replace with POST request to backend
    //   console.log(data);
    // }
  };

  const handleStepClick = async (stepNumber) => {

    const fieldsToValidate = stepFields[step];
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && clickableSteps.includes(stepNumber)) {
      setClickableSteps([...clickableSteps, step]);
      setStep(stepNumber);
    }
    // if (clickableSteps.includes(stepNumber)) {
    //   setClickableSteps([...clickableSteps, step]);
    //   setStep(stepNumber);
    // }
  };

  const steps = [1, 2, 3, 4];

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

          {/* improve functionality: CHECK THAT ALL INPUTS ARE VALID/NOT NULL BEFORE SUBMITTING POST REQ */}

          {/* FORM CONTAINER */}
          <div className = "card rounded-none bg-primary-color-white flex justify-center border p-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && <Step1 register = {register} errors = {errors} email = {email} />}
              {step === 2 && <Step2 register = {register} errors = {errors} />}
              {step === 3 && <Step3 register = {register} errors = {errors} />}
              {step === 4 && <Step4 register = {register} errors = {errors} watch = {watch} />}

              <div className = "flex justify-evenly gap-5 pt-10">
              
              {/* CHANGE PREVIOUS/NEXT BUTTONS TO : CONTINUE (?) */}
              {/* & REPLACE PREVIOUS/NEXT BUTTON WITH CHEVRONS NEXT TO THE NUMBERS -- IMPORT HEROICONS */}

                <button
                  type = "submit"
                  // className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 shadow-md transition duration-300 ease-in-out"
                  className = "font-bold border px-14 py-2 bg-secondary-color-light-gray text-primary-color-white hover:bg-primary-color-green hover:cursor-pointer"
                  onClick = {() => setStep(step - 1)}
                  disabled = {step === 1}
                >
                  Previous
                </button>
                <button
                  type = "submit"
                  // className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition duration-300 ease-in-out"
                  className = "font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
                >
                  {step === 4 ? "Submit" : "Next"}
                </button>
              </div>
            </form>
          </div>
      </div>
    </>
  );
}

export default SignUp;
