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
        <div className = "flex flex-col h-screen bg-gray-50" style = {{ backgroundColor: "#fffcf2" }}>
            <header className = "w-full">
                {isAdminLoggedIn ? (
                    <AdministratorNavBar />
                ) : isUserLoggedIn ? (
                    <UserNavBar />
                ) : (
                    <PublicNavBar />
                )}
            </header>
            <main className = "flex-1 overflow-auto flex flex-col justify-start items-center w-full md:px-0 lg:px-0">
                {/* replace 'flex-1 overflow-auto' with 'flex-grow' if you don't want the footer to constantly show */}
                <div className = "w-full h-main">
                    {children}
                </div>
            </main>
            <footer className = "w-full bg-gray-100 py-4 text-center">
                <p className = "text-sm text-gray-600">© 2024 RallyRank. All rights reserved.</p>
            </footer>
        </div>
    );
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;
