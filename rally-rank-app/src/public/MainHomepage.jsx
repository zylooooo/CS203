import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainHomePage() {

    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    // const handleLoginClick = () => {
    //     navigate('/login'); 
    // };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleSignUpClick = () => {
        navigate('/sign-up', { state: { email } }); 
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && email.trim() !== '') {
          handleSignUpClick();
        }
    };


    return (
        <div className = "homepage flex flex-col w-full">

            {/* Advertisement and Quick Sign Up */}
            <div className = "relative section-two mx-auto mt-10">
                <img 
                    src = "../src/assets/homepage-picture.jpg" 
                    alt = "RallyRank Advertisement" 
                    className = "w-[1350px] h-[500px] object-cover rounded-[15px]"
                />
                <div className = "absolute top-0 left-0 w-full h-full flex flex-col items-start justify-center pl-4"> 
                    <h2 className = "text-4xl font-bold ml-10" style = {{ color : 'white' }}>
                        The tennis player's favorite app.
                    </h2>
                    <h2 className = "ml-11 mt-1" style = {{ color : 'white' }}> Join RallyRank today. </h2> 
                    <div className ="quick-sign-up flex ml-4">
                        <input
                            type = "text" 
                            onChange = {handleEmailChange} 
                            onKeyDown={handleKeyDown}
                            placeholder = "Enter your email"
                            className = "mt-7 ml-6 rounded-l-[10px] rounded-r-none border border-gray-300 w-[450px] p-3 pl-4 focus:outline-none focus:border-blue-500"
                        />
                        <button
                        className = "mt-7 px-4 py-2 text-white rounded-l-none rounded-r-[10px] border" style = {{ backgroundColor: '#A6A6A6'}}
                        onClick = {handleSignUpClick}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>

            {/* About RallyRank */}
            <div className = "section-three mt-10 border w-[1350px] h-[800px] mx-auto bg-blue-100 p-5">
                <h2 className = "text-5xl font-bold text-gray-800"> About RallyRank </h2>
                <p className = "mt-4 text-lg text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis rem totam error commodi enim iste nulla fugit, dolores voluptatem cupiditate quasi necessitatibus! Autem suscipit, minima quasi voluptatem commodi nostrum est.
                </p>
            </div>
        </div>
    );
}

export default MainHomePage;