// Navigation
import { useNavigate, NavLink } from 'react-router-dom';
import rallyRankLogo from "../../assets/Rally-Rank-Logo.svg";
import { useEffect } from 'react';
import { useAuth } from "../../authentication/AuthContext";

function PublicNavBar() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/auth/user-login'); 
    };

    const handleSignUpClick = () => {
        navigate('/auth/user-signup'); 
    };

    const { logoutAdmin, logoutUser } = useAuth();

    useEffect(() => {
        logoutAdmin();
        logoutUser();
    }, []);
 
    return (
        <nav className="shadow-md">
            {/* 
                max-w-7xl is the max width of the container
                lg:px-8 is the padding for large screens
                sm:px-6 is the padding for medium screens
                px-4 is the padding for small screens
            */}
            <div className="mx-auto max-w-8xl lg:px-8 sm:px-6 px-4 mr-20 ml-20"> 
                <div className="flex justify-between h-20">
                    
                    <div className="flex-shrink-0 flex items-center">
                        <NavLink to="/">
                        <img className="h-10 w-auto" src={rallyRankLogo}  alt="RallyRank Logo" />
                        </NavLink>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center" >
                    <button 
                        onClick = {handleLoginClick} 
                        className = "ml-4 px-4 py-2 rounded-xl text-sm font-bold bg-primary-color-light-green hover:bg-primary-color-green transition-colors duration-200"
                        style = {{ color: "white" }}
                    >
                        Login
                    </button>

                    <button 
                        onClick={handleSignUpClick} 
                        className = "ml-4 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary-color-light-green hover:bg-primary-color-green transition-colors duration-200"
                        style = {{ color: "white" }}
                    >
                        Sign Up
                    </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default PublicNavBar;