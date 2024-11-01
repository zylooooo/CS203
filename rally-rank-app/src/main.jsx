// Package Imports
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// File Imports
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);