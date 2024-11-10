// Icons Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faTrophy } from '@fortawesome/free-solid-svg-icons';

const MatchResultsCard = ({ matchDetails, setShowMatchResultsCard }) => {
    const player1 = matchDetails.players[0];
    const player2 = matchDetails.players[1];
    const matchWinner = matchDetails.matchWinner;
    const matchLoser = matchWinner === player1 ? player2 : player1;

    const calculateMatchWinnerScore = () => {
        let player1SetsWon = 0;
        let player2SetsWon = 0;
        matchDetails.sets.forEach((set) => {
            if (set.setWinner === player1) {
                player1SetsWon++;
            } else if (set.setWinner === player2) {
                player2SetsWon++;
            }
        });
        return player1SetsWon > player2SetsWon ? player1SetsWon : player2SetsWon;
    };

    const calculateMatchLoserScore = () => {
        let player1SetsWon = 0;
        let player2SetsWon = 0;
        matchDetails.sets.forEach((set) => {
            if (set.setWinner === player1) {
                player1SetsWon++;
            } else if (set.setWinner === player2) {
                player2SetsWon++;
            }
        });
        return player1SetsWon < player2SetsWon ? player1SetsWon : player2SetsWon;
    };

    return (
        <div className = "main-container absolute inset-0 flex items-center justify-center bg-primary-color-black bg-opacity-50">
            <div className = "match-results-card-template flex flex-col gap-4 p-8 rounded-lg w-3/5 bg-white max-h-[80vh] overflow-y-auto shadow-lg">
                <div className = "flex justify-between items-center mb-8">
                    <h2 className = "text-2xl font-bold"> Match Results </h2>
                    <button
                        type = "button"
                        onClick = {() => setShowMatchResultsCard(false)}
                        className = "text-2xl text-gray-600 hover:text-gray-800"
                    >
                        <FontAwesomeIcon icon = {faTimesCircle} />
                    </button>
                </div>
                <div className = "flex justify-around items-center mb-5">
                    <div className = "flex flex-col items-center text-center bg-green-100 p-4 rounded-lg w-1/3 shadow-md">
                        <FontAwesomeIcon icon = {faTrophy} className = "text-yellow-500 text-3xl mb-2" />
                        <h3 className = "text-2xl font-bold text-green-700"> {matchWinner} </h3>
                        <p className = "text-4xl font-bold text-green-700"> {calculateMatchWinnerScore()} </p>
                    </div>
                    <div className = "text-2xl font-semibold text-gray-500">VS</div>
                    <div className = "flex flex-col items-center text-center bg-gray-100 p-4 rounded-lg w-1/3 shadow-md">
                        <h3 className = "text-2xl font-bold text-gray-600"> {matchLoser} </h3>
                        <p className = "text-4xl font-bold text-gray-600"> {calculateMatchLoserScore()} </p>
                    </div>
                </div>
                <table className = "w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className = "border border-gray-300 px-4 py-2"> Set </th>
                            <th className = "border border-gray-300 px-4 py-2"> {player1} </th>
                            <th className = "border border-gray-300 px-4 py-2"> {player2} </th>
                            <th className = "border border-gray-300 px-4 py-2"> Set Winner </th>
                        </tr>
                    </thead>
                    <tbody>
                        {matchDetails.sets.map((set, i) => (
                            <tr key = {i}>
                                <td className = "border border-gray-300 px-4 py-2 text-center">
                                    Set {i + 1}
                                </td>
                                <td className = "border border-gray-300 px-4 py-2 text-center">
                                    {set.result[0]}
                                </td>
                                <td className = "border border-gray-300 px-4 py-2 text-center">
                                    {set.result[1]}
                                </td>
                                <td className = "border border-gray-300 px-4 py-2 text-center font-semibold">
                                    {set.setWinner === player1 ? player1 : player2}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MatchResultsCard;