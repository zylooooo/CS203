import axios from "axios";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";


// Component: Strike Report Card (for AdministratorPastTournamentDetails, under My Past Tournaments)
const StrikeReportCard = ({ tournamentName, strikePlayer, setStrikeOpen }) => {

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
                "http://localhost:8080/admins/strikes",
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
            alert(error.response.data.error);
            console.error('Error submiting strike:', error.response.data.error);
    
        }
    }

    const onSubmit = async (data) => {
        const response = await strikeUser(data.reason);

        if (response !== undefined) {
            alert("Strike successfully issued!");
            setStrikeOpen(false);
        }
    }

    return (
        <div className="main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
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

// Component: Tournament Details Card (for AdministratorTournamentHistory)
const AdministratorPastTournamentDetails = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const [isThisAdministrator, setIsThisAdministrator] = useState(false);

    const fromPage = location.state?.from || "/administrator-tournament-history";      // to retrieve page where admins clicked for tournament details

    const tournamentName = location.state.tournamentName;

    const [tournamentDetails, setTournamentDetails] = useState(null);

    const handleBackButtonClick = () => {
        navigate(fromPage);
    }

    // -------------------------- STRIKE REPORT FUNCTIONS ------------------------------

    const [strikeOpen, setStrikeOpen] = useState(false);

    const [strikePlayer, setStrikePlayer] = useState("");

    const handleIssueStrikeClick = (player) => {
        setStrikePlayer(player);
        setStrikeOpen(true);
    }

    // function to check if tournament end date is within one week from system date
    const isWithinOneWeek = (endDate) => {
        const currentDate = new Date();
        const tournamentEndDate = new Date(endDate);
        const timeDifference = currentDate - tournamentEndDate; 
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        return daysDifference >= 0 && daysDifference <= 7;
    };

    // --------------------------------------------------------------------------------

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    };

    // API Call: Retrieve tournament details by tournament name
    async function getTournamentByName() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/admins/tournaments/${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    }
                }
            );

            if (response.status === 200) {
                setTournamentDetails(response.data);
                if (adminData.adminName === response.data.createdBy) {
                    setIsThisAdministrator(true);
                }
            }

        } catch (error) {
            alert(error.response.data.error);
            console.error('Error fetching tournament:', error.response.data.error);
            setTournamentDetails({});

        } 
    }

    useEffect(() => {
        getTournamentByName(tournamentName); 
    }, []);

    if (!tournamentDetails) {
        return (
            <p className = "font-semibold text-lg mt-10"> Loading tournament details... </p>
        );
    }

    return (
        <div className = "tournament-card-template main-container flex relative">
            <div className = "flex flex-col w-3/5 gap-4 border p-8 rounded-[8px card-background shadow-md">
                <div className = "flex justify-between items-center mb-4">
                    <div className = "flex items-center gap-4">
                        <FontAwesomeIcon
                            icon = {faArrowLeft}
                            onClick = {handleBackButtonClick}
                            className = "back-icon cursor-pointer text-xl"
                        />
                        <h1 className = "text-2xl font-bold mb-2 mt-1"> {tournamentDetails.tournamentName} </h1>
                    </div>
                </div>
                <p className = "mb-2 text-lg"> <strong> Date: </strong> {formatDate(tournamentDetails.startDate)} to {formatDate(tournamentDetails.endDate)}</p>
                <p className = "mb-2 text-lg"> <strong> Organiser: </strong> {tournamentDetails.createdBy} </p>
                <p className = "mb-2 text-lg"> <strong> Elo Rating Criteria: </strong> {tournamentDetails.minElo} to {tournamentDetails.maxElo} </p>
                <p className = "mb-2 text-lg"> <strong> Game Category: </strong> {tournamentDetails.category} </p>
                <p className = "mb-2 text-lg"> <strong> Gender: </strong> {tournamentDetails.gender} </p>
                <p className = "mb-2 text-lg"> <strong> Player Capacity: </strong> {tournamentDetails.playerCapacity} </p>
                {tournamentDetails.remarks && (
                    <p className = "mb-2 text-lg"> <strong> Remarks: </strong> {tournamentDetails.remarks} </p>
                )}

                <p className = "mb-2 text-lg"> <strong> Venue: </strong> {tournamentDetails.location} </p>

                <div className = "flex justify-between items-start mt-4">
                    <div className = "players-list mt-4 p-4 border rounded-[8px] w-2/3 relative">
                        <h2 className = "text-xl font-semibold mb-2"> Current Players: </h2>
                        <div style = {{ height: "1px", backgroundColor: "#DDDDDD", margin: "10px 0" }} />
                        <p className = "text-md text-gray-500 absolute top-4 right-10 font-semibold">
                            Total Players: {tournamentDetails.playersPool.length}
                        </p>
                        { isThisAdministrator && !isWithinOneWeek(tournamentDetails.endDate) &&  (
                            <div className = "flex justify-center items-center">
                                <p className = "text-md text-secondary-color-red font-semibold">
                                    Unable to issue strikes to players at this time as your tournament has ended more than a week ago.
                                </p>
                        </div>
                        )}
                        {tournamentDetails.playersPool && tournamentDetails.playersPool.length > 0 ? (
                            <ol className = "list-decimal pl-5">
                                {tournamentDetails.playersPool.map((player, index) => (
                                    <li key = {index} className = "mt-5 mb-5 flex justify-between items-center"> 
                                        <span>{index + 1}. {player} </span>

                                        {/* ISSUE STRIKE BUTTON */}
                                        { isThisAdministrator && isWithinOneWeek(tournamentDetails.endDate) && (
                                          <button 
                                          className = "px-4 py-2 mr-6 rounded-[8px] shadow-md bg-secondary-color-red hover:shadow-inner font-semibold self-end text-primary-color-white"
                                          onClick = {() => handleIssueStrikeClick(player) }
                                          >
                                              Issue Strike
                                          </button>
                                        )}

                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p> No players have joined this tournament yet. </p>
                        )}
                    </div>

                    <button
                        // WIP: To be updated when API call for fixtures (brackets) are finalised.
                        // onClick = {handleShowFixturesClick}
                        className = "border text-white bg-primary-color-light-green hover:bg-primary-color-green px-4 py-2 rounded-[8px] font-semibold ml-2 self-start mt-4 mr-6"
                    >
                        Show Results
                    </button>

                </div>
            </div>

            {/* STRIKE REPORT CARD */}
            {strikeOpen && 
                <StrikeReportCard tournamentName = { tournamentName } strikePlayer = { strikePlayer } setStrikeOpen = { setStrikeOpen }/> 
            }

        </div>
    );
};

export default AdministratorPastTournamentDetails;