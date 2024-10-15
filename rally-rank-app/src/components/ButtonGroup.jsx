import React, { useState } from 'react';

function ButtonGroup({ buttons }) {
    const [activeButton, setActiveButton] = useState(0);

    const handleButtonClick = (buttonId) => {
        setActiveButton(buttonId);
    };

    return (
        <div className = "button-group flex gap-5">
            {buttons.map((label, index) => (
                <button
                    key = {index}
                    className = {`btn ${activeButton === index + 1 ? 'active-button underline' : ''}`}
                    onClick = {() => handleButtonClick(index + 1)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default ButtonGroup;