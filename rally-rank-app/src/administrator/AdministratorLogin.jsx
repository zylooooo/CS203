import React, { useState, useEffect } from "react";
import { Link, useNavigate  } from "react-router-dom";
import loginBackground from "../assets/login-picture.jpg";
import axios from "axios";

// Form imports
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

// Authentication imports
import { useAuth } from "../authentication/AuthContext"; // Import the AuthContext

import rallyRankLogo from "../assets/Rally-Rank-Logo.svg"; // Import the RallyRank logo

function AdministratorLogin() {
  const form = useForm();
  const { register, control, handleSubmit, formState } = form;
  const { errors } = formState;
  const { loginAdmin, isAdminLoggedIn } = useAuth(); // Destructure loginAdmin from AuthContext
  const navigate = useNavigate(); // For navigation after login
  const [loginError, setLoginError] = useState(""); // State for handling login errors

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate("/administrator-tournaments");
    }
  }, [navigate, isAdminLoggedIn])

  async function authenticateAdmin(adminName, password) {
      try {
          const response = await axios.post(
              "http://localhost:8080/auth/admin-login",
              { adminName, password },
              { withCredentials: true } // Allow credentials (cookies) to be sent with the request
          );
          
          if (response.status === 200) {
              setLoginError("Successfully login!");

              // Return the LoginResponse object containing JWT and expiration time
              return response.data;
          }
      } catch (error) {
          setLoginError(error.response.data.error)
      }
  }

  const onSubmit = async (formData) => {
      // Call the authenticateUser function with username and password
      const response = await authenticateAdmin(
          formData.adminName,
          formData.password
      );

      if (response !== undefined) {
          // Store user in local database
          const adminData = {
              adminName: formData.adminName,
              role: "ADMIN",
              jwtToken: response.token,
              jwtExpiration: response.expiresIn,
          };
      
          // Change state to user
          loginAdmin(adminData);

          // Re-route to home
          navigate("/administrator-tournaments");
      } 
  };

  return (
    <>
      <div
          className="bg-cover bg-center flex flex-col justify-center items-center h-main w-screen overflow-hidden"
          style={{ backgroundImage: `url(${loginBackground})`, objectFit: 'cover', backgroundAttachment: 'fixed' }}
      >
        {/* TESTING CODE REMOVE LATER
        <button
          type="button"
          className="button mt-6 font-bold hover:shadow-inner"
          onClick={() => {
            loginAdmin({ name: "Test Admin", role: "admin" });
            navigate("/administrator-tournaments");
          }}
        >
          Manual Admin Login
        </button> */}
        <div className="card rounded-[8px] bg-primary-color-white border-none items-center m-8">
          <img className="h-[60px] w-full mb-1" src={rallyRankLogo} alt="RallyRank Logo" />
            <form
              className="card px-2 py-4 border-none shadow-none bg-primary-color-white"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label
                  htmlFor="adminName"
                  className="block text-sm font-medium text-gray-700"
                >
               
                </label>
                <input
                  className="w-full border-0 border-b border-gray-300  focus:outline-none p-2"
                  style={{
                      borderBottomColor: "#555555",
                      borderBottomWidth: "1.5px",
                  }}
                  type="text"
                  id="adminName"
                  placeholder="Administrator Username"
                  {...register("adminName", {
                    required: "Admin Username is required",
                  })}
                />
                <p className="error">{errors.adminName?.message}</p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
              
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full border-0 border-b border-gray-300  focus:outline-none p-2"
                                style={{
                                    borderBottomColor: "#555555",
                                    borderBottomWidth: "1.5px",
                                }}
                  placeholder="Password"
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
                style = {{ backgroundColor: "#80b577" }}
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
              <div className="text-xs text-center">
                  <Link
                      to="/auth/admin-verify"
                      className="hover:text-primary-color-green p-2 text-secondary-color-dark-green"
                  >
                      Looking to verify? Click here
                  </Link>
              </div>
            </form>
          </div>

          <DevTool control={control} />
        <div className="card p-7 rounded-[8px] bg-primary-color-white border-none items-center">
          <div className="text-ms flex flex-row justify-center align-item">
            RallyRank Player?
            <Link
              to="/auth/user-login"
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
