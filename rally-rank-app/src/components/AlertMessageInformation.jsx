// Package Imports
import React, { useEffect, useState } from "react";

const AlertMessageInformation = ({ message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasMessage, setHasMessage] = useState(false);

    useEffect(() => {
        if (!message) {
            setIsVisible(false);
            setTimeout(() => setHasMessage(false), 300);
            return;
        }

        setHasMessage(true);
        setIsVisible(true);
        
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [message, onClose, duration]);

    if (!hasMessage) {
        return null;
    }

    return (
        <div
            role = "alert"
            className = {`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 alert alert-info flex items-center text-white p-4 rounded-lg shadow-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style = {{ backgroundColor: "#5bc0de", height: "50px" }}
        >
            <svg
                xmlns = "http://www.w3.org/2000/svg"
                className = "h-6 w-6 mr-3 mt-1"
                fill = "none"
                viewBox = "0 0 24 24"
                stroke = "white"
            >
                <path
                    strokeLinecap = "round"
                    strokeLinejoin = "round"
                    strokeWidth = "2"
                    d = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
            <span className = "ml-2"> {message} </span>
            <button
                onClick = {onClose}
                className = "ml-6 text-white font-bold">
                &times;
            </button>
        </div>
    );
};

export default AlertMessageInformation;