import PropTypes from "prop-types";
import { useState } from "react";

const Step4 = ({ register, errors }) => {

    // const for 'Other' option being selected in Emergency Relationship form
    const[isOtherEmergencyRelationship, setIsOtherEmergencyRelationship] = useState(false);
  
    const handleEmergencyRelationshipChange = (event) => {
        setIsOtherEmergencyRelationship(event.target.value === "Other");
    };

    return (
        <div>
            <h2 className = "text-xl font-extrabold"> Medical Information </h2>
            <p> Please enter your relevant health details </p>

            <div className = "flex flex-col gap-5 mt-8">

                {/* BLOOD TYPE */}
                <div className = "flex flex-col gap-2">
                    <label
                        htmlFor = "bloodType"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Select your blood type
                    </label>
                    <select
                        className = "border p-2"
                        id = "bloodType"
                        {...register("bloodType", {
                            required: "You need to select your blood type.",
                        })}
                    >
                        <option value = ""> Select blood type </option>
                        <option value = "A+">  A+  </option>
                        <option value = "A-">  A-  </option>
                        <option value = "B+">  B+  </option>
                        <option value = "B-">  B-  </option>
                        <option value = "O+">  O+  </option>
                        <option value = "O-">  O-  </option>
                        <option value = "AB+"> AB+ </option>
                        <option value = "AB-"> AB- </option>
                    </select>
                    <p className = "error"> {errors.bloodType?.message} </p>
                </div>

                {/* EMERGENCY CONTACT DETAILS */}
                <h3 className = "pt-5 text-xl font-extrabold"> Emergency Contact Details </h3>
                <div className = "flex gap-5">

                    {/* EMERGENCY CONTACT FIRST NAME */}
                    <div className = "flex flex-col gap-1">
                        <label
                            htmlFor = "emergencyContactFirstName"
                            className = "block text-sm font-medium text-gray-700"
                        >
                            First Name
                        </label>
                        <input
                            className = "border p-2"
                            type = "text"
                            id = "emergencyContactFirstName"
                            placeholder = "First Name"
                            {...register("emergencyContactFirstName", {
                                required: "Your emergency contact's first name is required.",
                            })}
                        />
                        <p className = "error"> {errors.emergencyContactFirstName?.message} </p>
                    </div>

                    {/* EMERGENCY CONTACT LAST NAME */}
                    <div className = "flex flex-col gap-1">
                        <label
                            htmlFor = "emergencyContactLastName"
                            className = "block text-sm font-medium text-gray-700"
                        >
                            Last Name
                        </label>
                        <input
                            className = "border p-2"
                            type = "text"
                            id = "emergencyContactLastName"
                            placeholder = "Last Name"
                            {...register("emergencyContactLastName", {
                                required: "Your emergency contact's last name is required.",
                            })}
                        />
                        <p className = "error"> {errors.emergencyContactLastName?.message} </p>
                    </div>
                </div>

                {/* EMERGENCY CONTACT NUMBER */}
                <div className = "flex flex-col gap-2">
                    <label
                        htmlFor = "emergencyContactPhoneNumber"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Phone Number
                    </label>
                    <input
                        className = "border p-2"
                        type = "number"
                        id = "emergencyContactPhoneNumber"
                        placeholder = "e.g. 98765432"
                        {...register("emergencyContactPhoneNumber", {
                            required: "You need to input your emergency contact's phone number",
                        })}
                    />
                    <p className = "error"> {errors.emergencyContactPhoneNumber?.message} </p>
                </div>

                {/* EMERGENCY CONTACT RELATIONSHIP */}
                <div className = "flex flex-col gap-2">
                    <label
                        htmlFor = "emergencyContactRelationship"
                        className = "block text-sm font-medium text-gray-700"
                    >
                        Relationship
                    </label>
                    <select
                        className = "border p-2"
                        id = "emergencyContactRelationship"
                        {...register("emergencyContactRelationship", {
                            required: "You need to select the relationship with your emergency contact",
                        })}
                        onChange = {handleEmergencyRelationshipChange}
                    >
                        <option value = ""> Select Relationship </option>
                        <option value = "Mother">  Mother  </option>
                        <option value = "Father">  Father  </option>
                        <option value = "Sibling"> Sibling </option>
                        <option value = "Spouse">  Spouse  </option>
                        <option value = "Friend">  Friend  </option>
                        <option value = "Other">   Other   </option>
                    </select>
                    <p className = "error"> {errors.emergencyContactRelationship?.message} </p>
                    {isOtherEmergencyRelationship && (                              // if 'Other' option was selected -> text box input
                        <div className = "flex flex-col gap-1 mt-2">
                            <label
                                htmlFor = "otherRelationship"
                                className = "block text-sm font-medium text-gray-700"
                            >
                                Please specify:
                            </label>
                            <input
                                className = "border p-2"
                                type = "text"
                                id = "otherRelationship"
                                placeholder = "Specify your relationship"
                                {...register("otherRelationship", {
                                    required: isOtherEmergencyRelationship ? "Please specify the relationship" : false, 
                                })}
                            />
                            <p className = "error"> {errors.otherRelationship?.message} </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

Step4.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        bloodType: PropTypes.object,
        emergencyContactFirstName: PropTypes.object,
        emergencyContactLastName: PropTypes.object,
        emergencyContactPhoneNumber: PropTypes.object,
        emergencyContactRelationship: PropTypes.object,
        otherRelationship: PropTypes.object,
    }).isRequired,
};

export default Step4;