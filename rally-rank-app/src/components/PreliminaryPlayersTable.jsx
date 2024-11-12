// Icons Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrophy, faEye } from '@fortawesome/free-solid-svg-icons';

const PreliminaryPlayersTable = ({ preliminaryMatches, handleMatchClick }) => {

    const getDate = (startDate) => {
        if (startDate === null) {
            return;
        }
        const date = new Date(startDate);
        return `${date.toLocaleString('en-US', { day: '2-digit' })} ${date.toLocaleString('en-US', { month: 'long' })} ${date.toLocaleString('en-US', { year: 'numeric' })}`;
    };
    
    const getTiming = (startDate) => {
        if (startDate === null) {
            return;
        }
        const date = new Date(startDate);
        return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className = "preliminary-matches p-6 max-h-[50vh] overflow-y-auto shadow-xl rounded-[12px] mb-5">
            <h2 className = "text-3xl font-bold mb-10 text-center text-gray-800 mt-3"> Preliminary Matches </h2>
            <div className = "overflow-x-auto">
                <table className = "min-w-full table-auto mt-2">
                    <thead>
                        <tr className = "text-gray-700">
                            <th className = "py-3 px-3 text-left font-bold text-xl"> Date </th>
                            <th className = "py-3 px-3 text-left font-bold text-xl"> Time </th>
                            <th className = "py-3 px-3 text-left font-bold text-xl"> Player 1 </th>
                            <th className = "py-3 px-3 text-left font-bold text-xl"> Player 2 </th>
                            <th className = "py-3 px-3 text-left font-bold text-xl"> Match Winner </th>
                            <th className = "py-3 px-3 text-left font-bold text-xl"> Actions </th>
                        </tr>
                    </thead>
                    <tbody>
                        {preliminaryMatches.length > 0 ? (
                            preliminaryMatches.map((match, index) => (
                                <tr
                                    key = {index}
                                    className = "border-b border-gray-200 hover:bg-gray-50 transition duration-300"
                                >
                                    <td className = "px-3 py-4 text-gray-600 font-semibold"> 
                                        {getDate(match.startDate) || <span className = "text-gray-400"> TBD </span>}
                                    </td>
                                    <td className = "px-3 py-4 text-gray-600 font-semibold"> 
                                        {getTiming(match.startDate) || <span className = "text-gray-400"> TBD </span>}
                                    </td>
                                    <td className = "px-3 py-4 text-gray-600 font-semibold"> 
                                        {match.players[0]|| <span className = "text-gray-400"> TBD </span>}
                                    </td>
                                    <td className = "px-3 py-4 text-gray-600 font-semibold">
                                        {match.players[1] || <span className = "text-gray-400"> TBD </span>}
                                    </td>
                                    <td className = "px-3 py-4 text-gray-600 font-bold">
                                        <span className = "mr-2" style = {{ color: "#B88A44" }}> <FontAwesomeIcon icon = {faTrophy} /> </span>
                                        <span> {match.matchWinner || <span className = "text-gray-400"> TBD </span>} </span>
                                    </td>
                                    <td className = "px-3 py-4">
                                        <button
                                            type = "button"
                                            onClick = {() => handleMatchClick(match)}
                                            className = "text-blue-500 hover:text-blue-700"
                                        >
                                            <FontAwesomeIcon icon = {match.matchWinner ? faEye : faPen} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan = "6" className = "text-center py-4 text-gray-400">
                                    There are no preliminary matches fixed yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PreliminaryPlayersTable;