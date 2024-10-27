import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainHomePage() {

    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleSignUpClick = () => {
        navigate('/auth/user-signup', { state: { email } }); 
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && email.trim() !== '') {
          handleSignUpClick();
        }
    };


    return (
        <div className="flex flex-col justify-center w-full mt-10">
            <div className='relative'>
                <img
                    src="../src/assets/view-tennis-racket-hitting-ball.jpg"
                    alt="Tennis Racket Hitting Ball"
                    className="w-full max-h-[500px] object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center flex flex-col text-white ">
                    <h1 className="text-6xl font-bold text-center px-4 shadow-text">
                        The best Tennis Matchmaking App
                    </h1>
                    <p className='mt-2 text-xl'>- Serena Williams</p>
                </div>
            </div>
            <div className ="flex flex-col ml-4">
                <h2>What are you waiting for? Sign up now!</h2>
                <div>
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
    );
}
            {/* Advertisement and Quick Sign Up
            <div className = "relative mx-auto mt-10 w-full max-w-7xl flex justify-center items-center">
                <img 
                    src = "../src/assets/homepage-picture.jpg" 
                    alt = "RallyRank Advertisement" 
                    className = "w-[1350px] h-[500px] object-cover rounded-[15px]"
                />
                <div className = "absolute inset-0 flex flex-col items-center justify-center text-center bg-"> 
                    <h2 className = "text-4xl font-bold ml-10" style = {{ color : 'white' }}>
                        The tennis player's favorite app.
                    </h2>
                    <h2 className = "ml-11 mt-1" style = {{ color : 'white' }}> Join RallyRank today. </h2> 
                    
                </div>
            </div> */}
            

            {/* About RallyRank
            <div className = "section-three mt-10 border w-[1350px] h-[800px] mx-auto bg-blue-100 p-5">
                <h2 className = "text-5xl font-bold text-gray-800"> About RallyRank </h2>
                <p className = "mt-4 text-lg text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis rem totam error commodi enim iste nulla fugit, dolores voluptatem cupiditate quasi necessitatibus! Autem suscipit, minima quasi voluptatem commodi nostrum est.
                </p>
            </div> */}


export default MainHomePage;