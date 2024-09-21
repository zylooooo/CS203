import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import { useState } from "react";

function Profile() {
    const [activeSection, setActiveSection] = useState("profile");

    const handlePersonalInfoClick = () => {
      setActiveSection("personalInfo");
    };
  
    const handleMedicalInfoClick = () => {
      setActiveSection("medicalInfo");
    };
  
    const handleBackToProfile = () => {
      setActiveSection("profile");
    };

  return (
    <div className="profile-page flex flex-col w-3/4 p-9 gap-5 justify-center">
       {activeSection === "profile" && (
        <>
          {/* PLAYERS PROFILE INFO */}
          <div className="profile-info flex w-full m-10 justify-left">
            <img
              src={profilePictureTest1}
              alt="Profile Picture"
              className="profile-picture w-12 h-12 rounded-full"
            />
          </div>

          {/* EDIT PERSONAL AND MEDICAL INFO */}
          <div className="profile-edit-info flex gap-5">
            {/* EDIT PERSONAL INFO */}
            <button
              onClick={handlePersonalInfoClick}
              className="edit-personal-info-button bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 shadow-md transition duration-300 ease-in-out"
            >
              Edit Personal Info
            </button>

            {/* EDIT MEDICAL INFO */}
            <button
              onClick={handleMedicalInfoClick}
              className="edit-medical-info-button bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 shadow-md transition duration-300 ease-in-out"
            >
              Edit Medical Info
            </button>
          </div>

          {/* EDIT AVAILABILITY */}
          <div className="profile-edit-availability w-full justify-center">
            Edit Your Availability
            {/* TEMP AVAILABILITY CALENDAR BOX */}
            <div className="availability-api border h-10"></div>
          </div>
        </>
      )}

      {activeSection === "personalInfo" && (
        <div className="personal-info-section">
          <h2>Personal Information</h2>
          {/* Content for personal information form */}
          <button
            onClick={handleBackToProfile}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Back to Profile
          </button>
        </div>
      )}

      {activeSection === "medicalInfo" && (
        <div className="medical-info-section">
          <h2>Medical Information</h2>
          {/* Content for medical information */}
          <button
            onClick={handleBackToProfile}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Back to Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
