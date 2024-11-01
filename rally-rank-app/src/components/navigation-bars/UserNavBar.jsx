// React
import { useState } from "react";

// Authentication
import { useAuth } from "../../authentication/AuthContext";

// React Router
import { NavLink, useNavigate } from "react-router-dom";

function UserNavBar() {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/auth/user-login");
    };

    const navLinkClasses = "text-secondary-color-dark-green hover:text-primary-color-green transition-colors duration-200";
    const activeNavLinkClasses = "font-bold text-primary-color-green";

    return (
        <nav className="bg-white shadow-md">
            {/* 
                max-w-7xl is the max width of the container
                lg:px-8 is the padding for large screens
                sm:px-6 is the padding for medium screens
                px-4 is the padding for small screens
            */}
            <div className="mx-auto max-w-8xl lg:px-8 sm:px-6 px-4 mr-20 ml-20"> 
                <div className="flex justify-between h-20">
                    <div className="flex-shrink-0 flex items-center">
                        <NavLink to="/users/home">
                            <img className="h-10 w-auto" src="/src/assets/Rally-Rank-Logo.svg" alt="RallyRank Logo" />
                        </NavLink>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <NavLink to="/users/home" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''} px-3 py-2 rounded-md text-sm font-medium`}>Home</NavLink>
                        <NavLink to="/users/Tournaments" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''} px-3 py-2 rounded-md text-sm font-medium`}>Tournaments</NavLink>
                        <NavLink to="/past-tournaments" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''} px-3 py-2 rounded-md text-sm font-medium`}> My Past Tournaments</NavLink>
                        <NavLink to="/user/profile" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''} px-3 py-2 rounded-md text-sm font-medium`}>Your Profile</NavLink>
                        <button onClick={handleLogout} className="ml-4 px-4 py-2 rounded-xl text-sm font-bold bg-custom-green bg-custom-green-hover transition-colors duration-200" style = {{ color: "white" }}>Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default UserNavBar;
