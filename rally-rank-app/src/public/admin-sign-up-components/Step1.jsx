import PropTypes from "prop-types";

const Step1 = ({ register, errors }) => (
    <div className="flex flex-col justify-center">
        <h2 className="text-xl font-extrabold">Create Admin account</h2>
        <p>Please enter your email address for verification</p>
        <div className="flex flex-col gap-5 mt-8">

            {/* EMAIL INPUT */}
            <div className = "flex flex-col gap-1 w-full">

                <label
                    htmlFor = "email"
                    className = "block text-sm font-medium text-gray-700"
                >
                    Email Address
                </label>
                <div className = "flex "> 
                    <input
                        className = "border rounded-r-none p-2 w-4/5"
                        id = "email"
                        placeholder = "helloworld@gmail.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Invalid email format",
                            },
                        })}
                    ></input>
                    <button 
                        className = "border rounded-l-none bg-blue-500 text-white px-4 py-2 w-1/5"
                        // VERIFY EMAIL WITH OTP
                    > 
                        Verify
                    </button>
                </div>

                <p className = "error">{errors.email?.message}</p>
                
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
