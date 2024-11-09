// Package Imports
import { useState } from "react";
import PropTypes from "prop-types";

const Step2 = ({ register, errors, watch }) => {
    const password = watch("password");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setConfirmShowPassword] = useState(false);

    return (
        <div>
            <h2 className = "text-2xl font-bold mb-1"> Create Password </h2>
            <p className = "text-sm font-semibold"> Last step of your RallyRank Administrator account registration! </p>
            <div className = "flex flex-col gap-5 mt-8">
                {/* PASSWORD */}
                <div className = "flex flex-col">
                    <label
                        htmlFor = "password"
                        className = "block text-md font-bold text-gray-700 mb-2"
                    >
                        Password
                    </label>
                    <input
                        className = "border p-2"
                        type = {showPassword ? "text" : "password"}
                        id = "password"
                        placeholder = "Enter a password"
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
                    <div className = "block text-sm font-normal text-gray-700 pl-3 mt-2">
                        <input
                            type = "checkbox"
                            id = "showPassword"
                            checked = {showPassword}
                            className="transform scale-110"
                            onChange = {() => setShowPassword(!showPassword)}
                            />
                        <label
                            className = "text-sm font-semibold ml-2"
                            htmlFor = "showPassword"
                        >
                            Show Password
                        </label>
                    </div>
                </div>
                {/* CONFIRM PASSWORD */}
                <div className = "flex flex-col mt-2">
                    <label
                        htmlFor = "confirmPassword"
                        className = "block text-md font-bold text-gray-700 mb-2"
                    >
                        Confirm Password
                    </label>
                    <input
                        className = "border p-2"
                        type = {showConfirmPassword ? "text" : "password"}
                        id = "confirmPassword"
                        placeholder = "Re-enter your password"
                        {...register("confirmPassword", {
                            required: "Confirm password is required",
                            validate: (value) =>
                                value === password || "Passwords do not match!",
                        })}
                    />
                    <p className = "error"> {errors.confirmPassword?.message} </p>
                    <div className = "block text-sm font-normal text-gray-700 pl-3 mt-2">
                        <input
                            type = "checkbox"
                            id = "showConfirmPassword"
                            checked = {showConfirmPassword}
                            className="transform scale-110"
                            onChange = {() => setConfirmShowPassword(!showConfirmPassword)}
                        />
                        <label 
                            htmlFor = "showConfirmPassword"
                            className = "text-sm font-semibold ml-2"
                        >
                            Show Password 
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

Step2.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        password: PropTypes.object,
        confirmPassword: PropTypes.object,
    }).isRequired,
    watch: PropTypes.func.isRequired,
};

export default Step2;