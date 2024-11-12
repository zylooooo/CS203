
// Package Imports
import { useNavigate } from "react-router-dom";

const UserScheduledTournamentCard = ({ scheduledTournaments, isScheduledTournament }) => {
    const navigate = useNavigate();

    const handleScheduledTournamentCardClick = (scheduledTournament) => {
        navigate(`/tournament-details/sched/${scheduledTournament.tournamentName}`, {
            state: {
                ...scheduledTournament,
                from: window.location.pathname,
                isScheduledTournament
            }
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setHours(date.getHours() + 8); // Add 8 hours
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });
        return `${day} ${month} ${year}`;
    };

    return (
        <div className="space-y-4">
            {scheduledTournaments.length > 0 ? (
                scheduledTournaments.map((scheduledTournament, index) => (
                    <div
                        key = {index}
                        className = "scheduled-tournament-card p-4 rounded-[20px] shadow-md bg-white cursor-pointer hover:shadow-lg transition text-text-grey"
                        onClick = {() => handleScheduledTournamentCardClick(scheduledTournament)}
                    >
                        <h3 className = "text-lg font-semibold mt-3"> {index + 1}. {scheduledTournament.tournamentName} </h3>
                        <p className = "text-sm mt-3">
                            <span className = "font-semibold"> Date: </span>
                            {formatDate(scheduledTournament.startDate)}
                        </p>
                        <p className = "text-sm mt-3 mb-3">
                            <span className = "font-semibold"> Organiser: </span>
                            {scheduledTournament.createdBy}
                        </p>
                    </div>
                ))
            ) : (
                <p className = "text-gray-800 font-bold text-center"> You have no scheduled tournaments. Join one today! </p>
            )}
        </div>
    );
    
};

export default UserScheduledTournamentCard;