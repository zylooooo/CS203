// Package Imports
import PropTypes from "prop-types";

const Step2 = ({ register, errors }) => (
    <div className = "flex flex-col justify-center">
        <h2 className = "text-2xl font-bold mb-1"> Personal Information </h2>
        <p className = "text-sm font-semibold"> We would love to know more about you! </p>
        <div className = "flex flex-col gap-5 mt-8">
            <div className = "flex gap-4">
                {/* FIRST NAME INPUT */}
                <div className = "flex flex-col w-full">
                    <label
                        htmlFor = "firstName"
                        className = "block text-md font-bold text-gray-700 mb-2"
                    >
                            First Name
                    </label>
                    <input
                        className = "border p-2 w-full"
                        type = "text"
                        id = "firstName"
                        placeholder = "First Name"
                        {...register("firstName", { required: "First name is required" })}
                    />
                    <p className = "error"> {errors.firstName?.message} </p>
                </div>
                {/* LAST NAME INPUT */}
                <div className = "flex flex-col w-full">
                    <label
                        htmlFor = "lastName"
                        className = "block text-md font-bold text-gray-700 mb-2"
                    >
                        Last Name
                    </label>
                    <input
                        className = "border p-2 w-full"
                        type = "text"
                        id = "lastName"
                        placeholder = "Last Name"
                        {...register("lastName", { required: "Last name is required" })}
                    />
                    <p className = "error"> {errors.lastName?.message} </p>
                </div>
            </div>
            {/* GENDER INPUT */}
            <div className = "flex flex-col gap-2">
                <label
                    htmlFor = "gender"
                    className = "block text-md font-bold text-gray-700 mb-2"
                >
                    Gender
                </label>
                <select
                    className = "border p-2"
                    id  = "gender"
                    {...register("gender", {required: "Your gender is required."})}
                >
                    <option value = ""> Select Gender </option>
                    <option value = "Male"> Male </option>
                    <option value = "Female"> Female </option>
                </select>
                <p className = "error"> {errors.gender?.message} </p>
            </div>
            {/* DATE OF BIRTH INPUT */}
            <div className = "flex flex-col gap-2">
                <label
                    htmlFor = "dob"
                    className = "block text-md font-bold text-gray-700 mb-2"
                >
                    Date of Birth
                </label>
                <input
                    className = "border p-2"
                    type = "date"
                    id  = "dob"
                    {...register("dob", {required: "Your date of birth is required."})}
                />
                <p className = "error"> {errors.dob?.message} </p>
            </div>
            {/* PHONE NUMBER INPUT */}
            <div className = "flex flex-col gap-2">
                <label
                    htmlFor = "phone"
                    className = "block text-md font-bold text-gray-700 mb-2"
                >
                    Phone Number
                </label>
                <input
                    className = "border p-2"
                    type = "tel"
                    id  = "phone"
                    placeholder = "Enter your phone number"
                    {...register("phone", {
                        required: "A phone number is required.",
                        pattern: {
                            value: /^(?:6\d{7}|[89]\d{7}|1800\d{7}|1900\d{7})$/,
                            message: "Please enter a valid phone number",
                        },
                    })}
                />
                <p className = "error"> {errors.phone?.message} </p>
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

export default Step2;