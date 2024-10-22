import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Component: Tournament Details Card
const AdministratorPastTournamentDetails = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const fromPage = location.state?.from || "/administrator-tournament-history";      // to retrieve page where admins clicked for tournament details

    const tournamentName = location.state.tournamentName;

    const isMyPastTournament = location.state.isMyPastTournaments;

    const [tournamentDetails, setTournamentDetails] = useState(null);

    const handleBackButtonClick = () => {
        navigate(fromPage);
    }

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
            }

        } catch (error) {

            console.error('Error fetching tournament:', error);
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
                </div>
                <p className = "mb-2 text-lg"> <strong> Date: </strong> {formatDate(tournamentDetails.startDate)} </p>
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
                        <p className = "text-md text-gray-500 absolute top-4 right-4 font-semibold">
                            Total Players: {tournamentDetails.playersPool.length}
                        </p>
                        {tournamentDetails.playersPool && tournamentDetails.playersPool.length > 0 ? (
                            <ol className = "list-decimal pl-5">
                                {tournamentDetails.playersPool.map((player, index) => (
                                    <li key = {index} className = "mt-5 mb-5 flex justify-between items-center"> 
                                        <span>{index}. {player}</span>
                                        { isMyPastTournament && (
                                          <button className = "border text-white px-4 py-2 rounded-[8px] hover:bg-blue-600 font-semibold self-end ">
                                              Strike
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
                        className = "border text-white px-4 py-2 rounded-[8px] hover:bg-blue-600 font-semibold ml-2 self-start mt-4 mr-6"
                    >
                        Show Fixtures
                    </button>

                </div>
            </div>
        </div>
    );
};

export default AdministratorPastTournamentDetails;