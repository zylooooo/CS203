// Configuration Imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Icons Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faStar, faMapMarkerAlt, faUserTie, faGamepad, faMars, faVenus, faArrowLeft} from "@fortawesome/free-solid-svg-icons";

// Assets and Components Imports
import AlertMessageSuccess from "../components/AlertMessageSuccess";
import AlertMessageWarning from "../components/AlertMessageWarning";

const TournamentDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tournamentName } = useParams();
    const [tournamentDetails, setTournamentDetails] = useState(null);

    // Const: For retrieving the updated tournament details upon change
    const [refreshData, setRefreshData] = useState(false);

    // Consts: For conditional rendering
    const [isFull, setIsFull] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [joinedForScheduled, setJoinedForScheduled] = useState(true);

    // Consts: Check the type of tournament, to be set into URL
    const isPastTournament = useParams().status === "history";
    const isAvailableTournament = useParams().status === "avail";
    const isScheduledTournament = useParams().status === "sched";

    // For Alerts
    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    
    useEffect(() => {
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    const isTwoWeeks = (startDate) => {
        const currentDate = new Date();
        const tournamentStartDate = new Date(startDate);
        const timeDifference = tournamentStartDate - currentDate;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference === 14;
    };

    // Function: Display the gender icon for tournament details.
    const getGenderIcon = (gender) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return faMars;
            default:
                return faVenus;
        }
    };

    useEffect(() => {
        if (tournamentDetails) {
            const playerPoolLength = tournamentDetails.playersPool.length;
            setIsFull(playerPoolLength >= tournamentDetails.playerCapacity);
        }
    }, [tournamentDetails]);

    // ----------------------- API Call: Posting user's username when joining a tournament  -----------------------
    const handleJoinTournamentButtonClick = async () => {
        if (!isFull) {
            try {
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (!userData || !userData.jwtToken) {
                    console.error("No JWT Token found!");
                    // Alert Message
                    return;
                }

                const response = await axios.post(
                    `${API_URL}/users/tournaments/${tournamentName}/join`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${userData.jwtToken}`,
                        },
                    }
                );

                if (response.status == 200) {
                    setHasJoined(true);
                    setJoinedForScheduled(true);
                    setSuccessMessage("Tournament joined!");
                    setRefreshData((prev) => !prev);

                }
            } catch (error) {
                setWarningMessage("Unable to join tournament. Please try again.");
                console.error("Error joining tournament:", error.response ? error.response.data : error.message);
            }
        } else {
            console.log("Tournament is full. Button shouldn't even appear.");
            setWarningMessage("Tournament is full!");
        }
    };

    // ----------------------- API Call: Removing user's username when leaving a tournament  -----------------------
    const handleLeaveTournamentClick = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const response = await axios.delete(
                `${API_URL}/users/tournaments/leave-${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`,
                    },
                },
            );

            if (response.status == 200) {
                setHasJoined(false);
                setJoinedForScheduled(false);
                console.log(response.data);
                setSuccessMessage("You have left the tournament.");
                setRefreshData((prev) => !prev);
            }

        } catch (error) {
            console.error("Error leaving tournament:", error.response ? error.response.data : error.message);
            console.log("GOES HERE");
        }
    };

    const handleBackButtonClick = () => {
        if (isAvailableTournament) {
            navigate("/users/tournaments/0");
        } else if (isScheduledTournament) {
            navigate("/users/tournaments/1");
        } else if (isPastTournament) {
            navigate("/past-tournaments");
        }
    };

    const handleShowFixturesButtonClick = () => {
        navigate(`/user-fixtures/${tournamentName}`, {
            state: { tournamentName }
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });
        return `${day} ${month} ${year}`;
    };

    // ------------------------------------- API call: Retrieve tournament details by taking the tournament name (as a state) -------------------------------------
    async function getTournamentDetailsByName() {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT token found!");
                return;
            }
            
            const response = await axios.get(
                `${API_URL}/users/tournaments/${tournamentName}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            
            if (response.status === 200) {
                setTournamentDetails(response.data);
            }
            
        } catch (error) {
            setWarningMessage("Unable to retrieve tournament details. Please reload the page and try again.");
            console.error("Error fetching tournament details: ", error);
        }
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getTournamentDetailsByName();
    }, [refreshData]);

    if (!tournamentDetails) {
        return (
            <p className = "font-semibold text-lg mt-10"> Loading tournament details... </p>
        );
    }

    return (
        <div className = "tournament-card-template main-container flex">
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <AlertMessageSuccess message = {successMessage} onClose = {() => setSuccessMessage("")} />
            <div className = "flex flex-col w-2/3 gap-4 shadow-xl p-8 rounded-[12px] card-background border">
                <div className = "flex justify-between items-center mb-4">
                    {/* BACK BUTTON */}
                    <div className="flex items-center gap-4 flex-grow">
                        <FontAwesomeIcon
                            icon = {faArrowLeft}
                            onClick = {handleBackButtonClick}
                            className = "back-icon cursor-pointer text-xl mt-3"
                        />
                        <h1 className = "text-2xl font-bold mt-2"> {tournamentDetails.tournamentName} </h1>
                    </div>
                    {/* SLOTS LEFT */}
                    {!isPastTournament && (
                        <div 
                            className = "text-lg font-bold text-right mr-5" 
                            style = {{ color: tournamentDetails.playerCapacity - tournamentDetails.playersPool.length < 10 ? 'red' : 'inherit' }}
                        >
                            {tournamentDetails.playerCapacity - tournamentDetails.playersPool.length > 0 ? (
                                <>
                                    Slots Left: {tournamentDetails.playerCapacity - tournamentDetails.playersPool.length}
                                    
                                </>
                            ) : (
                                <span>
                                    Slots are full!
                                </span>
                            )}
                     </div>
                    )}
                    {/* JOIN/LEAVE BUTTON */}
                    {!isFull && isAvailableTournament && !isScheduledTournament && (
                        <button
                            onClick = {hasJoined ? handleLeaveTournamentClick : handleJoinTournamentButtonClick}
                            className = "border text-white px-4 py-2 rounded font-semibold"
                            style = {{
                                backgroundColor: hasJoined ? "#FF6961" : "#56AE57",
                                border: "none",
                                color: "white",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease",
                            }}
                        >
                            {hasJoined ? "Leave Tournament" : "Join Tournament"}
                        </button>
                    )}
                    {/* LEAVE BUTTON FOR SCHEDULED TOURNAMENT */}
                    {isScheduledTournament && !isTwoWeeks(tournamentDetails.startDate) && (
                        <button
                        onClick = {joinedForScheduled ? handleLeaveTournamentClick : handleJoinTournamentButtonClick}
                        className = "border text-white px-4 py-2 rounded font-semibold"
                        style = {{
                            backgroundColor: joinedForScheduled ? "#FF6961" : "#56AE57",
                            border: "none",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        {joinedForScheduled ? "Leave Tournament" : "Join Tournament"}
                    </button>
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
                                ? formatDate(tournamentDetails.startDate)
                                : `${formatDate(tournamentDetails.startDate)} to ${formatDate(tournamentDetails.endDate)}`
                            }
                        </p>
                        {/* TOURNAMENT ELO RATING RANGE */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faStar}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournamentDetails.minElo} to {tournamentDetails.maxElo}
                        </p>
                        {/* TOURNAMENT LOCATION */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faMapMarkerAlt}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournamentDetails.location}
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
                            {tournamentDetails.category}
                        </p>
                        {/* TOURNAMENT GENDER */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {getGenderIcon(tournamentDetails.gender)}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournamentDetails.gender}
                        </p>
                        {/* TOURNAMENT ORGANISER */}
                        <p className = "mb-5 text-lg">
                            <FontAwesomeIcon
                                icon = {faUserTie}
                                className = "mr-4 h-5 w-5 align-middle"
                            />
                            {tournamentDetails.createdBy}
                        </p>
                    </div>
                </div>
                {/* LINE DIVIDER */}
                <div style = {{ height: "1px", backgroundColor: "#DDDDDD" }} />
                {/* TOURNAMENT REMARKS */}
                <div className = "ml-10 w-1/2">
                    {tournamentDetails.remarks && (
                        <p className = "mb-5 text-lg"> <strong> Remarks: </strong> {tournamentDetails.remarks} </p>
                    )}
                    <p className = "mt-2 text-lg"> Max Players: <span className = "text-xl" style = {{ color: "red" }}> <strong>{tournamentDetails.playerCapacity}</strong> </span> </p>
                </div>
                {/* LIST OF PLAYERS ENROLLED IN TOURNAMENT */}
                <div className = "flex items-start gap-10">
                    <div className = "players-list mt-2 p-4 shadow-lg rounded-[8px] w-2/3 relative ml-8">
                        <h2 className = "text-xl font-semibold mb-2"> {isPastTournament ? "Players" : "Current Players"} </h2>
                        <div style = {{ height: "1px", backgroundColor: "#DDDDDD", margin: "10px 0" }} />
                        {tournamentDetails.playersPool && tournamentDetails.playersPool.length > 0 ? (
                            <ol className = "list-decimal pl-5">
                                {tournamentDetails.playersPool.map((player, index) => (
                                    <li className = "mt-5 mb-5 font-semibold"> {player} </li>
                                    
                                ))}
                            </ol>
                        ) : (
                            <p> No players have joined this tournament yet. </p>
                        )}
                    </div>
                    <button
                        onClick = {handleShowFixturesButtonClick}
                        className = "bg-primary-color-light-green hover:bg-primary-color-green text-white px-4 py-2 rounded-[8px] w-2/6 font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                    >
                        {isPastTournament ? "Show Results" : "Show Current Fixtures"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetails;