// Icons Imports
import { FaCrown, FaMedal } from "react-icons/fa";

const UserLeaderboardCard = ({ leaderboardPlayer, rank }) => {

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1:
                return <FaCrown className = "text-4xl" style = {{ color: "#EEB609 "}} />
            case 2:
                return <FaMedal className = "text-3xl" style = {{ color: "#A5A9B4" }} />
            case 3:
                return <FaMedal className = "text-3xl" style = {{ color: "#B08D57" }} />
            default:
                return <span className = "text-2xl font-bold"> #{rank} </span>
        }
    };

    return (
        <div
            className = "leaderboard-card bg-white shadow-lg rounded-lg p-4 flex justify-between items-center transition-transform transform hover:scale-[1.02] hover:shadow-xl w-full h-2/5"
        >
            <div>
                <h3 className = "text-lg font-bold mb-2"> {leaderboardPlayer.firstName} {leaderboardPlayer.lastName} </h3>
                <h3 className = "text-md mb-2"> Username: {leaderboardPlayer.username} </h3>
                <p className = "text-sm text-gray-600"> Elo Rating: {leaderboardPlayer.elo} </p>
            </div>
            <div>
                {getRankIcon(rank)}
            </div>
        </div>
    );
};

export default UserLeaderboardCard;
