// import { NavLink } from "react-router-dom";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PublicNavBar() {

    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/user-login'); 
    };

    // const handleEmailChange = (e) => {
    //     setEmail(e.target.value);
    // }

    const handleSignUpClick = () => {
        navigate('/sign-up', { state: { email } }); 
    };
    
    return (
        <nav className = "flex items-center py-10 pl-10 gap-5">

            <img src = "src/assets/Rally-Rank-Logo.svg" alt = "RallyRank Logo"/>

            <div className = "section-one absolute top-7 right-0 m-5 space-x-5">

            {/* Login Button */}
            <button
                onClick = {handleLoginClick} 
                className = "login-button bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-md transition duration-300 ease-in-out">
                    Login
            </button>

            {/* Sign Up Button */}
            <button 
                onClick = {handleSignUpClick}
                className = "sign-up-button bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 shadow-md transition duration-300 ease-in-out">
                    Sign Up
            </button>
            </div>
        </nav>
    );
}

export default PublicNavBar;