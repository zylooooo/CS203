import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavBar from '../components/navigation-bars/PublicNavBar';
import tennisVideo from '../assets/tennis.mp4';
import { set } from 'react-hook-form';

function MainHomePage() {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [showNavBar, setShowNavBar] = useState(false); 
    const [showJoin, setShowJoin] = useState(false); 

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

    const handleVideoClick = () => {
        console.log("Click");
        setShowNavBar(true);
        setShowJoin(true);
    };

    useEffect(() => {
        const navBarTimer = setTimeout(() => {
            setShowNavBar(true);
        }, 1500); // Set timeout for 1.5 seconds (1500 milliseconds)

        const joinTimer = setTimeout(() => {
            setShowJoin(true);
        }, 4000); // Set timeout for 4 seconds (4000 milliseconds)

        return () => {
            clearTimeout(navBarTimer); // Cleanup the navbar timeout if the component unmounts
            clearTimeout(joinTimer); // Cleanup the video timeout if the component unmounts
        };
    }, []);

    return (
        <div className="relative w-full h-screen flex flex-col">
            <video className="absolute inset-0 w-full h-full object-cover" onClick={handleVideoClick} autoPlay muted loop>
                <source src={tennisVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="absolute inset-0 z-10 flex items-center justify-center">
                {showNavBar && (
                    <div className = "w-full fixed top-0 bg-cream shadow-md animate-dropDown"><PublicNavBar /></div>
                )}

                {showJoin && (
                <>
                <div className="absolute bottom-10 animate-riseUp flex flex-col items-center mt-12 bg-black bg-opacity-80 px-12 p-5 pb-8 rounded-lg">
                    <h2 className="text-3xl font-bold text-white text-opacity-80 mb-4">
                        Ready to join the community?
                    </h2>
                    <p className="text-white text-opacity-70 mb-6">
                        Sign up now and start matching with tennis players near you!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <input
                            type="text"
                            onChange={handleEmailChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your email"
                            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        shadow-sm"
                        />
                        <button
                            onClick={handleSignUpClick}
                            className="px-6 py-3 bg-primary-color-light-green text-white font-semibold rounded-lg
                                        transform transition-all duration-200
                                        hover:bg-primary-color-green hover:scale-105
                                        focus:outline-none focus:ring-2 focus:ring-primary-color-green focus:ring-offset-2
                                        shadow-lg hover:shadow-xl
                                        disabled:opacity-80 disabled:cursor-not-allowed"
                            disabled={!email.trim()}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
                </>
                )}
            </div>
        </div>
    );
}

            {/*}
            <div className="flex flex-col justify-center w-full mt-10 p-12">
                <div className='relative'>
                    <img
                        src="../src/assets/view-tennis-racket-hitting-ball.jpg"
                        alt="Tennis Racket Hitting Ball"
                        className="w-full max-h-[500px] object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
                    <div className="absolute inset-0 items-center justify-center flex flex-col text-white ">
                        <h1 className="text-6xl font-bold text-center px-4 shadow-text">
                            The best Tennis Matchmaking App
                        </h1>
                        <p className='mt-2 text-xl'>- Serena Williams</p>
                    </div>
                </div>
                

                <div className="flex flex-col items-center mt-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Ready to join the community?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Sign up now and start matching with tennis players near you
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <input
                            type="text"
                            onChange={handleEmailChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your email"
                            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        shadow-sm"
                        />
                        <button
                            onClick={handleSignUpClick}
                            className="px-6 py-3 bg-primary-color-green text-white font-semibold rounded-lg
                                        transform transition-all duration-200
                                        hover:bg-secondary-color-dark-green hover:scale-105
                                        focus:outline-none focus:ring-2 focus:ring-primary-color-green focus:ring-offset-2
                                        shadow-lg hover:shadow-xl
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!email.trim()}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
            */}

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
