import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/login-picture.jpg";

// Form imports
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

function AdministratorLogin() {
  const form = useForm();
  const { register, control, handleSubmit, formState } = form;
  const { errors } = formState;
  const { loginAdmin } = useAuth(); // Destructure loginAdmin from AuthContext
  const navigate = useNavigate(); // For navigation after login
  const [loginError, setLoginError] = useState(""); // State for handling login errors

  const onSubmit = async (data) => {
    try {
      // Implement your API call for admin authentication
      const response = await authenticateAdmin(data.username, data.password);

      if (response.success) {
        // Assume response.admin contains admin data
        loginAdmin(response.admin); // Update AuthContext with admin data
        navigate("/administrator-tournaments"); // Redirect to admin tournaments page
      } else {
        // Handle authentication failure
        setLoginError(response.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <div
        className="bg-cover bg-center h-screen-minus-navbar w-screen flex flex-col justify-center items-center"
        style={{ backgroundImage: `url(${loginBackground})` }}
      >
        {/* TESTING CODE REMOVE LATER */}
        <button
          type="button"
          className="button mt-6 font-bold hover:shadow-inner"
          onClick={() => {
            loginAdmin({ name: "Test Admin", role: "admin" });
            navigate("/administrator-tournaments");
          }}
        >
          Manual Admin Login
        </button>
        <div className="card rounded-none bg-primary-color-white border-none items-center m-8">
          <h1 className=" font-bold text-2xl">Administrator Login</h1>
            <form
              className="card px-2 py-4 border-none shadow-none bg-primary-color-white"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  className="input"
                  type="text"
                  id="username"
                  placeholder="admin"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
                <p className="error">{errors.username?.message}</p>
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

              {loginError && (
                <p className="error text-red-500 mt-2">{loginError}</p>
              )}

              <button
                type="submit"
                className="button mt-6 font-bold hover:shadow-inner"
              >
                Log In
              </button>
              <div className="flex items-center justify-center py-3">
                <div className="border-t border-gray-100 flex-grow mr-3 opacity-50"></div>
                <span className="text-gray-199 text-xs opacity-50">OR</span>
                <div className="border-t border-gray-100 flex-grow ml-3 opacity-50"></div>
              </div>
              <div className="text-xs text-center p-2">
                <Link
                  to="/administrator-sign-up"
                  className="hover:text-primary-color-green font-bold underline p-2 text-secondary-color-dark-green"
                >
                  Sign up as a new administrator!
                </Link>
              </div>
            </form>
          </div>

          <DevTool control={control} />
        <div className="card p-7 rounded-none bg-primary-color-white border-none items-center">
          <div className="text-ms flex flex-row justify-center align-item">
            RallyRank Player?
            <Link
              to="/user-login"
              className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
            >
              Log in here!
            </Link>
          </div>
        </div>

        </div>
    </>
  );
}

export default AdministratorLogin;
