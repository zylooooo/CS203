// Package Imports
import React, { useEffect, useState } from "react";

const AlertMessageSuccess = ({ message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasMessage, setHasMessage] = useState(false);

    useEffect(() => {
        if (!message) {
            setIsVisible(false);
            // Delay the removal of `hasMessage` to allow the fade-out transition to complete.
            const hideTimer = setTimeout(() => setHasMessage(false), 300);
            return () => clearTimeout(hideTimer);
        }
    
        // Display the message and set up the fade-out timer.
        setHasMessage(true);
        setIsVisible(true);
        
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Use 300ms here to match fade-out duration
        }, duration);
    
        return () => clearTimeout(timer);
    }, [message, onClose, duration]);

    if (!hasMessage) {
        return null;
    }

    return (
        <div
            role = "alert"
            className = {`bg-primary-color-light-green fixed top-4 left-1/2 transform -translate-x-1/2 z-50 alert alert-success flex items-center text-white p-4 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
            style = {{ height: "50px" }}
        >
            <svg
                xmlns = "http://www.w3.org/2000/svg"
                fill = "none"
                viewBox = "0 0 24 24"
                className = "h-6 w-6 shrink-0 stroke-current"
                stroke = "black"
            >
                <path
                    strokeLinecap = "round"
                    strokeLinejoin = "round"
                    strokeWidth = "2"
                    d = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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

export default AlertMessageSuccess;