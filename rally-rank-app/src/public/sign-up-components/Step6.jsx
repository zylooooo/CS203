import PropTypes from "prop-types";

const Step6 = ({ register, errors, watch }) => {

    const password = watch("password");

    return (
        <div>
            <h2 className = "text-xl font-extrabold"> Account Setup </h2>
            <p> Last stage of your account registration! Please enter a username and password </p>
            <div className = "flex flex-col gap-5 mt-8">

                {/* USERNAME INPUT */}
                <div className = "flex flex-col gap-2">
                    <label
                        htmlFor = "username"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Username
                    </label>
                    <input
                        className = "border p-2"
                        type = "text"
                        id = "username"
                        placeholder = "Enter your RallyRank username"
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
                                message: "Username can only contain letters, numbers and underscores.",
                            },
                        })}
                    />
                    <p className = "error"> {errors.username?.message} </p>
                </div>

                {/* PASSWORD */}
                <div className = "flex flex-col gap-2">
                    <label
                        htmlFor = "password"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        className = "border p-2"
                        type = "password"
                        id = "password"
                        placeholder = "Enter your password"
                        {...register("password", {
                            required: "A password is required.",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters long.",
                            },
                            validate: {
                                alphanumeric: value => /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value) || "Password must be alphanumeric.",
                                uppercase: value => /(?=.*[A-Z])/.test(value) || "Password must contain at least one uppercase letter.",
                                lowercase: value => /(?=.*[a-z])/.test(value) || "Password must contain at least one lowercase letter.",
                                symbol: value => /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value) || "Password must contain at least one special character.",
                            },
                        })}
                    />
                    <p className = "error"> {errors.password?.message} </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className = "flex flex-col gap-2">
                    <label
                        htmlFor = "confirmPassword"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Confirm Password
                    </label>
                    <input
                        className = "border p-2"
                        type = "password"
                        id = "confirmPassword"
                        placeholder = "Re-enter your password"
                        {...register("confirmPassword", {
                            required: "Confirm password is required",
                            validate: (value) =>
                                value === password || "Passwords do not match!",
                        })}
                    />
                    <p className = "error"> {errors.confirmPassword?.message} </p>
                </div>
            </div>
        </div>
    );
};

Step6.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        username: PropTypes.object,
        password: PropTypes.object,
        confirmPassword: PropTypes.object,
    }).isRequired,
    watch: PropTypes.func.isRequired,
};

export default Step6;