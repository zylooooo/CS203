import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Component: Tournament Details Card
const TournamentDetails = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const [hasJoined, setHasJoined] = useState(false);

    const tournamentName = location.state?.tournamentName;                  // to be used as parameter for getting the tournament details by name (following backend api)

    const isAvailable = location.state?.isAvailable;                        // to be used for displaying 'Join Tournament' button or not

    const isPastTournament = location.state?.isPastTournament || false;     // to be used for changes in tournament details for past tournaments

    const [tournamentDetails, setTournamentDetails] = useState(null);

    const [isFull, setIsFull] = useState(false);

    useEffect(() => {
        if (tournamentDetails) {
            const playerPoolLength = tournamentDetails.playersPool.length;
            setIsFull(playerPoolLength >= tournamentDetails.playerCapacity);
        }
    }, [tournamentDetails]);

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
                    `http://localhost:8080/join-${tournamentName}`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${userData.jwtToken}`,
                        },
                    }
                );

                if (response.status == 200) {
                    setHasJoined(true);
                    console.log(response.data);
                    // Success Message
                }
            } catch (error) {
                console.error("Error joining tournament", error);
            }
        } else {
            console.log("Tournament is full. Button shouldn't even appear.");
            // Alert Message
        }
    }

    const handleLeaveTournamentClick = () => {
        setHasJoined(false);
    }

    const handleBackButtonClick = () => {
        navigate(-1);
        if (!window.history.state) {
            navigate("/users/home");
        }
    };

    // WIP: Function to navigate to the fixtures page after clicking "Show Fixtures" button.
    // const handleShowFixturesButtonClick = () => {
    //     navigate("/fixtures")
    // }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
    
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    };

    // API call: Retrieved tournament details by taking the tournament name (as a state)
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
            <div className = "flex flex-col w-3/5 gap-4 border p-8 rounded-[8px]">
                <div className = "flex justify-between items-center mb-4">
                    <div className = "flex items-center gap-4">
                        <FontAwesomeIcon
                            icon = {faArrowLeft}
                            onClick = {handleBackButtonClick}
                            className = "back-icon cursor-pointer text-xl"
                        />
                        <h1 className = "text-2xl font-bold mb-2 mt-1"> {tournamentDetails.tournamentName} </h1>
                    </div>
                    {!isFull && isAvailable && (
                        <button
                            onClick = {hasJoined ? handleLeaveTournamentClick : handleJoinTournamentButtonClick}
                            className = "bg-blue-500 border text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold"
                            style= {{
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
                </div>
                <p className = "mb-2 text-lg">
                    <strong> Date: </strong> 
                    {!isPastTournament 
                        ? formatDate(tournamentDetails.startDate)
                        : `${formatDate(tournamentDetails.startDate)} to ${formatDate(tournamentDetails.endDate)}`
                    }
                </p>
                <p className = "mb-2 text-lg"> <strong> Organiser: </strong> {tournamentDetails.createdBy} </p>
                <p className = "mb-2 text-lg"> <strong> Elo Rating Criteria: </strong> {tournamentDetails.minElo} to {tournamentDetails.maxElo} </p>
                <p className = "mb-2 text-lg"> <strong> Game Category: </strong> {tournamentDetails.category} </p>
                <p className = "mb-2 text-lg"> <strong> Gender: </strong> {tournamentDetails.gender} </p>
                {!isPastTournament && (
                    <>
                        <p className = "mb-2 text-lg"> <strong> Player Capacity: </strong> {tournamentDetails.playerCapacity} </p>
                        <p className = "mb-2 text-lg">
                            {tournamentDetails.playerCapacity - tournamentDetails.playersPool.length > 0
                            ? <span><strong> Slots Available: </strong> {tournamentDetails.playerCapacity - tournamentDetails.playersPool.length} </span>
                            : <span><strong> "Slots are full!"</strong></span>}                    
                        </p>
                    </>
                )}
                {tournamentDetails.remarks && (
                    <p className = "mb-2 text-lg"> <strong> Remarks: </strong> {tournamentDetails.remarks} </p>
                )}
                <p className = "mb-2 text-lg"> <strong> Venue: </strong> {tournamentDetails.location} </p>
                <div className = "map-api-container h-64 border rounded-[8px]">
                    <p className = "text-center p-4"> Insert map here. </p>
                </div>
                <div className = "flex justify-between items-start mt-4">
                    <div className = "players-list mt-4 p-4 border rounded-[8px] w-2/3 relative">
                        <h2 className = "text-xl font-semibold mb-2"> {isPastTournament ? "Players" : "Current Players"} </h2>
                        <div style = {{ height: "1px", backgroundColor: "#DDDDDD", margin: "10px 0" }} />
                        {tournamentDetails.playersPool && tournamentDetails.playersPool.length > 0 ? (
                            <ol className = "list-decimal pl-5">
                                {tournamentDetails.playersPool.map((player, index) => (
                                    <li key = {index} className = "mt-5 mb-5"> {player} </li>
                                    
                                ))}
                            </ol>
                        ) : (
                            <p> No players have joined this tournament yet. </p>
                        )}
                    </div>
                    <button
                        // WIP: To be updated when API call for fixtures (brackets) are finalised.
                        // onClick = {handleShowFixturesClick}
                        className = "border text-white px-4 py-2 rounded-[8px] hover:bg-blue-600 font-semibold ml-2 self-start mt-4 mr-6"
                    >
                        {isPastTournament ? "Show Results" : "Show Fixtures"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetails;