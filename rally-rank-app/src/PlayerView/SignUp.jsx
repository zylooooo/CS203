import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";

const Step1 = ({ register, errors }) => (
    <div>
        <h2 className="h2 text-xl font-extrabold">Personal Information</h2>
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
                    type="tel"
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

Step1.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        firstName: PropTypes.object,
        lastName: PropTypes.object,
        gender: PropTypes.object,
        dob: PropTypes.object,
        phone: PropTypes.object,
    }).isRequired,
};

const Step2 = ({ register, errors }) => (
    <div>
        <h2 className="h2 text-xl font-extrabold">Tennis Details</h2>
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
                    type="text"
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
                    Elo Rating
                </label>
                <input
                    className="border p-2"
                    type="text"
                    id="YearsOfExperience"
                    placeholder="0"
                    {...register("YearsOfExperience", {})}
                />
                <p className="error">{errors.YearsOfExperience?.message}</p>
            </div>
        </div>
    </div>
);

Step2.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        elo: PropTypes.object,
        YearsOfExperience: PropTypes.object,
    }).isRequired,
};

const onSubmit = (data) => {};

const SignUp = () => {
    const form = useForm();
    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;

    const [step, setStep] = useState(1);

    const onSubmit = (data) => {
        if (step === 2) {
            // Final submission logic here
            console.log("Form Data: ", data);
        } else {
            // Move to next step
            setStep(step + 1);
        }
    };

    return (
        <>
            <div className="flex justify-center border p-10">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* {step === 1 && (
                        <Step1 register={register} errors={errors} />
                    )} */}
                    {/* {step === 2 && (
                        <Step2 register={register} errors={errors} />
                    )} */}
                    {step === 3 && (
                        <Step2 register={register} errors={errors} />
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
