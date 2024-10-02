import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Step1, Step2, Step3, Step4, Step5 } from "./sign-up-components/SignUpSteps";
import signupPicture from "../assets/sign-up-picture.jpg";


function SignUp() {
  // const navigate = useNavigate();

  // const location = useLocation(); // Use useLocation to access the state
  // const { email } = location.state || {}; // Extract email from state
  
  // const form = useForm();
  // const { register, control, handleSubmit, watch, formState } = form;
  // const { errors } = formState;
  
  // const [step, setStep] = useState(1);
  
  // const onSubmit = (data) => {
  //   if (step === 4) {
  //     // Final submission logic here
  //     console.log("Form Data: ", data);

  //     // Render Step 7
  //   } else {
  //     // Move to next step
  //     setStep(step + 1);
  //   }
  // };
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const onSubmit = (data) => {
    // Handle form submission
    if (step < 4) {
      setCompletedSteps([...completedSteps, step]);
      setStep(step + 1);
    } else {
      // Final submission logic
    }
  };

  const handleStepClick = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, step]);
      setStep(stepNumber);
    }
  };

  const steps = [1, 2, 3, 4];

  return (
    <>
      <div className = "flex gap-9 p-10">
        {steps.map((num) => (
          <div
            key = {num}
            className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 cursor-pointer ${
              step > num
                ? "bg-primary-color-green bg-opacity-85"
                : "bg-secondary-color-light-gray bg-opacity-50"
            } ${step === num ? "scale-110" : ""} ${
              completedSteps.includes(num) ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            onClick = {() => handleStepClick(num)}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex justify-center border p-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && <Step1 register={register} errors={errors} />}
          {step === 2 && <Step2 register={register} errors={errors} />}
          {step === 3 && <Step3 register={register} errors={errors} />}
          {step === 4 && <Step4 register={register} errors={errors} watch={watch} />}

          <div className="flex justify-evenly gap-5 pt-10">
            <button
              type="button"
              // className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 shadow-md transition duration-300 ease-in-out"
              className = "font-bold border px-14 py-2 bg-secondary-color-light-gray text-primary-color-white hover:bg-primary-color-green hover:cursor-pointer"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </button>
            <button
              type="submit"
              // className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition duration-300 ease-in-out"
              className = "font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
            >
              {step === 4 ? "Submit" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignUp;
