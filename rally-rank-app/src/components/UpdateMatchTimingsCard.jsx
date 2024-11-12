// Configuration imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

// Administrator Components Imports
import ConfirmationPopUp from "./ConfirmationPopUp";

// Components and Assets Imports
import AlertMessageSuccess from "./AlertMessageSuccess";
import AlertMessageWarning from "./AlertMessageWarning";

const UpdateMatchTimingsCard = ({ matchDetails, setShowUpdateMatchTimingsCard }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [showConfirmationPopUp, setShowConfirmationPopUp] = useState(false);
    const { handleSubmit, formState: { errors }, setError, clearErrors } = useForm();

   // For Alert Messages
   const [warningMessage, setWarningMessage] = useState("");
   const [successMessage, setSuccessMessage] = useState("");

    // ----------------------- API Call: Update a specific match timing information -----------------------
    async function updateMatchTimings(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const updatedMatchStartDate = {
                ...matchDetails,
                startDate: formData.startDate,
            };
            const response = await axios.put(
                `${API_URL}/admins/tournaments/match`,
                updatedMatchStartDate,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            setWarningMessage('Unable to set match timings. Please try again.');
            console.error("Error updating match timings: ", error.response);
        }
    }

    const onDateChange = (e) => {
        setDate(e.target.value);
        clearErrors("startDate");
    };
    
    const onTimeChange = (e) => {
        setTime(e.target.value);
        clearErrors("startDate");
    };

    const onUpdateMatchTimingsSubmit = async () => {
        setShowConfirmationPopUp(true);
    };

    const handleFinalConfirmation = async () => {
        console.log("Date: ", date, time);
        const startDate = new Date(`${date}T${time}`);
        console.log("staetDate: ", startDate);
        const response = await updateMatchTimings({ startDate: startDate.toISOString() });
        if (response !== undefined) {
            setSuccessMessage("Match timings set!");
            setShowUpdateMatchTimingsCard(false);
        }
    };

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div className = "update-match-results-card-template flex flex-col gap-4 p-9 rounded-[12px] max-w-[550px] bg-primary-color-white">
                <form onSubmit = {handleSubmit(onUpdateMatchTimingsSubmit)}>
                    <div className = "flex flex-col gap-6">
                        <div>
                            <h1 className = "text-2xl font-semibold"> Match Timing </h1>
                        </div>
                        <div className = "flex justify-center mt-2">
                            <p className = "text-center font-semibold text-lg">
                                <strong> {matchDetails.players[0]} </strong> VS <strong> {matchDetails.players[1]} </strong>
                            </p>
                        </div>
                        <div>
                            <label className = "font-semibold"> Date: </label>
                            <input
                                className = "p-2 m-3 border-0 border-b focus:border-blue-500 border-gray-300 focus:outline-none"
                                style = {{
                                    borderBottomColor: "#555555",
                                    borderBottomWidth: "1.5px",
                                }}
                                type = "date"
                                value = {date}
                                onChange = {onDateChange}
                                required
                            />
                            <label className = "font-semibold"> Time: </label>
                            <input
                                className = "p-2 m-3 border-0 border-b focus:border-blue-500 border-gray-300 focus:outline-none"
                                style = {{
                                    borderBottomColor: "#555555",
                                    borderBottomWidth: "1.5px",
                                }}
                                type = "time"
                                value = {time}
                                onChange = {onTimeChange}
                                required
                            />
                            {errors.startDate && <p className="error"> {errors.startDate.message} </p>}
                        </div>
                        <div className = "flex justify-between">
                            <button
                                type = "button"
                                onClick = {() => setShowUpdateMatchTimingsCard(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-custom-green transition"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </form>
                {showConfirmationPopUp && (
                    <ConfirmationPopUp
                        message = "Do you want to confirm the match date and time?"
                        onConfirm = {handleFinalConfirmation}
                        onCancel = {() => setShowConfirmationPopUp(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default UpdateMatchTimingsCard;