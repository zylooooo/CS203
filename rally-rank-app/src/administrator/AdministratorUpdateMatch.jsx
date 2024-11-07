import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

const ResultsCard = ({ matchDetails, player1, player2}) => {
    // change this const to be passed into ResultsCard
    const [resultsCardOpen, setResultsCardOpen] = useState(true);

    const [resultsConfirmationCardOpen, setResultsConfirmationCardOpen] = useState(false);

    const { register, handleSubmit, formState: { errors }} = useForm();

    const [sets, setSets] = useState([1]);

    const [matchWinner, setMatchWinner] = useState("");

    // helper function: determine match winner based on number of sets won
    function determineWinner(setScores, player1, player2) {
        let player1Sets = 0;
        let player2Sets = 0;
        
        setScores.forEach(set => {
            if (set.result[0] > set.result[1]) player1Sets++;
            if (set.result[1] > set.result[0]) player2Sets++;
        });
        
        return player1Sets > player2Sets ? player1 : player2;
    }

    // API Call: Update one specific match's results 
    async function updateMatchResults(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

        // Convert form data into the expected sets format
        const setScores = sets.map((setNumber) => ({
            result: [
                parseInt(formData[`set${setNumber}Player1`]),
                parseInt(formData[`set${setNumber}Player2`])
            ],
            setWinner: formData[`set${setNumber}Player1`] > formData[`set${setNumber}Player2`] 
            ? player1 
            : player2
        }));

        // Determine match winner based on set scores
        const winner = determineWinner(setScores, player1, player2);
        setMatchWinner(winner);

        // const updatedMatchDetails = {
        //     tournamentName: matchDetails.tournamentName,
        //     startDate: matchDetails.startDate,
        //     players: matchDetails.players,
        //     sets: {
        //         result: setScores.map(set => set.result),
        //         setWinner: setScores.map(set => set.setWinner)
        //     },
        //     matchWinner: winner,
        //     isCompleted: true
        // };

        const updatedMatchDetails = {
            tournamentName: "",
            startDate: "",
            players: [],
            sets: {
                object: setScores,
            },
            matchWinner: winner,
            completed: true
        };

        console.log(updatedMatchDetails);


            const response = await axios.put(
                "http://localhost:8080/admins/tournaments/match",
                updatedMatchDetails,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            console.log(response.data);
            return response.data;

        } catch (error) {

            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert(error.response.data.error);
            console.error('Error updating match results:', error.response.data.error);
    
        }
    }

    const onSubmit = async (formData) => {
        const response = await updateMatchResults(formData);

        if (response !== undefined) {
            alert("Match results successfully updated!");
            setResultsConfirmationCardOpen(true);
            setResultsCardOpen(false);
        }
    }

    const handleAddSetClick = () => {
        setSets(prevSets => [...prevSets, prevSets.length + 1]);
    }

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "update-match-results-card-template flex flex-col gap-4 p-12 rounded-[8px] max-w-[550px] bg-primary-color-white">
                <form onSubmit = {handleSubmit(onSubmit)}>
                    <div className = "flex flex-col gap-6"> 
                        <div>
                            <h1 className = "text-2xl font-semibold">Match Results</h1>
                            <p><strong>{player1} vs {player2}</strong></p>
                        </div>

                        {/* Add the sets rendering here */}
                        {sets.map((setNumber) => (
                            <div key = {setNumber} className = "flex gap-4 items-center">
                                <p>Set {setNumber}</p>
                                <input
                                    type = "number"
                                    {...register(`set${setNumber}Player1`)}
                                    placeholder = "Player 1 Score"
                                    className = "border p-2 rounded"
                                />
                                <input
                                    type = "number"
                                    {...register(`set${setNumber}Player2`)}
                                    placeholder = "Player 2 Score"
                                    className = "border p-2 rounded"
                                />
                            </div>
                        ))}

                        <div>
                            <button
                                type = "button"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                onClick = {handleAddSetClick}
                            >
                                Add New Set
                            </button>
                        </div>

                        <div className = "flex justify-between">
                            {/* CANCEL */}
                            <button
                                type = "button"
                                onClick = {() => setResultsCardOpen(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>

                            {/* SUBMIT */}
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Submit
                            </button>
                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
};

const ResultsConfirmationCard = (setResultsConfirmationCardOpen) => {
    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "update-match-results-card-template flex flex-col gap-4 p-12 rounded-[8px] max-w-[550px] bg-primary-color-white">
                <h1>Match results successfully updated!</h1>
            </div>
        </div>
    );
}

const MatchTimingsCard = ({ matchDetails }) => {
    // change this const to be passed into MatchTimingsCard
    // const [matchTimingsCardOpen, setMatchTimingsCardOpen] = useState(true);

    const { register, handleSubmit, formState: { errors }} = useForm();

    const [sets, setSets] = useState([1]);
    console.log("timings card: " , matchDetails);

    // API Call: Update one specific match's timings
    async function updateMatchTimings(formData) {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

        const updatedMatchDetails = {
            tournamentName: matchDetails.tournamentName,
            startDate: formData.startDate,
            players: matchDetails.players,
            sets: matchDetails.sets,
            matchWinner: matchDetails.matchWinner,
            completed: matchDetails.completed
        };

            const response = await axios.put(
                "http://localhost:8080/admins/tournaments/match",
                updatedMatchDetails,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            console.log(response.data);
            return response.data;

        } catch (error) {

            // WIP: EDIT DISPLAY ERROR MESSAGE
            alert(error.response.data.error);
            console.error('Error updating match timings:', error.response.data.error);
    
        }
    }

    const onSubmit = async (formData) => {
        const response = await updateMatchTimings(formData);

        if (response !== undefined) {
            alert("Match timings successfully updated!");
            setMatchTimingsCardOpen(false);
        }
    }

    return  (
        matchTimingsCardOpen && (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "update-match-results-card-template flex flex-col gap-4 p-12 rounded-[8px] max-w-[550px] bg-primary-color-white">
                <form onSubmit = {handleSubmit(onSubmit)}>
                    <div className = "flex flex-col gap-6"> 
                        <div>
                            <h1 className = "text-2xl font-semibold">Match Timings</h1>
                            <p><strong>{matchDetails.players[0]} vs {matchDetails.players[1]}</strong></p>
                        </div>

                        <div>
                        <input
                            className="border p-2"
                            type="datetime-local"
                            id="startDate"
                            {...register("startDate", {
                                required: "Match date and time is required",
                            })}
                            />
                            <p className="error">{errors.startDate?.message}</p>
                        </div>

                        <div className = "flex justify-between">
                            {/* CANCEL */}
                            <button
                                type = "button"
                                onClick = {() => setMatchTimingsCardOpen(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>

                            {/* SUBMIT */}
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Confirm
                            </button>
                        </div>

                    </div>

                </form>
            </div>
        </div>
    ));
};

export { ResultsCard, ResultsConfirmationCard, MatchTimingsCard };