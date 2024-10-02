import userProfilePicture from "../assets/profile-picture-user.png"; // Replace with API call for user's profile picture
import { useState, useEffect } from "react";

function UserProfile() {
    const [activeSection, setActiveSection] = useState("profile");

    // Replace with API call for user's personal information
    const [personalInformation, setPersonalInformation] = useState({
        firstName: "Augustus",
        lastName: "Gloop",
        emailAddress: "iamfat@willywonka.com",
        dateOfBirth: "29/02/1996",
    });

    // Replace with API call for user's medical information
    const [medicalInformation, setMedicalInformation] = useState({
        emergencyContact: "98765433",
        emergencyContactName: "Donald Trump",
        emergencyContactRelationship: "Father",
        bloodType: "C+",
    });

    // To retrieve the system's current month (automatically updated)
    const getCurrentMonth = () => {
        const monthLengthType = {month: "long"};
        return new Intl.DateTimeFormat('en-US', monthLengthType).format(new Date());
    };

    // to enter section for editing user's Personal Information
    const handlePersonalInformationClick = () => {
        setActiveSection("editPersonalInformation");
    };

    // to enter section for editing user's Medical Information
    const handleMedicalInformationClick = () => {
        setActiveSection("editMedicalInformation");
    };

    // to return back to profile page from other sections
    const handleBackToProfile = () => {
        setActiveSection("profile");
    };

    // <need API call or function to retrieve and send edited information>

    return (
        <>
        <div className = "profile-page flex flex-col w-3/4 p-9 gap-5 justify-center">
            {activeSection === "profile" &&(
                <>
                    {/* USER'S PROFILE */}
                    <div className = "profile-information flex w-full m-10 justify-left items-center">
                        <img 
                            src = {userProfilePicture}
                            alt = "Profile Picture"
                            className = "w-[150px] h-[150px] rounded-full object-cover mr-6 border" 
                        />
                        <div>
                            {/* USER FIRST AND LAST NAME */}
                            <h1
                                className = "text-2xl font-bold"
                                style = {{ color: '#676767', fontSize: '24px' }}
                            >
                                {personalInformation.firstName} {personalInformation.lastName}  
                            </h1>

                            {/* USER DATE OF BIRTH */}
                            <p
                                className = "mt-2 font-bold"
                                style = {{ color: '#A6A6A6', fontSize: '14px' }}
                            >
                                {personalInformation.dateOfBirth}
                            </p>

                            {/* USER EMAIL ADDRESS */}
                            <p
                                className = "mt-2 font-bold"
                                style = {{ color: '#A6A6A6', fontSize: '14px' }}
                            >
                                {personalInformation.emailAddress}
                            </p>
                        </div>
                    </div>

                    {/* EDIT PERSONAL AND MEDICAL INFORMATION */}
                    <div className = "profile-edit-information flex gap-8">
                        {/* EDIT PERSONAL INFORMATION */}
                        <button
                            onClick = {handlePersonalInformationClick}
                            style = {{ backgroundColor: '#DDDDDD', color: '#676767', fontSize: '14px' }}
                            className = "bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 shadow-md transition duration-300 ease-in-out w-[205px] h-[40px]"
                        >
                            Edit Personal Information
                        </button>

                        {/* EDIT PERSONAL INFORMATION */}
                        <button
                            onClick = {handleMedicalInformationClick}
                            style = {{ backgroundColor: '#DDDDDD', color: '#676767', fontSize: '14px' }}
                            className = "bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 shadow-md transition duration-300 ease-in-out w-[205px] h-[40px]"
                        >
                            Edit Personal Information
                        </button>
                    </div>

                    {/* EDIT AVAILABILITY */}
                    <div className = "mt-5">
                        <h2 className = "text-lg font-bold mb-2"> Edit your availability </h2>
                        <div className = "profile-edit-availability w-full h-[300px] justify-center mt-6 border p-10">
                            <h2 
                                className = "text-md font-bold mb-2"
                                style = {{ fontSize: '14px', color: '#A6A6A6' }}
                            >
                                Indicate your availability for {getCurrentMonth()}.
                            </h2>
                            <div className = "calendar-section w-full h-[200px] border p-2">
                                Calendar goes here.
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* EDIT PERSONAL INFORMATION SECTION */}
            {activeSection === "editPersonalInformation" && (
                <div className = "edit-personal-information-section p-6 bg-white rounded-lg shadow-md">
                    <h2 className = "text-xl font-semibold mb-4"> Personal Information </h2>
                    <form className = "grid grid-cols-1 gap-4">

                        {/* LIST OF PERSONAL INFORMATION */}
                        <div className = "mt-2">
                            <label className = "block text-sm font-medium text-gray-700">
                                First Name:
                                <input
                                    type = "text"
                                    name = "firstName"
                                    value = {personalInformation.firstName}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Last Name:
                                <input
                                    type = "text"
                                    name = "lastName"
                                    value = {personalInformation.lastName}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Email Address:
                                <input
                                    type = "text"
                                    name = "emailAddress"
                                    value = {personalInformation.emailAddress}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Date of Birth:
                                <input
                                    type = "date"
                                    name = "dateOfBirth"
                                    value = {personalInformation.dateOfBirth}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <button
                            type = "submit"
                            className = "bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 border"
                        >
                            Save Changes
                        </button>
                    </form>

                    <button
                            onClick = {handleBackToProfile}
                            className = "bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 border"
                        >
                            Back to Profile
                    </button>
                </div>
            )}

            {/* EDIT MEDICAL INFORMATION SECTION */}
            {activeSection === "editMedicalInformation" && (
                <div className = "edit-medical-information-section">
                    <h2> Medical Information and Emergency Contact Details </h2>
                    <form>

                        {/* LIST OF MEDICAL INFORMATION */}
                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Emergency Contact Full Name:
                                <input
                                    type = "text"
                                    name = "emergencyContactName"
                                    value = {medicalInformation.emergencyContactName}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Emergency Contact Contact Number:
                                <input
                                    type = "text"
                                    name = "emergencyContact"
                                    value = {medicalInformation.emergencyContact}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Emergency Contact Relationship:
                                <input
                                    type = "text"
                                    name = "emergencyContactRelationship"
                                    value = {medicalInformation.emergencyContactRelationship}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <div className = "mt-5">
                            <label className = "block text-sm font-medium text-gray-700">
                                Your Blood Type:
                                <input
                                    type = "text"
                                    name = "bloodType"
                                    value = {medicalInformation.bloodType}
                                    className = "mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </label>
                        </div>

                        <button
                            type = "submit"
                            className = "bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 border"
                        >
                            Save Changes
                        </button>
                    </form>

                    <button
                            onClick = {handleBackToProfile}
                            className = "bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 border"
                        >
                            Back to Profile
                    </button>
                </div>
            )}
        </div>
        </>
    );
}

export default UserProfile;