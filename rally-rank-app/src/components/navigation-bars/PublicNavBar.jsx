// Navigation
import { useNavigate, NavLink } from 'react-router-dom';

function PublicNavBar() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/auth/user-login'); 
    };

    const handleSignUpClick = () => {
        navigate('/auth/user-signup'); 
    };
 
    return (
        <nav className="shadow-md" style = {{ backgroundColor: "#fffcf2" }}>
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
                        <img className="h-10 w-auto" src="/src/assets/Rally-Rank-Logo.svg" alt="RallyRank Logo" />
                        </NavLink>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center" >
                    <button 
                        onClick = {handleLoginClick} 
                        className = "ml-4 px-4 py-2 rounded-xl text-sm font-bold bg-custom-green bg-custom-green-hover transition-colors duration-200"
                        style = {{ color: "white" }}
                    >
                        Login
                    </button>

                    <button 
                        onClick={handleSignUpClick} 
                        className = "ml-4 px-4 py-2 rounded-xl text-sm font-bold text-white bg-custom-green bg-custom-green-hover transition-colors duration-200"
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