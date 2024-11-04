import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faStar, faMapMarkerAlt, faUserTie, faGamepad, faMars, faVenus, faArrowLeft} from "@fortawesome/free-solid-svg-icons";

// Component: Tournament Details Card
const TournamentDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isFull, setIsFull] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const tournamentName = location.state?.tournamentName;                  // To be used as parameter for getting the tournament details by name (following backend api)
    const [tournamentDetails, setTournamentDetails] = useState(null);
    const isPastTournament = location.state?.isPastTournament || false;     // To be used for changes in tournament details for past tournaments
    const isAvailableTournament = location.state?.isAvailableTournament;                        // To be used for displaying 'Join Tournament' button or not
    const isScheduledTournament = location.state?.isScheduledTournament;
    const [joinedForScheduled, setJoinedForScheduled] = useState(true);
    


    const isTwoWeeks = (startDate) => {
        const currentDate = new Date();
        const tournamentStartDate = new Date(startDate);
        const timeDifference = tournamentStartDate - currentDate;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference === 14;
    }

    // Function to be used to display the gender icon for tournament details.
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
                    `http://localhost:8080/users/tournaments/join-${tournamentName}`,
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
                    console.log(response.data);
                    // Success Message
                }
            } catch (error) {
                console.error("Error joining tournament:", error.response ? error.response.data : error.message);
            }
        } else {
            console.log("Tournament is full. Button shouldn't even appear.");
            // Alert Message
        }
    }

    // ----------------------- API Call: Removing user's username when leaving a tournament  ----------------------- (WAIT FOR ROUTER FROM BACKEND)
    const handleLeaveTournamentClick = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (!userData || !userData.jwtToken) {
                    console.error("No JWT Token found!");
                    // Alert Message
                    return;
                }

                const response = await axios.delete(
                    `http://localhost:8080/users/tournaments/leave-${tournamentName}`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${userData.jwtToken}`,
                        },
                    }
                );

                if (response.status == 200) {
                    setHasJoined(false);
                    setJoinedForScheduled(false);
                    console.log(response.data);
                    // Success Message
                }
            } catch (error) {
                console.error("Error leaving tournament:", error.response ? error.response.data : error.message);
                console.log("GOES HERE");
            }

    }

    const handleBackButtonClick = () => {
        navigate(-1);
        if (!window.history.state) {
            navigate("/users/home");
        }
    };

    // WIP: Function to navigate to the fixtures page after clicking "Show Fixtures" button.
    const handleShowFixturesButtonClick = () => {
        navigate("/user-fixtures")
    }

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
                `http://localhost:8080/users/tournaments/${tournamentName}`,
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
            console.error("Error fetching tournament details: ", error);
        }
    }

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getTournamentDetailsByName();
    }, []);

    if (!tournamentDetails) {
        return (
            <p className = "font-semibold text-lg mt-10"> Loading tournament details... </p>
        );
    }

    return (
        <div className = "tournament-card-template main-container flex">
            <div className = "flex flex-col w-2/3 gap-4 shadow-xl p-8 rounded-[12px]" style = {{ backgroundColor: "#fffefa" }}>

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
                            onClick={hasJoined ? handleLeaveTournamentClick : handleJoinTournamentButtonClick}
                            className="bg-blue-500 border text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold"
                            style={{
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
                        onClick={joinedForScheduled ? handleLeaveTournamentClick : handleJoinTournamentButtonClick}
                        className="bg-blue-500 border text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold"
                        style={{
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
                <div className = "flex justify-between items-start">
                    <div className = "players-list mt-2 p-4 shadow-lg rounded-[8px] w-2/3 relative ml-8">
                        <h2 className = "text-xl font-semibold mb-2"> {isPastTournament ? "Players" : "Current Players"} </h2>
                        <div style = {{ height: "1px", backgroundColor: "#DDDDDD", margin: "10px 0" }} />
                        {tournamentDetails.playersPool && tournamentDetails.playersPool.length > 0 ? (
                            <ol className = "list-decimal pl-5">
                                {tournamentDetails.playersPool.map((player, index) => (
                                    <li className = "mt-5 mb-5 font-semibold"> Username: {player} </li>
                                    
                                ))}
                            </ol>
                        ) : (
                            <p> No players have joined this tournament yet. </p>
                        )}
                    </div>
                    <button
                        // WIP: To be updated when API call for fixtures (brackets) are finalised.
                        onClick = {handleShowFixturesButtonClick}
                        style={{
                            backgroundColor: "#56AE57",
                            color: "white",
                          }}
                        className = "border2 px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
                    >
                        {isPastTournament ? "Show Results" : "Show Fixtures"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetails;