// Package Imports
import { useState } from "react";

const AdministratorTournamentsButtons = ({ buttons, onAllClick, onMyClick, active }) => {
    const [activeButton, setActiveButton] = useState(active);

    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onAllClick();
        } else if (index === 1) {
            onMyClick();
        }
    };

    return (
        <div className = "tournaments-buttons flex gap-5">
            {buttons.map((buttonLabel, index) => (
                <button
                    key = {index}
                    className = {`btn transition-colors duration-300 font-semibold ${
                        activeButton === index
                        ? "active-button underline text-primary-color-green"
                        : "text-gray-700 hover:text-primary-color-light-green"
                    }`}
                    onClick = {() => handleButtonClick(index)}
                >
                    {buttonLabel}
                </button>
            ))}
        </div>
    );
};

export default AdministratorTournamentsButtons;