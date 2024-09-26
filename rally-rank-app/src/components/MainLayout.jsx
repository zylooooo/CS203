// src/components/MainLayout.js
import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../auth/AuthContext";
import UserNavBar from "./navigation-bars/UserNavBar";
import PublicNavBar from "./navigation-bars/PublicNavBar";
import AdministratorNavBar from "./navigation-bars/AdministratorNavBar";

function MainLayout({ children }) {
    const { userType } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Conditional rendering of the NavBar based on user type */}
            {userType === -1 ? (
                <PublicNavBar />
            ) : userType === 0 ? (
                <UserNavBar />
            ) : (
                <AdministratorNavBar />
            )}

            {/* Main Content */}
            <div className="flex-grow flex flex-col justify-start items-center">
                {children}
            </div>
        </div>
    );
}

MainLayout.propTypes = {
    children: PropTypes.element.isRequired,
};

export default MainLayout;
