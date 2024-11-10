// Package Imports
import React, { useEffect, useState } from "react";

const AlertMessageWarning = ({ message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasMessage, setHasMessage] = useState(false);

    useEffect(() => {
        if (!message) {
            setIsVisible(false);
            const hideTimer = setTimeout(() => setHasMessage(false), 300);
            return () => clearTimeout(hideTimer);
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
    };

    return (
        <div
            role = "alert"
            className = {`bg-red-300 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 alert alert-success flex items-center p-4 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
            style = {{ height: "auto", maxWidth: "400px", color: "#272727" }}
        >
            <svg
                xmlns = "http://www.w3.org/2000/svg"
                className = "h-6 w-6 shrink-0"
                fill = "none"
                viewBox = "0 0 24 24"
                stroke = "currentColor"
                style = {{ color: "#272727" }}
            >
                <path
                    strokeLinecap = "round"
                    strokeLinejoin = "round"
                    strokeWidth = "2"
                    d = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
            <span className = "ml-3 text-sm md:text-base font-bold"> {message} </span>
            <button
                onClick = {onClose}
                className = "ml-6 text-lg font-bold focus:outline-none hover:text-gray-200"
                style = {{ color: "#272727" }}
            >
                &times;
            </button>
        </div>
    );
}

export default AlertMessageWarning;