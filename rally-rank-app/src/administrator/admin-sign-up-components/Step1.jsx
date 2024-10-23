import PropTypes from "prop-types";

const Step1 = ({ register, errors }) => (
    <div className="flex flex-col justify-center">
        <h2 className="text-xl font-extrabold">Create Admin account</h2>
        <p>Please enter your details to create your account.</p>
        <div className="flex flex-col gap-5 mt-8">

            {/* EMAIL INPUT */}
            <div className = "flex flex-col gap-1 w-full">
                <label
                    htmlFor = "email"
                    className = "block text-sm font-medium text-gray-700"
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
                    ></input>
                </div>
                <p className = "error">{errors.email?.message}</p>
            </div>

            {/* ADMINNAME INPUT */}
            <div className="flex flex-col gap-2">
                <label
                htmlFor="adminName"
                className="block text-sm font-medium text-gray-700"
                >
                Admin Username
                </label>
                <input
                className="border p-2"
                type="text"
                id="adminName"
                placeholder="Enter your RallyRank Admin username"
                {...register("adminName", {
                    required: "An Admin username is required.",
                    minLength: {
                    value: 5,
                    message: "Admin Username must be at least 5 characters long",
                    },
                    maxLength: {
                    value: 20,
                    message: "Admin Username cannot exceed 20 characters.",
                    },
                    pattern: {
                    value: /^[a-zA-Z0-9_]*$/,
                    message:
                        "Admin Username can only contain letters, numbers and underscores.",
                    },
                })}
                />
                <p className="error"> {errors.adminName?.message} </p>
            </div>

            {/* FIRST NAME & LAST NAME INPUT */}
            <div className="flex gap-5 justify-center w-full">
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
