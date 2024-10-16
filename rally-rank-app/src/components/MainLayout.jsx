// React
import React from "react";

// Prop Types
import PropTypes from "prop-types";

// Authentication
import { useAuth } from "../authentication/AuthContext";

// Navigation Bars
import UserNavBar from "./navigation-bars/UserNavBar";
import PublicNavBar from "./navigation-bars/PublicNavBar";
import AdministratorNavBar from "./navigation-bars/AdministratorNavBar";

function MainLayout({ children }) { 

    const { isUserLoggedIn, isAdminLoggedIn } = useAuth();

    return (
        <>
            <div className = "flex flex-col min-h-screen bg-gray-50">
                    {isAdminLoggedIn ? (
                        <AdministratorNavBar />
                    ) : isUserLoggedIn ? (
                        <UserNavBar />
                    ) : (
                        <PublicNavBar />
                    )}
                <div className = "flex-grow flex flex-col justify-start items-center">
                    {children}
                </div>
            </div>
        </>
    );
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;
