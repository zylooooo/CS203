import React from 'react';

const ProfilePage = () => {
  const playerProfile = {
    firstName: "Augustus",
    lastName: "Gloop",
    profilePicture: "path-to-profile-picture", // replace with your profile picture source
    emailAddress: "FatAugustus@willywonka.com",
    phoneNumber: "976723423",
    eloRating: "600",
    gender: "M",
    dateOfBirth: "29/02/1996",
    password: "iLoveChinks@12345",
    emergencyContact: "98278434",
    emergencyContactName: "Donald Trump",
    emergencyContactRelationship: "Father",
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Profile Section */}
      <div className="flex items-center">
        {/* Circular Profile Picture */}
        <img
          src={playerProfile.profilePicture}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mr-6"
        />
        {/* User Info */}
        <div>
          <h1 className="text-2xl font-bold">
            {playerProfile.firstName} {playerProfile.lastName}
          </h1>
          <p className="text-gray-600">{playerProfile.dateOfBirth}</p>
          <p className="text-gray-600">{playerProfile.emailAddress}</p>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mt-6 flex justify-between">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Edit Personal Information
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Edit Medical Information
        </button>
      </div>

      {/* Availability Section */}
      <div className="mt-6 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold">Edit Your Availability</h2>
        {/* Placeholder for calendar API */}
      </div>
    </div>
  );
};

export default ProfilePage;
