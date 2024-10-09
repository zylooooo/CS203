import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profilePictureTest1 from "../assets/profile-picture-one.jpg";
import profilePictureTest2 from "../assets/profile-picture-two.jpg";

// ------------------------------------- API CALLS - MOCK PLAYER DATA ------------------------------------------------
// API Calls - Mock tournament data (Upcoming)
const upcomingTournaments = [
    {
        name: "[Sample UpcomingTournament] Salibandy",
        organizerProfilePicture: profilePictureTest1,
        organizerName: "Puff Daddy",
        startDate: "03/11/2024",
        endDate: "17/11/2024",
        minElo: "400",
        maxElo: "500",
        venue: "Choa Chu Kang Stadium, Singapore 238232",
        remarks: "",
    },
    {
        name: "[Sample UpcomingTournament] Innerbandy",
        organizerProfilePicture: profilePictureTest2,
        organizerName: "Justin Bieber",
        startDate: "07/12/2024",
        endDate: "21/12/2024",
        minElo: "500",
        maxElo: "700",
        venue: "Choa Chu Kang Stadium, Singapore 238232",
        remarks: "Marc Wahlberg will be coming to watch the game.",
    },
];

// API Calls - Mock tournament data (Past)
const pastTournaments = [
    {
        name: "[Sample PastTournament] Rookie Rumble",
        organizerProfilePicture: profilePictureTest1,
        organizerName: "Puff Daddy",
        startDate: "03/04/2024",
        endDate: "17/04/2024",
        minElo: "400",
        maxElo: "500",
        venue: "SMU Tennis Court, Singapore 938923",
        remarks: "",
    },
    {
        name: "[Sample PastTournament] Taqwa",
        organizerProfilePicture: profilePictureTest2,
        organizerName: "Justin Bieber",
        startDate: "07/02/2024",
        endDate: "21/02/2024",
        minElo: "1000",
        maxElo: "1500",
        venue: "Choa Chu Kang Stadium, Singapore 238232",
        remarks: "",
    },
];

const myTournaments = [
    {
        name: "[Sample MyTournament] Wonder Games",
        organizerProfilePicture: profilePictureTest1,
        organizerName: "Puff Daddy",
        startDate: "03/04/2024",
        endDate: "17/04/2024",
        minElo: "400",
        maxElo: "500",
        venue: "SMU Tennis Court, Singapore 938923",
        remarks: "",
    },
    {
        name: "[Sample MyTournament] Orion Star",
        organizerProfilePicture: profilePictureTest2,
        organizerName: "Justin Bieber",
        startDate: "07/05/2024",
        endDate: "21/05/2024",
        minElo: "1000",
        maxElo: "1500",
        venue: "Choa Chu Kang Stadium, Singapore 238232",
        remarks: "",
    },
];
// -------------------------------------------------------------------------------------------------------------------

// Define the TournamentButtons component - Upcoming Tournaments, Past Tournaments and My Tournaments
const TournamentButtons = ({ buttons, onUpcomingTournamentsClick, onPastTournamentsClick, onMyTournamentsClick}) => {
    const [activeButton, setActiveButton] = useState(0)     // "Upcoming Tournaments" button will be the active button

    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onUpcomingTournamentsClick();
        } else if (index === 1) {
            onPastTournamentsClick();
        } else {
            onMyTournamentsClick();
        }
    };

    return (
        <div className = "tournament-buttons flex gap-5">
            {buttons.map((buttonLabel, index) => (
                <button
                    key = {index}
                    className = {`btn transition-colors duration-300 ${activeButton === index ? 'active-button underline' : 'text-gray-700 hover:text-blue-500 hover:text-red-500'}`}
                    onClick = {() => handleButtonClick(index)}>
                        {buttonLabel}
                    </button>
            ))}
        </div>
    );
}

// Define the TournamentCard component - Template to display the tournaments
const TournamentCard = ({ tournamentType }) => {
    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        navigate("/tournament-details", {state: tournament});
    };

    return (
        <div className = "tournaments-cards-list flex flex-col space-y-8">
            {tournamentType.map((tournament, index) => (
                <div
                    key = {index}
                    className = "tournament-card border rounded-lg p-4 bg-white shadow-md cursor-pointer hover:shadow-lg transition flex w-4/5"
                    onClick = {() => handleTournamentCardClick(tournament)}
                >
                    <div className = "card-section-one flex-1 pr-4">
                        <h3 className = "text-xl font-bold mb-2"> {tournament.name} </h3>
                        <div className = "flex items-center mb-2">
                            <img
                                src = {tournament.organizerProfilePicture}
                                alt = {tournament.organizerName}
                                className = "organizer-picture w-8 h-8 rounded-full mr-2"
                            />
                            <p> Organiser: {tournament.organizerName} </p>
                        </div>
                        <p className = "mb-2"> Date: {tournament.startDate} to {tournament.endDate} </p>
                        <p> Elo Rating: {tournament.minElo} to {tournament.maxElo} </p>
                    </div>
                    <div className = "card-section-two border-l pl-4 flex-none w-1/3">
                        <p className = "font-semibold"> Venue: </p>
                        <p> {tournament.venue} </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

function UserTournaments() {
    const [tournamentType, setTournamentType] = useState(upcomingTournaments)   // Consistent with Line 87

    const handleUpcomingTournamentsClick = () => {
        setTournamentType(upcomingTournaments);
    };

    const handlePastTournamentsClick = () => {
        setTournamentType(pastTournaments);
    };

    const handleMyTournamentsClick = () => {
        setTournamentType(myTournaments);
    };

    return (
        <>
            <div className = "user-tournaments-page main-container">
                <div className = "row-container flex flex-col w-3/5 gap-8">

                    {/* TOURNAMENT BUTTONS: UPCOMING, PAST, MY */}
                    <TournamentButtons
                        buttons = {["Upcoming Tournaments", "Past Tournaments", "My Tournaments"]}
                        onUpcomingTournamentsClick = {handleUpcomingTournamentsClick}
                        onPastTournamentsClick = {handlePastTournamentsClick}
                        onMyTournamentsClick = {handleMyTournamentsClick}
                    />

                    {/* SEARCH BAR */}
                    <div className = "tournament-search-bar flex gap-3">
                        <input
                            className = "border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type = "text"
                            placeholder = "Search for tournaments..."
                        />
                        <button className = "border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
                            Search
                        </button>
                    </div>

                    {/* LIST OF TOURNAMENT CARDS */}
                    <TournamentCard tournamentType = {tournamentType} />
                </div>

                <div className = "col-container"> Ongoing Tournaments </div>
            </div>
        </>
    );
};

export default UserTournaments;