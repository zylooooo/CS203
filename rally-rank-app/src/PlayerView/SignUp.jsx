import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";


const Step1 = ({ register, errors, email }) => (
  <div>
    <h2 className="text-xl font-extrabold">Create account</h2>
    <p>Please enter your email address for verification</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          className="border p-2"
          id="email"
          placeholder="helloworld@gmail.com"
          defaultValue={email} // Set the default value to the passed email
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email format",
            },
          })}
        ></input>

        <p className="error">{errors.email?.message}</p>
      </div>
    </div>
  </div>
);

Step1.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    email: PropTypes.object,
  }).isRequired,
};

const Step2 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Personal Information</h2>
    <p>We love to know more about you!</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="firstName"
            placeholder="First Name"
            {...register("firstName", {
              required: "First name is required",
            })}
          />
          <p className="error">{errors.firstName?.message}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="lastName"
            placeholder="Last Name"
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          <p className="error">{errors.lastName?.message}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="gender"
          className="block text-sm font-medium text-gray-700"
        >
          Gender
        </label>
        <select
          className="border p-2"
          id="gender"
          {...register("gender", {
            required: "Gender is required",
          })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <p className="error">{errors.gender?.message}</p>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="dob"
          className="block text-sm font-medium text-gray-700"
        >
          Date of Birth
        </label>
        <input
          className="border p-2"
          type="date"
          id="dob"
          {...register("dob", {
            required: "Date of birth is required",
          })}
        />
        <p className="error">{errors.dob?.message}</p>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          className="border p-2"
          type="number"
          id="phone"
          placeholder="Phone Number"
          {...register("phone", {
            required: "Phone number is required",
          })}
        />
        <p className="error">{errors.phone?.message}</p>
      </div>
    </div>
  </div>
);

Step2.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    firstName: PropTypes.object,
    lastName: PropTypes.object,
    gender: PropTypes.object,
    dob: PropTypes.object,
    phone: PropTypes.object,
  }).isRequired,
};

const Step3 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Tennis Details</h2>
    <p>Share with us your tennis details and experience!</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700"
        >
          Elo Rating
        </label>
        <input
          className="border p-2"
          type="number"
          id="elo"
          placeholder="0"
          {...register("elo", {})}
        />
        <p className="text-sm font-xs text-gray-700">
          *Leave this blank if you are unranked
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="yearsOfExperience"
          className="text-sm font-medium text-gray-700"
        >
          Years of Experience
        </label>
        <input
          className="border p-2"
          type="number"
          id="YearsOfExperience"
          placeholder="0"
          {...register("YearsOfExperience", {
            required: "Years of Experience is required",
          })}
        />
        <p className="error">{errors.YearsOfExperience?.message}</p>
      </div>
    </div>
  </div>
);

Step3.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    elo: PropTypes.object,
    YearsOfExperience: PropTypes.object,
  }).isRequired,
};

const Step4 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Medical Information</h2>
    <p>Please enter the relevant health details</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bloodType"
          className="block text-sm font-medium text-gray-700"
        >
          Please enter your blood type
        </label>
        <input
          className="border p-2"
          type="text"
          id="bloodType"
          placeholder="O+, A, AB"
          {...register("bloodType", {
            required: "Blood type is required",
          })}
        />
        <p className="error">{errors.bloodType?.message}</p>
      </div>

      <h3 className="pt-5 text-xl font-extrabold">Emergency contact details</h3>
      <div className="flex gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="emergencyContactFirstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="emergencyContactFirstName"
            placeholder="First Name"
            {...register("emergencyContactFirstName", {
              required: "First name is required",
            })}
          />
          <p className="error">{errors.emergencyContactFirstName?.message}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="emergencyContactLastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="emergencyContactLastName"
            placeholder="Last Name"
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          <p className="error">{errors.emergencyContactLastName?.message}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="emergencyPhoneNo"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          className="border p-2"
          type="number"
          id="emergencyPhoneNo"
          placeholder="E.g. 84924832"
          {...register("emergencyPhoneNo", {
            required: "Emergency contact phone number is required",
          })}
        />
        <p className="error">{errors.emergencyPhoneNo?.message}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="emergencyRelationship"
          className="block text-sm font-medium text-gray-700"
        >
          Relationship
        </label>
        <input
          className="border p-2"
          type="text"
          id="emergencyRelationship"
          placeholder="Mother, Father, Sister, etc."
          {...register("emergencyRelationship", {
            required: "Relationship for emergency contact is required",
          })}
        />
        <p className="error">{errors.emergencyRelationship?.message}</p>
      </div>
    </div>
  </div>
);

Step4.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    bloodType: PropTypes.object,
    emergencyContactFirstName: PropTypes.object,
    emergencyContactLastName: PropTypes.object,
    emergencyPhoneNo: PropTypes.object,
    emergencyRelationship: PropTypes.object,
  }).isRequired,
};

const Step5 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Availability</h2>
    <p>Let us know when you are available to play</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2"></div>
      <p>You can edit your availability later</p>
    </div>
  </div>
);

Step5.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({}).isRequired,
};

const Step6 = ({ register, errors, watch }) => (
  <div>
    <h2 className="text-xl font-extrabold">Account Setup</h2>
    <p>Last stage! Please choose a password</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          className="border p-2"
          type="password"
          id="password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          })}
        />
        <p className="error">{errors.password?.message}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          className="border p-2"
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          {...register("confirmPassword", {
            required: "Password is required",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          })}
        />
        <p className="error">{errors.confirmPassword?.message}</p>
      </div>
    </div>
  </div>
);

Step6.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    password: PropTypes.object,
    confirmPassword: PropTypes.object,
  }).isRequired,
  watch: PropTypes.func.isRequired,
};

const Step7 = ({ register, errors }) => (
  <div className="flex flex-col justify-center items-center">
    <h2 className="text-xl font-extrabold">Account Created!</h2>
    <p>
      Welcome to RallyRank! Ready to serve up some fun? Join your first match
      today!
    </p>
  </div>
);

Step7.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    password: PropTypes.object,
    confirmPassword: PropTypes.object,
  }).isRequired,
};

const SignUp = () => {
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
      <div className="flex gap-9 p-10">
        <div
          className={`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 1
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 1 ? "scale-110" : ""}`}
        >
          1
        </div>
        <div
          className={`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 2
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 2 ? "scale-110" : ""}`}
        >
          2
        </div>
        <div
          className={`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 3
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 3 ? "scale-110" : ""}`}
        >
          3
        </div>
        <div
          className={`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 4
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 4 ? "scale-110" : ""}`}
        >
          4
        </div>
        <div
          className={`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 5
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 5 ? "scale-110" : ""}`}
        >
          5
        </div>
        <div
          className={`font-bold text-xl flex justify-center items-center border rounded-full w-10 h-10 p-6 ${
            step > 6
              ? "bg-primary-color-green bg-opacity-85"
              : "bg-secondary-color-light-gray bg-opacity-50"
          } ${step === 6 ? "scale-110" : ""}`}
        >
          6
        </div>
      </div>
      <div className="flex justify-center border p-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && <Step1 register={register} errors={errors} email={email}/>}
          {step === 2 && <Step2 register={register} errors={errors} />}
          {step === 3 && <Step3 register={register} errors={errors} />}
          {step === 4 && <Step4 register={register} errors={errors} />}
          {step === 5 && <Step5 register={register} errors={errors} />}
          {step === 6 && (
            <Step6 register={register} errors={errors} watch={watch} />
          )}

          <div className="flex justify-evenly gap-5 pt-10">
            <button
              className="font-bold border px-14 py-2 bg-secondary-color-light-gray text-primary-color-white
                            hover:bg-primary-color-green hover:cursor-pointer"
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </button>
            <button
              className="font-bold border px-14 py-2 bg-primary-color-green text-primary-color-white hover:bg-secondary-color-dark-green"
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

export { SignUp };
