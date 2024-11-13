import axios from "axios";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { API_URL } from "../../config";


// Assets and Components Imports
import AlertMessageWarning from '../components/AlertMessageWarning';
import AlertMessageSuccess from '../components/AlertMessageSuccess';


// Component: Strike Report Card (for AdministratorPastTournamentDetails, under My Past Tournaments)
const StrikeReportCard = ({ tournamentName, strikePlayer, setStrikeOpen }) => {

    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");

    useEffect(() => {   
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    const { register, handleSubmit, formState: { errors }} = useForm();

    // API Call: Create and issue strike to user
    async function strikeUser(reportDetails) {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.post(
                `${API_URL}/admins/strikes`,
                {
                    username: strikePlayer,
                    tournamentName: tournamentName,
                    reportDetails: reportDetails
                },
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
            setWarningMessage(error.response.data.error);
            console.error('Error submiting strike:', error.response.data.error);
    
        }
    }

    const onSubmit = async (data) => {
        const response = await strikeUser(data.reason);

        if (response !== undefined) {
            setSuccessMessage("Strike successfully issued!");
            setStrikeOpen(false);
        }
    }

    return (
        <div className="main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div className = "strike-report-card-template flex flex-col gap-4 p-12 rounded-[8px] max-w-[550px] bg-primary-color-white">
                <form onSubmit = { handleSubmit(onSubmit) }>
                    <div className = "flex flex-col gap-6"> 

                        <div className = "flex flex-col gap-2">
                            <h1 className = "text-2xl font-semibold">Strike Report</h1>
                            <p className = "text-sm font-medium">
                                Strikes are issued to players who have displayed unsportsmanlike conduct during tournaments.
                            </p>
                            <p className = "text-sm font-medium text-secondary-color-red">
                                Issuing a strike to this player will temporarily ban them from joining your future tournaments.
                            </p>
                        </div>

                        <div className = "flex flex-col gap-2 justify-evenly">
                            <label
                                htmlFor = "reason"
                                className = "block text-sm"
                            >
                                Please state your reason for issuing this strike to <strong> {strikePlayer}</strong>.
                            </label>
                            <input
                                className = "border-b p-2"
                                type = "text"
                                id = "reason"
                                placeholder = "Reason"
                                {...register("reason", {
                                    required: "This field is required.",
                                })}
                            />
                            <p className = "error"> {errors.reason?.message} </p>
                        </div>

                        <div className = "flex justify-between">
                            {/* CANCEL */}
                            <button
                                type = "button"
                                onClick = {() => setStrikeOpen(false)}
                                className = "shadow-md px-4 py-2 rounded-lg mr-2 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>

                            {/* SUBMIT */}
                            <button
                                type = "submit"
                                className = "shadow-md px-4 py-2 rounded-lg hover:bg-secondary-color-red hover:text-white transition"
                            >
                                Submit
                            </button>
                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default StrikeReportCard;