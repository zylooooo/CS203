// Used In: AdministratorFixtures.jsx

// Package Imports
import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

// Assets and Components Imports
import AlertMessageSuccess from '../../components/AlertMessageSuccess';
import AlertMessageWarning from '../../components/AlertMessageWarning';

// Icons Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Administrator Components Imports
import ConfirmationPopUp from './ConfirmationPopUp';

// Main UpdateResultsCard Component
const UpdateResultsCard = ({ matchDetails, setShowUpdateResultsCard }) => {
    const [sets, setSets] = useState([1]);
    const [matchWinner, setMatchWinner] = useState("");
    const [storedFormData, setStoredFormData] = useState(null);
    const { register, handleSubmit, formState: { errors }} = useForm();
    const [showConfirmationPopUp, setShowConfirmationPopUp] = useState(false);

    const player1 = matchDetails.players[0];
    const player2 = matchDetails.players[1];

    // Function to determine match winner based on the number of sets won
    function determineSetWinner(setScores, player1, player2) {
        let player1Sets = 0;
        let player2Sets = 0;
        setScores.forEach(set => {
            if (set.result[0] > set.result[1]) {
                player1Sets++;
            }
            if (set.result[1] > set.result[0]) {
                player2Sets++;
            }
        });
        return player1Sets > player2Sets ? player1 : player2;
    };

    // ----------------------- API Call: Update a specific match result information -----------------------
    async function updateMatchResults(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const setScores = sets.map((setNumber) => ({
                result: [
                    parseInt(formData[`set${setNumber}Player1`]),
                    parseInt(formData[`set${setNumber}Player2`]),
                ],
                setWinner: formData[`set${setNumber}Player1`] > formData[`set${setNumber}Player2`] ? player1 : player2,
            }));

            const winner = determineSetWinner(setScores, player1, player2);
            setMatchWinner(winner);

            const updatedMatchDetails = {
                id: matchDetails.id,
                tournamentName: matchDetails.tournamentName,
                startDate: matchDetails.startDate,
                players: matchDetails.players,
                sets: setScores.map(score => ({
                    result: score.result,
                    setWinner: score.setWinner,
                })),
                matchWinner: winner,
                completed: true,
            };

            const response = await axios.put(
                "http://localhost:8080/admins/tournaments/match",
                updatedMatchDetails,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );
            return response.data;

        } catch (error) {
            alert("Unable to update match results.");
            console.error("Error updating match results: ", error.response.data.error);
        }
    };

    const onUpdateMatchDetailsSubmit = async (formData) => {
        setStoredFormData(formData);
        setShowConfirmationPopUp(true);
    };

    const handleFinalConfirmation = async () => {
        if (storedFormData) {
            const response = await updateMatchResults(storedFormData);
            if (response !== undefined) {
                alert("Match details updated successfully");
                setShowUpdateResultsCard(false);
            }
            setShowConfirmationPopUp(false);
        }
    };

    const handleAddSetsClick = () => {
        if (sets.length < 5) {
            setSets(prevSets => [...prevSets, prevSets.length + 1]);
        } else {
            alert("You can't add more than 5 sets.");
            return;
        }
    };

    const handleDeleteSetClick = (setNumber) => {
        if (setNumber === 1) {
            alert("The first set cannot be deleted.");
            return;
        }
        setSets(prevSets => prevSets.filter(set => set !== setNumber));
    };

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "update-match-results-card-template flex flex-col gap-4 p-8 rounded-[12px] w-2/5 bg-primary-color-white max-h-[80vh] overflow-y-auto">
                <form onSubmit = {handleSubmit(onUpdateMatchDetailsSubmit)}>
                    <div className = "flex justify-between items-center mb-8">
                        <h1 className = "text-2xl font-semibold"> Match Results </h1>
                        <button
                            type = "button"
                            onClick = {() => setShowUpdateResultsCard(false)}
                            className = "text-2xl text-gray-600 hover:text-gray-800"
                        >
                            <FontAwesomeIcon icon = {faTimesCircle} />
                        </button>
                    </div>
                    <div className = "flex flex-col gap-6">
                        <div className = "flex justify-center mt-2">
                            <p className = "text-center font-semibold text-lg">
                                <strong> {player1} </strong> VS <strong> {player2} </strong>
                            </p>
                        </div>
                        {sets.map((setNumber) => (
                            <div key = {setNumber} className = "flex flex-col items-center gap-4">
                                <div className = "flex items-center gap-4 mb-5">
                                    <p className = "font-semibold"> Set {setNumber} </p>
                                    <input
                                        type = "number"
                                        placeholder = {`${player1}'s Score`}
                                        className = "p-2 border-0 border-b focus:border-blue-500 border-gray-300 focus:outline-none w-full"
                                        style = {{
                                            borderBottomColor: "#555555",
                                            borderBottomWidth: "1.5px",
                                        }}
                                        {...register(`set${setNumber}Player1`, { required: true })}
                                    />
                                    <input
                                        type = "number"
                                        placeholder = {`${player2}'s Score`}
                                        className = "p-2 border-0 border-b focus:border-blue-500 border-gray-300 focus:outline-none w-full"
                                        style = {{
                                            borderBottomColor: "#555555",
                                            borderBottomWidth: "1.5px",
                                        }}
                                        {...register(`set${setNumber}Player2`, { required: true })}
                                    />
                                    <button
                                        type = "button"
                                        className = "ml-2 text-red-500 hover:text-red-700"
                                        onClick = {() => handleDeleteSetClick(setNumber)}
                                    >
                                        <FontAwesomeIcon icon = {faTrashAlt} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className = "flex justify-center">
                            <button
                                type = "button"
                                className = "px-4 py-2 rounded-lg"
                                onClick = {handleAddSetsClick}
                            >
                                <span style = {{ color: "#222222" }} className = "text-sm">
                                    <FontAwesomeIcon icon = {faPlusCircle} />
                                </span>
                                <span className = "ml-2"> New Set </span>
                            </button>
                        </div>
                        <div className = "flex justify-end mt-4">
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
                {showConfirmationPopUp && (
                    <ConfirmationPopUp
                        onCancel = {() => setShowConfirmationPopUp(false)}
                        onConfirm = {handleFinalConfirmation}
                        message = {"Do you want to submit match details?"}
                    />
                )}
            </div>
        </div>
    );
};

export default UpdateResultsCard;
