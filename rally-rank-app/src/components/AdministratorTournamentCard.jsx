// Package Imports
import { useNavigate } from "react-router-dom";

const AdministratorTournamentCard = ({ tournaments, setIsTransitioning, thisAdministrator, tab, isPastTournament }) => {
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
                navigate(`/administrator-tournaments/details/history/${tab}/${tournamentName}`, { state: { tournamentName } });
            } else {
                navigate(`/administrator-tournaments/details/ongoing/${tab}/${tournamentName}`, { state: { tournamentName } });
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
                        <h3 className = "text-xl font-bold mb-2"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-2 justify-between">
                            <p> Organiser: {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-2"> Date: 
                            {!isPastTournament
                                ? ` ${formatDate(tournament.startDate)} `
                                : ` ${formatDate(tournament.startDate)} to ${formatDate(tournament.endDate)}`
                            } 
                        </p>
                        <p className = "mb-2"> Elo Rating Criteria: {tournament.minElo} to {tournament.maxElo} </p>
                        <p className = "mb-2"> Game: {tournament.category} </p>
                        <p className = "mb-2"> Gender: {tournament.gender} </p>
                        <p className = "mb-2"> Player Capacity: {tournament.playerCapacity} </p>
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
                    <div className = "card-section-two border-l pl-4 flex-none w-1/3 flex flex-col text-text-grey">
                        <div>
                        <p className = "font-semibold"> Venue: </p>
                        <p> {tournament.location} </p>
                        {tournament.remarks && (
                            <>
                                <p className = "font-semibold mt-2"> Remarks: </p>
                                <p> {tournament.remarks} </p>
                            </>
                        )}
                        </div>

                        {/* EDIT TOURNAMENT BUTTON */}
                        <div className = "edit-tournament-button mt-auto ml-auto">
                            {checkThisAdmin(tournament.createdBy) && !isPastTournament && isBeforeStartDate(tournament.startDate) && !isBracketsGenerated(tournament.bracket) && (
                                <button
                                    onClick = {(e) => {
                                        e.stopPropagation();
                                        handleEditClick(tournament.tournamentName);
                                    }}
                                    className = "font-semibold p-2 rounded-lg shadow-md transition duration-300 ease-in-out ml-4 transform text-primary-color-green hover:shadow-xl hover:text-primary-color-light-green"
                                >
                                    Edit Tournament
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