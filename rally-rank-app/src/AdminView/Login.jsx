import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

function AdminLogin() {
    const form = useForm();
    const { register, control, handleSubmit, formState } = form;
    const { errors } = formState;

    const onSubmit = (data) => {
        // Remove the console.log statement
        console.log("Form submitted", data);
        // This is for API calls
    };

    return (
        <>
            <h1 className="m-8 font-bold text-2xl">Admin Login</h1>
            <div>
                <form
                    className="card"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            className="input"
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            {...register("email", {
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email format",
                                },
                            })}
                        />
                        <p className="error">{errors.email?.message}</p>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="input"
                            placeholder="••••••••"
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />
                        <p className="error">{errors.password?.message}</p>
                    </div>
                    <button
                        type="submit"
                        className="button mt-6 font-bold hover:shadow-inner"
                    >
                        Log In
                    </button>
                    <div className="flex items-center justify-center py-6">
                        <div className="border-t border-gray-100 flex-grow mr-3 opacity-50"></div>
                        <span className="text-gray-199 text-xs opacity-50">
                            OR
                        </span>
                        <div className="border-t border-gray-100 flex-grow ml-3 opacity-50"></div>
                    </div>
                    <div className="text-xs text-blue-500">
                        Don't have a RallyRank Admin account?
                        <Link
                            to=""
                            className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                        >
                            Sign up as an admin
                        </Link>
                    </div>
                </form>
                <DevTool control={control} />
                <div className="text-blue-500 text-ms flex flex-row justify-center align-item mt-10">
                    Looking for player login?
                    <Link
                        to="/login"
                        className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                    >
                        Back to player login
                    </Link>
                </div>
            </div>
        </>
    );
}

export default AdminLogin;
