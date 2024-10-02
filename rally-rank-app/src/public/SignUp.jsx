import { useState } from "react";
import { useForm } from "react-hook-form";
import { Step1, Step2, Step3, Step4, Step5 } from "./sign-up-components/SignUpSteps";
import signupPicture from "../assets/sign-up-picture.jpg";

function SignUp() {
  const { register, handleSubmit, watch, formState: { errors }} = useForm();
  const [step, setStep] = useState(1);
  const [clickableSteps, setClickableSteps] = useState([]); // Keep track of clickable steps (including current step)
  const [completedSteps, setCompletedSteps] = useState([]); // Keep track of completed steps to display as green

  const onSubmit = (data) => {
    if (step < 4) {
      setCompletedSteps([...completedSteps, step]);
      setClickableSteps([...clickableSteps, step]);
      setStep(step + 1);
    } else {
      // Final submission logic
    }
  };

  const handleStepClick = (stepNumber) => {
    if (clickableSteps.includes(stepNumber)) {
      setClickableSteps([...clickableSteps, step]);
      setStep(stepNumber);
    }
  };

  const steps = [1, 2, 3, 4];

  return (
    <>
        <div className = "bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col items-center" style={{ backgroundImage: `url(${signupPicture})` }}>
          <div className = "flex gap-9 p-10 mt-4">
            {steps.map((num) => (
              <div
                key={num}
                className = {`font-bold text-xl flex justify-center items-center rounded-full w-10 h-10 p-6 ${
                  completedSteps.includes(num)
                  ? "bg-primary-color-green border-opacity-50"
                  : step > num
                    ? "bg-primary-color-green border-opacity-50"
                    : "bg-primary-color-white"
                } ${step === num ? "scale-110" : ""} ${
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
            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && <Step1 register = {register} errors = {errors} />}
              {step === 2 && <Step2 register = {register} errors = {errors} />}
              {step === 3 && <Step3 register = {register} errors = {errors} />}
              {step === 4 && <Step4 register = {register} errors = {errors} watch = {watch} />}

              <div className = "flex justify-evenly gap-5 pt-10">
                <button
                  type = "button"
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
