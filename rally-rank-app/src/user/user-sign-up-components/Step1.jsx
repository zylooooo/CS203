// Package Imports
import PropTypes from "prop-types";

const Step1 = ({ register, errors, email }) => (
    <div className = "flex flex-col justify-center">
        <h2 className = "text-2xl font-bold mb-1"> Create Account </h2>
        <p className = "text-sm font-semibold"> Please enter your details to create an account. </p>
        <div className = "flex flex-col gap-5 mt-8">
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
                        defaultValue = { email } 
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
            {/* USERNAME INPUT */}
            <div className = "flex flex-col gap-2">
                <label
                    htmlFor = "username"
                    className = "block text-md font-bold text-gray-700 mb-2"
                >
                    Username
                </label>
                <input
                    className = "border p-2"
                    type = "text"
                    id  = "username"
                    placeholder = "Enter your RallyRank Username"
                    {...register("username", {
                        required: "A username is required.",
                        minLength: {
                        value: 5,
                        message: "Username must be at least 5 characters long",
                        },
                        maxLength: {
                        value: 20,
                        message: "Username cannot exceed 20 characters.",
                        },
                        pattern: {
                        value: /^[a-zA-Z0-9_]*$/,
                        message:
                            "Username can only contain letters, numbers and underscores.",
                        },
                    })}
                />
                <p className = "error"> {errors.username?.message} </p>
            </div>
        </div>
    </div>
);

Step1.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        email: PropTypes.object,
        username: PropTypes.object,
    }).isRequired,
    email: PropTypes.string.isRequired,
};

export default Step1;