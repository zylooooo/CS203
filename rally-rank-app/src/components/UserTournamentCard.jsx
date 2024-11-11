// Package Imports
import { useNavigate } from "react-router-dom";

const UserTournamentCard = ({ tournamentType, isAvailableTournament, isScheduledTournament }) => {
    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        if (isAvailableTournament) {
            navigate(`/tournament-details/avail/${tournament.tournamentName}`, {
                state: {
                    tournamentName: tournament.tournamentName,
                    isAvailableTournament,
                    isScheduledTournament,
                }
            })
        } else if (isScheduledTournament) {
            navigate(`/tournament-details/sched/${tournament.tournamentName}`, {
                state: {
                    tournamentName: tournament.tournamentName,
                    isAvailableTournament,
                    isScheduledTournament,
                }
            })
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });
        return `${day} ${month} ${year}`;
    };

    return (
        <div className = "flex flex-col gap-5 w-full">
            {tournamentType.map((tournament, index) => (
                <div
                    key = {index}
                    className = "flex p-5 card-background border shadow-md cursor-pointer hover:shadow-xl transition-all w-full rounded-[12px]"
                    onClick = {() => handleTournamentCardClick(tournament)}
                >
                    <div className = "flex-1 pr-4 py-1">
                        <h3 className = "text-xl font-bold mb-3"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-3">
                            <p><span className = "font-semibold"> Organiser: </span> {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-3"><span className = "font-semibold"> Date: </span> {formatDate(tournament.startDate)} </p>
                        <p className = "mb-3"><span className = "font-semibold"> Elo Rating Criteria: </span> {tournament.minElo} to {tournament.maxElo} </p>
                        <p className = "mb-2"><span className = "font-semibold"> Gender: </span> {tournament.gender} </p>
                    </div>
                    <div className = "card-section-two border-l pl-4 flex-none w-2/5 relative">
                        <p className = "mb-3"><span className = "font-semibold"> Venue: </span> {tournament.location} </p>
                        <p className = "mb-3"><span className = "font-semibold"> Game: </span> {tournament.category} </p>
                        <div className = "absolute bottom-0 right-2 text-right">
                            <p
                                style = {{
                                    color: tournament.playerCapacity - tournament.playersPool.length <= 10
                                    ? "red"
                                    : "text-grey",
                                    fontWeight: tournament.playerCapacity - tournament.playersPool.length <= 10
                                    ? 700
                                    : "normal"
                                }}
                                className = "font-semibold mb-3"
                            >
                                {tournament.playerCapacity - tournament.playersPool.length > 0
                                ? `Slots left: ${tournament.playerCapacity - tournament.playersPool.length}`
                                : "Slots are full!"}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserTournamentCard;