// Package Imports
import { useEffect, useState } from "react";

const UserTournamentButtons = ({ buttons, onAvailableTournamentsClick, onMyScheduledTournamentsClick, activeButton }) => {
    // const [activeButton, setActiveButton] = useState(0);

    const handleTournamentButtonClick = (index) => {
        // setActiveButton(index);
        if (index === 0) {
            onAvailableTournamentsClick();
        } else {
            onMyScheduledTournamentsClick();
        }
    };

    return (
        <div className = "tournament-buttons flex gap-5">
            {buttons.map((tournamentButtonLabel, index) => (
                <button
                    key = {index}
                    className = {`btn transition-colors duration-300 font-semibold ${
                        activeButton === index
                        ? "active-button underline text-primary-color-green"
                        : "text-gray-700 hover:text-primary-color-light-green"
                    }`}
                    onClick = {() => handleTournamentButtonClick(index)}
                >
                    {tournamentButtonLabel}
                </button>
            ))}
        </div>
    );
};

export default UserTournamentButtons;