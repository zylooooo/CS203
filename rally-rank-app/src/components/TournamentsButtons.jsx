import React, { useState } from 'react';

function TournamentsButtons({ buttons }) {
    const [activeButton, setActiveButton] = useState(0); // "Upcoming Button" will be the first active button

    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            
        }
    };

    return (
        <div className = "tournaments-buttons flex gap-5">
            {buttons.map((buttonLabel, index) => (
                <button 
                    key = {index}
                    className = {`btn transition-colors duration-300 ${activeButton === index ? 'active-button underline' : 'text-gray-700 hover:text-blue-500 hover:text-red-500'}`} 
                    onClick = {() => handleButtonClick(index)}>
                        {buttonLabel}
                </button>
            ))}
        </div>
    );
}

export default TournamentsButtons;