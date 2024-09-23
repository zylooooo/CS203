import PropTypes from "prop-types";

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
    email: PropTypes.func.isRequired,
};

export default Step1;
