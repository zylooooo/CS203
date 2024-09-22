import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from "./sign-up-components";

const SignUp = () => {
  const navigate = useNavigate();

  const location = useLocation(); // Use useLocation to access the state
  const { email } = location.state || {}; // Extract email from state
  
  const form = useForm();
  const { register, control, handleSubmit, watch, formState } = form;
  const { errors } = formState;
  
  const [step, setStep] = useState(1);
  
  const onSubmit = (data) => {
    if (step === 6) {
      // Final submission logic here
      console.log("Form Data: ", data);

      // Render Step 7
    } else {
      // Move to next step
      setStep(step + 1);
    }
  };

  return (
    <>
      <div className = "flex gap-9 p-10">
        <div
          className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 1
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 1 ? "scale-110" : ""}`}
        >
          1
        </div>
        <div
          className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 2
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 2 ? "scale-110" : ""}`}
        >
          2
        </div>
        <div
          className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 3
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 3 ? "scale-110" : ""}`}
        >
          3
        </div>
        <div
          className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 4
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 4 ? "scale-110" : ""}`}
        >
          4
        </div>
        <div
          className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 5
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 5 ? "scale-110" : ""}`}
        >
          5
        </div>
        <div
          className = {`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 6
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 6 ? "scale-110" : ""}`}
        >
          6
        </div>
      </div>
      <div className = "flex justify-center border p-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && <Step1 register={register} errors={errors} email={email}/>}
          {step === 2 && <Step2 register={register} errors={errors} />}
          {step === 3 && <Step3 register={register} errors={errors} />}
          {step === 4 && <Step4 register={register} errors={errors} />}
          {step === 5 && <Step5 register={register} errors={errors} />}
          {step === 6 && (
            <Step6 register={register} errors={errors} watch={watch} />
          )}

          <div className = "flex justify-evenly gap-5 pt-10">
            <button
              className = "font-bold border px-14 py-2 bg-secondary-color-light-gray text-primary-color-white hover:bg-primary-color-green hover:cursor-pointer"
              type = "button"
              onClick={() => step === 1 ?  navigate('/') : setStep(step - 1)}
            >
              Back
            </button>
            <button
              className = "font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
              type="submit"
            >
              {step === 6 ? "Submit" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignUp;
