import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";

const TournamentCardTemplate = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const tournamentDetails = location.state;                       // retrieve tournament details from clicked tournament (takes its state)

    const [hasJoined, setHasJoined] = useState(false)               // state for tracking if user has joined the tournament

    const[isMedicalFormOpen, setIsMedicalFormOpen] = useState(false)  // state for tracking if the medical form is opened

    const { register, handleSubmit, formState: { errors }} = useForm();

    const onSubmit = (data) => {
        setIsMedicalFormOpen(false);
        setHasJoined(true);
        console.log(data);
    }

    const handleBackButtonClick = () => {
        navigate("/user-tournaments");                              // future updates: should go back to the state that the user was in (whether scrolled further down, in upcoming/schedule/past tournaments)
    }

    const handleJoinTournamentButtonClick = () => {                 // opens the form
        setIsMedicalFormOpen(true);
    }

    const handleLeaveTournamentButtonClick = () => {                // revert state to 'not joined'
        setHasJoined(false);
    }


    return (
        <div className = "tournament-card-template main-container flex">

            <div className = "flex flex-col w-3/5 gap-4 border p-8">

                {/* LAYER 1 */}
                <div className = "flex items-center gap-4">
                    {/* BACK BUTTON */}
                    <FontAwesomeIcon
                        icon = {faArrowLeft}
                        onClick = {handleBackButtonClick}
                        className = "back-icon cursor-pointer text-xl"
                    />
                    {/* TOURNAMENT NAME */}
                    <h1 className = "text-2xl font-bold"> {tournamentDetails.name} </h1>
                </div>

                {/* LAYER 2 */}
                <div className = "organizer-details flex items-center gap-2">
                    <img
                        src = {tournamentDetails.organizerProfilePicture}
                        alt = "Organizer"
                        className = "w-10 h-10 rounded-full"
                    />
                    <p className = "text-lg"> Organiser: {tournamentDetails.organizerName} </p>
                </div>

                {/* LAYER 3 */}
                <p>
                    Date: {tournamentDetails.startDate} to {tournamentDetails.endDate}
                </p>

                {/* LAYER 4 */}
                <p>
                    Elo Rating: {tournamentDetails.eloRatingRange}
                </p>

                {/* LAYER 5 */}
                <p>
                    Game Type: {tournamentDetails.gameType}
                </p>

                {/* LAYER 6 */}
                {tournamentDetails.remarks && (
                    <p>
                        Remarks: {tournamentDetails.remarks}
                    </p>
                )}

                {/* LAYER 7 */}
                <p>
                    Venue: {tournamentDetails.venue}
                </p>

                {/* LAYER 8 */}
                <div className = "map-api-container h-64 border rounded">
                    <p className = "text-center p-4"> Insert map here. </p>
                </div>

                {/* LAYER 9 */}
                <div className = "join-leave-tournament-buttons mt-4">
                    {hasJoined ? (
                        <div className = "flex items-center gap-4">
                            <div className = "user-joined border rounded-xl p-4">
                                You have joined this tournament!
                            </div>
                            <button
                                onClick = {handleLeaveTournamentButtonClick}
                                className = "border rounded-xl px-4 py-2"
                            >
                                Leave tournament
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick = {handleJoinTournamentButtonClick}
                            className = "border rounded-xl px-4 py-2">
                                Join this tournament!
                            </button>
                    )}
                </div>
            </div>

            {/* EMERGENCY CONTACT FORM */}
            {isMedicalFormOpen && (
                <div className = "modal fixed inset-0 flex items-center justify-center">
                    <div className = "p-6 rounded-lg w-1/3" style = {{ backgroundColor: 'white' }}>
                        <form onSubmit = {handleSubmit(onSubmit)}>
                            <h2 className = "text-xl font-bold mb-4"> Emergency Contact Details </h2>
                            <div className = "mb-4">
                                <label className = "block text-sm mb-2"> Name: </label>
                                <input
                                    type = "text"
                                    placeholder = "Enter the name of your emergency contact"
                                    className = "w-full border px-3 py-2 rounded"
                                    id = "emergencyContactName"
                                    {...register("emergencyContactName", {
                                        required: "Your emergency contact's name is required!",
                                    })}
                                />
                                <p className = "error"> {errors.emergencyContactName?.message} </p>
                            </div>

                            <div className = "mb-4">
                                <label className = "block text-sm mb-2"> Phone Number </label>
                                <input
                                    type = "text"
                                    placeholder = "Enter the contact number of your emergency contact"
                                    className = "w-full border px-3 py-2 rounded"
                                    id = "emergencyContactNumber"
                                    {...register("emergencyContactNumber", {
                                        required: "Your emergency contact's number is required!",
                                    })}
                                />
                                <p className = "error"> {errors.emergencyContactNumber?.message} </p>
                            </div>

                            <div className = "mb-4">
                                <label className = "block text-sm mb-2"> Relationship </label>
                                <input
                                    type = "text"
                                    placeholder = "Enter the relationship with your emergency contact"
                                    className = "w-full border px-3 py-2 rounded"
                                    id = "emergencyContactRelationship"
                                    {...register("emergencyContactRelationship", {
                                        required: "The relationship of your emergency contact is required!",
                                    })}
                                />
                                <p className = "error"> {errors.emergencyContactRelationship?.message} </p>
                            </div>

                            <button
                                type = "submit"
                                className = "px-4 py-2 rounded mt-4 border"
                            >
                                Done
                            </button> 
                        </form>
                    </div>
                </div>
                )}

                <div className = "col-container">
                    Ongoing Tournaments
                </div>
            </div>
    );
};

TournamentCardTemplate.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        emergencyContactName: PropTypes.object,
        emergencyContactNumber: PropTypes.object,
        emergencyContactRelationship: PropTypes.object,
    }).isRequired,
};

export default TournamentCardTemplate;

// create cancel button in emergency form
// create button to view emergency contact details and edit