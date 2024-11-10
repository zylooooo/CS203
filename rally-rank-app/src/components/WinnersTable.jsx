// Icons Imports
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const WinnersTable = ({ winners, matches }) => {
    const formatDate = (dateString) => {
        if (dateString === null) {
            return;
        }
        const date = new Date(dateString);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
    };

    return (
        <div className = "winners p-5 h-fit overflow-y-auto w-full">
            <div className = "mt-4 flex flex-col gap-4">
                {matches.length > 0 ? (
                    matches.map((match, index) => (
                        <div key = {index} className = "winner-card border border-gray-300 rounded-lg p-4 shadow-md">
                            <div className = "flex flex-col items-start gap-2">
                                <div className = "flex justify-between w-full">
                                    <span className="text-sm text-gray-500 "> Date: {formatDate(match.startDate) || "TBD"} </span>
                                </div>
                                <div className = "flex flex-col items-center justify-center gap-2 w-full">
                                    <div className = "text-gray-700">
                                        {match.players[0] || "TBD"}
                                    </div>
                                    <span className = "font-semibold">VS</span>
                                    <div className = "text-gray-700">
                                        {match.players[1] || "TBD"}
                                    </div>
                                    <div className = "text-green-600 mt-4 text-center">
                                        <span className = "mr-2" style = {{ color: "#B88A44" }}> <FontAwesomeIcon icon = {faTrophy} /> </span>
                                        <span className = "font-semibold"> Match Winner: </span>
                                            {winners ? (winners[0] || "TBD") : "TBD"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p> No matches available </p>
                )}
            </div>
        </div>
    );
};

export default WinnersTable;