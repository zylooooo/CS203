// Config imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

// Icons Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";
import AlertMessageSuccess from "../components/AlertMessageSuccess";

const AdministratorTournamentDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tournamentName } = useParams();
    const fromPage = location.state?.from || "/administrator-tournaments";

    const [thisAdministrator, setThisAdministrator] = useState("");
    const [tournaments, setTournaments] = useState({});
    const [playersPool, setPlayersPool] = useState([]);
    const [playersPoolLength, setPlayersPoolLength] = useState(0);

    // For Alerts
    const [warningMessage, setWarningMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    const handleBackButtonClick = () => {
        navigate(fromPage);
    };

    const checkThisAdmin = (adminName) => {
        return adminName === thisAdministrator;
    };

    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        const date = new Date(dateString);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
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
            setTournaments(response.data);
            setPlayersPool(response.data.playersPool);
            // setPlayersPoolLength(response.data.playersPool.length);
            console.log("re", response.data)
        }
        } catch (error) {
            setWarningMessage("Unable to fetch tournaments. Please reload and try again.");
            console.error("Error fetching tournament:", error.response.data.error);
            setTournaments({});
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
        navigate(`/administrator/tournament-fixtures/${tournamentName}`, {
            state: { tournamentName }
        });
    };

    // -------------------------- useEffect() ---------------------------
    useEffect(() => {
        getTournamentByName(tournamentName);
        setPlayersPoolLength(playersPool.length);
    }, [tournamentName]);

    return (
        <div className = "tournament-details-card main-container flex">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div className = "flex flex-col w-3/5 gap-4 border p-10 rounded-[8px] card-background shadow-md">
                <div className = "flex justify-between items-center mb-4">
                    <div className = "flex items-center gap-4">
                        <FontAwesomeIcon
                            icon = {faArrowLeft}
                            onClick = {handleBackButtonClick}
                            className = "back-icon cursor-pointer text-xl"
                        />
                        <h1 className = "text-2xl font-bold mb-2 mt-1">
                            {" "}
                            {tournaments.tournamentName}
                            {" "}
                        </h1>
                    </div>
                </div>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Date: </strong> {formatDate(tournaments.startDate)}{" "}
                </p>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Organiser: </strong> {tournaments.createdBy}{" "}
                </p>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Elo Rating Criteria: </strong> {tournaments.minElo} to {tournaments.maxElo}{" "}
                </p>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Game Category: </strong> {tournaments.category}{" "}
                </p>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Gender: </strong> {tournaments.gender}{" "}
                </p>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Player Capacity: </strong> {tournaments.playerCapacity}{" "}
                </p>
                {tournaments.remarks && (
                    <p className = "mb-2 text-lg">
                        {" "}<strong> Remarks: </strong> {tournaments.remarks}{" "}
                    </p>
                )}
                <p className = "mb-2 text-lg">
                    {tournaments.playerCapacity - playersPoolLength > 0 ? (
                        <span><strong> Slots Available: </strong>{" "}{tournaments.playerCapacity - playersPoolLength}{" "}</span>
                    ) : (
                        <span><strong> Slots are full!</strong></span>
                    )}
                </p>
                <p className = "mb-2 text-lg">
                    {" "}<strong> Venue: </strong> {tournaments.location}{" "}
                </p>
                <div className = "flex justify-between items-start mt-4">
                    <div className = "players-list mt-4 p-4 border rounded-[8px] w-2/3 relative">
                        <h2 className = "text-xl font-semibold mb-2"> Current Players: </h2>
                        <div style = {{height: "1px", backgroundColor: "#DDDDDD", margin: "10px 0"}} />
                        <p
                            className = "text-md text-gray-500 absolute top-4 right-4 font-semibold"
                            style = {{
                                color: tournaments.playerCapacity - playersPoolLength <= 10
                                ? "red"
                                : "black",
                                fontWeight: tournaments.playerCapacity - playersPoolLength <= 10
                                ? 700
                                : "normal",
                            }}
                        >
                            {tournaments.playerCapacity - playersPoolLength > 0
                                ? `Slots left: ${tournaments.playerCapacity - playersPoolLength}`
                                : "Slots are full!"}
                        </p>
                        {playersPool && playersPoolLength > 0 ? (
                        <ol className = "list-decimal pl-5">
                            {playersPool.map((player, index) => (
                                <li key = {index} className = "mt-5 mb-5">
                                    {" "}{player}{" "}
                                </li>
                            ))}
                        </ol>
                        ) : (
                            <p> No players have joined this tournament yet. </p>
                        )}
                    </div>
                    <div className = "flex flex-col gap-4 ml-2 self-start mt-4 mr-6">
                        {checkThisAdmin(tournaments.createdBy) && (
                            <button
                                onClick = {handleGenerateBracketsClick}
                                className = "bg-primary-color-light-green hover:bg-primary-color-green text-white border px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                            >
                                Generate Brackets
                            </button>
                        )}
                        <button
                            onClick = {handleShowFixturesClick}
                            className = "bg-primary-color-light-green hover:bg-primary-color-green text-white border px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                        >
                            Show Fixtures
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdministratorTournamentDetails;