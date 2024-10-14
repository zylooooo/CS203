import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function EditProfileForm() {
    const location = useLocation();

    const navigate = useNavigate();

    const { userPersonalInformation } = location.state;

    const [formData, setFormData] = useState(userPersonalInformation);

    // Function that saves user's changes after editing.
    // There should be an API call to the backend to update the database, based on the changes done, if any.
    const handleSubmitChanges = (e) => {
        e.preventDefault();
        navigate("/user-profile");
    };

    const handleBackToProfile = () => {
        navigate("/user-profile");
    }

    const handleBackButtonClick = () => {
        navigate("/user-profile");
    }

    return (
        <div className = "edit-profile-information p-6 bg-white rounded-lg shadow-md w-2/5 mx-auto">

            <div className = "flex items-center gap-4">
                {/* BACK BUTTON */}
                <FontAwesomeIcon
                    icon = {faArrowLeft}
                    onClick = {handleBackButtonClick}
                    className = "back-icon cursor-pointer text-xl"
                />
                <h2 className = "text-xl font-semibold mb-4 mt-3"> Edit Profile </h2>
            </div>

            

            {/* EDIT PROFILE PICTURE */}
            <div className = "edit-profile-picture flex items-center border p-4 rounded-lg shadow-md mb-3">
                <div className="w-1/3">
                    <img
                        src = {userPersonalInformation.profilePic}
                        alt = "Profile"
                        className = "w-32 h-32 object-cover rounded-full border"
                    />
                </div>

                <div className = "w-2/3 flex justify-end">
                    <button className = "py-2 px-4 text-white rounded-lg border mr-4">
                        Change Photo
                    </button>
                </div>
            </div>

            <form onSubmit = {handleSubmitChanges} className = "grid grid-cols-1 gap-4">
                {["firstName", "lastName", "emailAddress", "dateOfBirth", "userName", "password"].map((field) => (
                    <div className = "mt-5" key = {field}>
                        <label className = "block text-sm font-medium text-gray-700">
                            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                            <input
                                type = {field === "dateOfBirth" ? "date" : field === "password" ? "password" : "text"}
                                name = {field}
                                value = {formData[field]}
                                className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </label>
                    </div>
                ))}

                <div className = "flex justify-center mt-4">
                    <button
                        type = "submit"
                        className = "rounded-lg border w-1/2 py-2 px-4"
                    >
                        Save Changes
                    </button>
                </div>
            </form>

            <div className = "flex justify-center mt-4">
                <button
                    onClick = {handleBackToProfile}
                    className = "py-2 px-4 rounded-lg border w-1/2"
                >
                    Back to Profile
                </button>
            </div>
        </div>
    );
}

export default EditProfileForm;