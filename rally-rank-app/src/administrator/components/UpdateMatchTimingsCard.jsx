// Administrator Fixtures

// Package Imports
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

// Components and Assets Imports
import AlertMessageSuccess from "../../components/AlertMessageSuccess";
import AlertMessageWarning from "../../components/AlertMessageWarning";

const UpdateMatchTimingsCard = ({ matchDetails, setShowUpdateMatchTimingsCard }) => {
    const { handleSubmit, formState: { errors }, setError, clearErrors } = useForm();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

    const onDateChange = (e) => {
        setDate(e.target.value);
        clearErrors("startDate");
    };
    
    const onTimeChange = (e) => {
        setTime(e.target.value);
        clearErrors("startDate");
    };

    // ----------------------- API Call: Update a specific match timing -----------------------
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
                "http://localhost:8080/admins/tournaments/match",
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
            // Warning Alert Message: Unable to update the match timings
            alert("Unable to update match timings.");
            console.error("Error updating match timings: ", error.response);
        }
    };

    const onUpdateMatchTimingsSubmit = async (formData) => {
        const startDate = new Date(`${date}T${time}`);
        const now = new Date();
        // Check if startDate input is in the future
        if (startDate > now) {
            setError("startDate", {
                type: "manual",
                message: "Date and time cannot be in the future.",
            });
            return;
        }
        setShowConfirmationPopup(true);
    };

    const handleFinalConfirmation = async () => {
        const startDate = new Date(`${date}T${time}`);
        const response = await updateMatchTimings({ startDate: startDate.toISOString() });
        if (response !== undefined) {
            alert("Match timings updated successfully");
            setShowUpdateMatchTimingsCard(false);
        }
    };

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
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
                        {/* UPDATE MATCH DATE AND TIME */}
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
                                style ={{
                                    borderBottomColor: "#555555",
                                    borderBottomWidth: "1.5px",
                                }}
                                type = "time"
                                value = {time}
                                onChange = {onTimeChange}
                                required
                            />
                            {errors.startDate && <p className = "error"> {errors.startDate.message} </p>}
                        </div>
                        <div className = "flex justify-between">
                            {/* CANCEL BUTTON */}
                            <button
                                type = "button"
                                onClick = {() => setShowUpdateMatchTimingsCard(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            {/* SUBMIT BUTTON */}
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-custom-green transition"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </form>
                {showConfirmationPopup && (
                    <div className = "confirmation-popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className = "bg-white p-8 rounded-lg shadow-lg w-1/3 text-center ">
                            <h2 className = "text-xl font-semibold mb-4"> Are you sure? </h2>
                            <p className = "mb-6 font-semibold"> Do you want to confirm the match date? </p>
                            <div className = "flex justify-between">
                                <button
                                    onClick = {() => setShowConfirmationPopup(false)}
                                    className = "px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick = {handleFinalConfirmation}
                                    className = "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateMatchTimingsCard;