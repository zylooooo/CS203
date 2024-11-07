// Package Imports
import { Link } from "react-router-dom";

// Assets and Components Import
import RallyRankLogo from "./assets/Rally-Rank-Logo.svg";
import RobotSleeping from "./assets/robot-not-found.png";

const NotFound = () => {
    return (
        <div className = "relative h-main">
            <img 
                src = {RallyRankLogo} 
                alt = "rally rank logo" 
                className = "absolute top-0 left-1/2 transform -translate-x-1/2 h-[80px] mt-6"
            />
            <div className = "flex flex-col items-center justify-center h-full space-y-4">
                <img 
                    src = {RobotSleeping} 
                    alt = "rally rank logo" 
                    className = "h-[300px]"
                />
                <h1 className = "text-4xl font-bold"> Error: 404 - Page Not Found </h1>
                <p className = "text-md font-semibold"> This is awkward... The page you're looking for is not here. </p>
                <p className = "text-md font-semibold">
                    Click <Link to = "/" className = "hover:underline font-semibold"> here </Link> to be redirected to RallyRank.
                </p>
            </div>
        </div>
    );
};

export default NotFound;