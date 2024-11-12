// Package Imports
import { useNavigate } from "react-router-dom";

// Icons Imports
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AdministratorTournamentCard = ({ tournaments, setIsTransitioning, thisAdministrator, isPastTournament }) => {
    const navigate = useNavigate();

    // Function: Check if the current date is before the start date of tournament
    const isBeforeStartDate = (startDate) => {
        const currentDate = new Date();
        const tournamentStartDate = new Date(startDate);
        return currentDate < tournamentStartDate;
    };

    // Function: Check if brackets are generated for the tournament
    const isBracketsGenerated = (tournamentBrackets) => {
        return tournamentBrackets != null;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setHours(date.getHours() + 8); // Add 8 hours
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });
        return `${day} ${month} ${year}`;
    };

    const checkThisAdmin = (adminName) => {
        return adminName === thisAdministrator;
    };

    const handleTournamentCardClick = (tournamentName) => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (isPastTournament) {
                navigate(`/administrator-tournaments/details/history/${tournamentName}`, { state: { tournamentName } });
            } else {
                navigate(`/administrator-tournaments/details/ongoing/${tournamentName}`, { state: { tournamentName } });
            }
        }, 200);
    };

    const handleEditClick = (tournamentName) => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/administrator-edit-tournaments", { state: tournamentName });
        }, 200);
    }

    return (
        <div className = "flex flex-col gap-5 w-full">
            {tournaments.map((tournament, index) => (
                <div key = {index} className = "flex card-background rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick = {() => handleTournamentCardClick(tournament.tournamentName)}
                >
                    <div className = "flex-1 pr-4">
                        <h3 className = "text-xl font-bold mb-5"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-3">
                            <p><span className = "font-semibold"> Organiser: </span> {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-3"> <span className = "font-semibold"> Date: </span>
                            {!isPastTournament
                                ? ` ${formatDate(tournament.startDate)} `
                                : ` ${formatDate(tournament.startDate)} to ${formatDate(tournament.endDate)}`
                            } 
                        </p>
                        <p className = "mb-3"><span className = "font-semibold"> Elo Rating Criteria: </span> {tournament.minElo} to {tournament.maxElo} </p>
                        <p className = "mb-3"><span className = "font-semibold"> Gender: </span> {tournament.gender} </p>
                        <p className = "mb-3"><span className = "font-semibold"> Player Capacity: </span> {tournament.playerCapacity} </p>
                        <p>
                            <strong>
                                (
                                    {tournament.playerCapacity - tournament.playersPool.length > 0
                                    ? tournament.playerCapacity - tournament.playersPool.length === 1
                                        ? "1 slot left"
                                        :`${tournament.playerCapacity - tournament.playersPool.length} slots left`
                                    : "Full"
                                    }
                                )
                            </strong>
                        </p>
                    </div>
                    <div className = "card-section-two border-l pl-4 flex-none w-2/5 flex flex-col text-text-grey">
                        <div>
                            <p className = "mb-3"><span className = "font-semibold"> Venue: </span> {tournament.location} </p>
                            <p className = "mb-3"><span className = "font-semibold"> Game: </span> {tournament.category} </p>
                        </div>

                        {/* EDIT TOURNAMENT BUTTON */}
                        <div className = "edit-tournament-button mt-auto ml-auto">
                            {checkThisAdmin(tournament.createdBy) && !isPastTournament && isBeforeStartDate(tournament.startDate) && !isBracketsGenerated(tournament.bracket) && (
                                <button
                                    onClick = {(e) => {
                                        e.stopPropagation();
                                        handleEditClick(tournament.tournamentName);
                                    }}
                                    className = "font-bold p-2 rounded-lg shadow-md transition duration-300 ease-in-out ml-4 transform text-primary-color-green hover:shadow-xl hover:text-primary-color-light-green mr-2"
                                    style = {{ backgroundColor: "#FFFEF2" }}
                                >
                                    <FontAwesomeIcon icon = {faPen} className = "mr-2 text-sm ml-2" /> <span className = "mr-2"> Edit Tournament </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdministratorTournamentCard