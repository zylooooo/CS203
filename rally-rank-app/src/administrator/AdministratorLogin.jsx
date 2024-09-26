import { Link } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import { useForm } from "react-hook-form";

function AdministratorLogin() {
    const form = useForm();

    const { register, control, handleSubmit, formState } = form;

    const { errors } = formState;

    const onSubmit = (data) => {
        console.log("Form submitted", data);
    };

    return (
        <>
            <h1 className = "m-8 font-bold text-2xl"> Admin Login </h1>
            <div>
                <form
                    className = "card"
                    onSubmit = {handleSubmit(onSubmit)}
                    noValidate
                >
                    <div>
                        <label
                            htmlFor = "email"
                            className = "block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            className = "input"
                            type = "email"
                            id = "email"
                            placeholder = "you@example.com"
                            {...register("email", {
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email format",
                                },
                            })}
                        />
                        <p className = "error">{errors.email?.message}</p>
                    </div>

                    <div>
                        <label
                            htmlFor = "password"
                            className = "block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type = "password"
                            id = "password"
                            className = "input"
                            placeholder = "••••••••"
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />
                        <p className = "error">{errors.password?.message}</p>
                    </div>
                    <button
                        type = "submit"
                        className = "button mt-6 font-bold hover:shadow-inner"
                    >
                        Log In
                    </button>
                    
            
                </form>
                <DevTool control = { control } />
                <div className = "text-blue-500 text-ms flex flex-row justify-center align-item mt-10">
                    Looking for player login?
                    <Link
                        to = "/user-login"
                        className = "hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                    >
                        Back to player login
                    </Link>
                </div>
            </div>
        </>
    );
}

export default AdministratorLogin;