import { useLocation } from "react-router-dom";
import defaultProfilePicture from "../assets/default-profile-picture.png";

function OtherUserProfile() {
    const location = useLocation();

    const player = location.state.player;

    return (
        <div className = "profile-page flex flex-col w-3/5 p-9 gap-5 justify-center mx-auto">
            {/* USER PROFILE */}
            <div className = "profile-information flex flex-col items-center w-full m-10 justify-center rounded-lg bg-white">
                <div className = "text-center">
                    <img
                        src = {player.profilePic || defaultProfilePicture}
                        alt = "Profile Picture"
                        className = "w-[250px] h-[250px] rounded-full object-cover border mb-4"
                    />
                    <h1 className = "text-2xl font-bold mb-2" style = {{ color: "#676767" }}>
                        Name: {player.firstName} {player.lastName}
                    </h1>

                    <p className = "mt-1 text-lg font-medium"> Username: {player.username} </p>
                    <p className = "mt-1 text-lg font-medium"> Elo Rating: {player.elo} </p>
                    <p className = "mt-1 text-lg font-medium"> Tournaments Played: {player.participatedTournaments?.length || 0} </p>
                </div>
            </div>

            {/* LIST OF PARTICIPATED MATCHES */}
            <div className = "mt-5 border border-gray-300 rounded-lg shadow-md p-5 bg-white">
                <h2 className = "text-lg font-bold mb-2"> Participated Tournaments: </h2>
                {player.participatedTournaments && player.participatedTournaments.length > 0 ? (
                    <ul className = "list-disc ml-5">
                        {player.participatedTournaments.map((tournament, index) => (
                            <li key = {index}> {tournament} </li>
                        ))}
                    </ul>
                ) : (
                    <p> No participated tournaments available. </p>
                )}
            </div>
        </div>
    );
}

export default OtherUserProfile;