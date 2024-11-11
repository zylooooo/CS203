// Config imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

// Icons Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faStar, faMapMarkerAlt, faUserTie, faGamepad, faMars, faVenus, faArrowLeft} from "@fortawesome/free-solid-svg-icons";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import StrikeReportCard from '../components/AdministratorStrikeReportCard';

const AdministratorTournamentDetails = () => {

    useEffect(() => {   
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    const navigate = useNavigate();
    const { status, tab, tournamentName } = useParams();
    const isPastTournament = (status === "history"); 
    console.log("isPastTournament: ", isPastTournament, "status: ", status);

    const fromPage = location.state?.from || "/administrator-tournaments";

    const [thisAdministrator, setThisAdministrator] = useState("");
    const [tournament, setTournament] = useState({});

    // For Alerts
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    const handleBackButtonClick = () => {
        if (status === "history") {
            navigate(`/administrator-tournaments/history` );
        } else {
            navigate(`/administrator-tournaments`);
        }
    };

    const checkThisAdmin = (adminName) => {
        return adminName === thisAdministrator;
    };

    const getGenderIcon = (gender) => {
        switch (gender?.toLowerCase()) {
            case 'male':
                return faMars;
            default:
                return faVenus;
        }
    };

    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        const date = new Date(dateString);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
    };

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

    // -------------------------- API Call: Retrieve tournament details by the tournament name ---------------------------
    async function getTournamentByName() {
        try {
        const adminData = JSON.parse(localStorage.getItem("adminData"));
        if (!adminData || !adminData.jwtToken) {
            console.error("No JWT token found");
            return;
        }

        const response = await axios.get(
            `${API_URL}/admins/tournaments/${tournamentName}`,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${adminData.jwtToken}`,
                },
            },
        );

        setThisAdministrator(adminData.adminName);

        if (response.status === 200) {
            setTournament(response.data);
        }

        } catch (error) {
            setWarningMessage("Unable to fetch tournaments. Please reload and try again.");
            console.error("Error fetching tournament:", error.response.data.error);
            setTournament({});
            console.error("Error fetching tournament:", error?.response?.data?.error);
        }
    };

    // -------------------------- API Call: Generate brackets ---------------------------
    async function generateBrackets() {
        try {
        const adminData = JSON.parse(localStorage.getItem("adminData"));
        if (!adminData || !adminData.jwtToken) {
            console.error("No JWT token found");
            return;
        }

        const response = await axios.put(
            `${API_URL}/admins/tournaments/bracket/${tournamentName}`,
            {},
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${adminData.jwtToken}`,
                },
            },
        );

        if (response.data.error) {
            setWarningMessage(response.data.error);
        } else {
            setSuccessMessage("Brackets generated successfully! View the fixtures below!");
        }
        return response.data;

        } catch (error) {
            setWarningMessage("Unable to generate brackets. Please reload and try again.");
            console.error("Error generating brackets:", error.response.data.error);
        }
    };

    const handleGenerateBracketsClick = async () => {
        await generateBrackets();
    };

    const handleShowFixturesClick = () => {
        navigate(`/administrator/tournament-fixtures/${status}/${tournamentName}`, {
            state: { tournamentName }
        });
    };

    // -------------------------- useEffect() ---------------------------
    useEffect(() => {
        getTournamentByName(tournamentName);
    }, [tournamentName]);

    return (
        <div className = "tournament-card-template main-container flex">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div className = "flex flex-col w-2/3 gap-4 shadow-xl p-8 rounded-[12px] card-background border">
                <div className = "flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4 flex-grow">
                        <FontAwesomeIcon
                            icon = {faArrowLeft}
                            onClick = {handleBackButtonClick}
                            className = "back-icon cursor-pointer text-xl mt-3"
                        />
                        <h1 className = "text-2xl font-bold mt-2"> {tournament.tournamentName} </h1>
                    </div>
                    {/* SLOTS LEFT */}
                    {!isPastTournament && (
                        <div 
                            className = "text-lg font-bold text-right mr-5" 
                            style = {{ color: tournament.playerCapacity - tournament.playersPool?.length < 10 ? 'red' : 'inherit' }}
                        >
                            {tournament.playerCapacity - tournament.playersPool?.length > 0 ? (
                                <>
                                    Slots Left: {tournament.playerCapacity - tournament.playersPool?.length}
                                    
                                </>
                            ) : (
                                <span>
                                    Slots are full!
                                </span>
                            )}
                     </div>
                    )}
                </div>

                {/* LINE DIVIDER */}
                <div style = {{ height: "1px", backgroundColor: "#DDDDDD" }} />

                <div className = "flex flex-row gap-20 mt-4 mb-1">
                    {/* LEFT SECTION */}
                    <div className = "ml-10 w-1/2">
                        {/* TOURNAMENT DATE */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faCalendarAlt}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {!isPastTournament
                                ? formatDate(tournament.startDate)
                                : `${formatDate(tournament.startDate)} to ${formatDate(tournament.endDate)}`
                            }
                        </p>
                        {/* TOURNAMENT ELO RATING RANGE */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faStar}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournament.minElo} to {tournament.maxElo}
                        </p>
                        {/* TOURNAMENT LOCATION */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faMapMarkerAlt}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournament.location}
                        </p>
                    </div>
                    {/* RIGHT SECTION */}
                    <div>
                        {/* TOURNAMENT GAME CATEGORY */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faGamepad}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournament.category}
                        </p>
                        {/* TOURNAMENT GENDER */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {getGenderIcon(tournament.gender)}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournament.gender}
                        </p>
                        {/* TOURNAMENT ORGANISER */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faUserTie}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournament.createdBy}
                        </p>
                    </div>
                </div>

                {/* LINE DIVIDER */}
                <div style = {{ height: "1px", backgroundColor: "#DDDDDD" }} />

                {/* TOURNAMENT REMARKS */}
                <div className = "ml-10 w-1/2">
                    {tournament.remarks && (
                        <p className = "mb-5 text-lg"> <strong> Remarks: </strong> {tournament.remarks} </p>
                    )}
                    <p className = "mt-2 text-lg"> Max Players: <span className = "text-xl" style = {{ color: "red" }}> <strong>{tournament.playerCapacity}</strong> </span> </p>
                </div>

                {/* LIST OF PLAYERS ENROLLED IN TOURNAMENT */}
                <div className = "flex justify-between items-start">
                    <div className = "players-list mt-2 p-4 shadow-lg rounded-[8px] w-2/3 relative ml-8">
                        <h2 className = "text-xl font-semibold mb-2"> 
                            {isPastTournament ? "Players" : "Current Players"} 
                        </h2>
                        <div style = {{ height: "1px", backgroundColor: "#DDDDDD", margin: "10px 0" }} />
                        { isPastTournament && checkThisAdmin(tournament.createdBy) && !isWithinOneWeek(tournament.endDate) &&  (
                            <div className = "flex justify-center items-center">
                                <p className = "text-md text-secondary-color-red font-semibold">
                                    Unable to issue strikes to players at this time as your tournament has ended more than a week ago.
                                </p>
                        </div>
                        )}
                        {tournament.playersPool && tournament.playersPool.length > 0 ? (
                            <ol className = "list-decimal pl-5">
                                {tournament.playersPool.map((player, index) => (
                                    <li key = {index} className = "mt-5 mb-5 flex justify-between items-center w-full">
                                        {player} 
                                        {/* ISSUE STRIKE BUTTON */}
                                        { isPastTournament && checkThisAdmin(tournament.createdBy) && isWithinOneWeek(tournament.endDate) && (
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

                    {/* GENERATE BRACKETS BUTTON / SHOW RESULTS/FIXTURES BUTTON */}
                    <div className = "flex flex-col gap-4 ml-2 self-start mt-4 mr-6">
                        {checkThisAdmin(tournament.createdBy) && !isPastTournament && (
                            <button
                                onClick = {handleGenerateBracketsClick}
                                className = "bg-primary-color-light-green hover:bg-primary-color-green text-white border px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                            >
                                Generate Brackets
                            </button>
                        )}
                        <button
                            onClick = {handleShowFixturesClick}
                            className = "bg-primary-color-light-green hover:bg-primary-color-green text-white px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                        >
                            {isPastTournament ? "Show Results" : "Show Fixtures"}
                        </button>
                    </div>
                </div>
            </div>

            {/* STRIKE REPORT CARD */}
            {strikeOpen && (
                <StrikeReportCard tournamentName = {tournament.tournamentName} strikePlayer = {strikePlayer} setStrikeOpen = {setStrikeOpen} />
            )}

        </div>
    );


}

export default AdministratorTournamentDetails;