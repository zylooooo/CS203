import PropTypes from "prop-types";
import { useState } from "react";

const Step3 = ({ register, errors, watch }) => {

    const password = watch("password");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setConfirmShowPassword] = useState(false);

    return (
        <div>
            <h2 className = "text-xl font-extrabold"> Account Setup </h2>
            <p> Last stage of your account registration! Please enter a username and password. </p>
            <div className = "flex flex-col gap-5 mt-8">

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
                        type = {showPassword ? "text" : "password"}
                        id = "password"
                        placeholder = "Enter your password"
                        {...register("password", {
                            required: "A password is required.",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters long.",
                            },
                            // validate: {
                            //     alphanumeric: value => /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value) || "Password must be alphanumeric.",
                            //     uppercase: value => /(?=.*[A-Z])/.test(value) || "Password must contain at least one uppercase letter.",
                            //     lowercase: value => /(?=.*[a-z])/.test(value) || "Password must contain at least one lowercase letter.",
                            //     symbol: value => /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value) || "Password must contain at least one special character.",
                            // },
                        })}
                    />
                    <p className = "error"> {errors.password?.message} </p>
                    <div className = "block text-sm font-normal text-gray-700 pl-3">
                        <input
                        type = "checkbox"
                        id = "showPassword"
                        checked = {showPassword}
                        onChange = {() => setShowPassword(!showPassword)}
                        />
                        <label 
                            htmlFor = "showPassword"> Show Password 
                        </label>
                    </div>
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
                <div className = "block text-sm font-normal text-gray-700 pl-3">
                        <input
                        type = "checkbox"
                        id = "showConfirmPassword"
                        checked = {showConfirmPassword}
                        onChange = {() => setConfirmShowPassword(!showConfirmPassword)}
                        />
                        <label 
                            htmlFor = "showConfirmPassword"> Show Password 
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

Step3.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        username: PropTypes.object,
        password: PropTypes.object,
        confirmPassword: PropTypes.object,
    }).isRequired,
    watch: PropTypes.func.isRequired,
};

export default Step3;