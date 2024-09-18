import React, { useState } from 'react';

// ButtonGroup takes in a prop called buttons, which is an array of strings.
// Used in the Home component to display the "Top" and "You" buttons.
// But may need to change implementation 
function ButtonGroup({ buttons }) {
    const [activeButton, setActiveButton] = useState(null);

    const handleButtonClick = (buttonId) => {
        setActiveButton(buttonId);
    };

    return (
        <div className="button-group flex gap-5">
            <button
                className={`btn ${activeButton === 1 ? 'active-button underline' : ''}`}
                onClick={() => handleButtonClick(1)}
            >
                {/* Displays the first element of buttons that was passed in ("Top") */}
                { buttons[0] }
            </button>
            <button
                className={`btn ${activeButton === 2 ? 'active-button underline' : ''}`}
                onClick={() => handleButtonClick(2)}
            >
               { buttons[1] }
            </button>
            <button
                className={`btn ${activeButton === 3 ? 'active-button underline' : ''}`}
                onClick={() => handleButtonClick(3)}
            >
               { buttons[2] }
            </button>
            
        </div>
    );
}

export default ButtonGroup;