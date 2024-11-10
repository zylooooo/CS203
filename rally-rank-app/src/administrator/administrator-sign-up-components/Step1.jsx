// Package Imports
import PropTypes from "prop-types";

const Step1 = ({ register, errors }) => (
    <div className = "flex flex-col justify-center">
        <h2 className = "text-2xl font-bold mb-1"> Create Account </h2>
        <p className = "text-sm font-semibold"> Please enter your details to create an account. </p>
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
            {/* EMAIL INPUT */}
            <div className = "flex flex-col gap-1 w-full">
                <label
                    htmlFor = "email"
                    className = "block text-md font-bold text-gray-700 mb-2"
                >
                    Email Address
                </label>
                <div className = "flex"> 
                    <input
                        className = "border p-2 w-full"
                        id = "email"
                        placeholder = "helloworld@gmail.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Invalid email format",
                            },
                        })}
                    />
                </div>
                <p className = "error"> {errors.email?.message} </p>
            </div>
            {/* ADMINNAME INPUT */}
            <div className = "flex flex-col gap-2">
                <label
                    htmlFor = "adminName"
                    className = "block text-md font-bold text-gray-700 mb-2"
                >
                    Administrator Username
                </label>
                <input
                    className = "border p-2"
                    type = "text"
                    id  = "adminName"
                    placeholder = "Enter your RallyRank Administrator Username"
                    {...register("adminName", {
                        required: "An Administrator Username is required.",
                        minLength: {
                        value: 5,
                        message: "Administrator Username must be at least 5 characters long",
                        },
                        maxLength: {
                        value: 20,
                        message: " Administrator Username cannot exceed 20 characters.",
                        },
                        pattern: {
                        value: /^[a-zA-Z0-9_]*$/,
                        message:
                            "Administrator Username can only contain letters, numbers and underscores.",
                        },
                    })}
                />
                <p className = "error"> {errors.adminName?.message} </p>
            </div>
        </div>
    </div>
);

Step1.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        email: PropTypes.object,
        adminName: PropTypes.object,
        firstName: PropTypes.object,
        lastName: PropTypes.object,
    }).isRequired,
    email: PropTypes.func.isRequired,
};

export default Step1;