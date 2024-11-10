import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect} from "react";

// Component: Tournament Card (for UserTournaments)
const TournamentCard = ({ userPastTournaments }) => {

    useEffect(() => {   
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    const navigate = useNavigate();

    const handleTournamentCardClick = (tournament) => {
        navigate(`/tournament-details/${tournament.tournamentName}`, {
            state: {
                ...tournament,
                isPastTournament: true
            }
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
    
        const day = date.toLocaleString('en-US', { day: '2-digit' });
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.toLocaleString('en-US', { year: 'numeric' });

        return `${day} ${month} ${year}`;
    };

    return (
        <div className = "flex flex-col gap-5 w-full">
            {userPastTournaments.map((tournament, index) => (
                <div
                    key = {index}
                    className = "flex border rounded-xl p-4 card-background shadow-md cursor-pointer hover:shadow-lg transition w-full"
                    onClick = {() => handleTournamentCardClick(tournament)}
                >
                    <div className = "flex-1 pr-4">
                        <h3 className = "text-xl font-bold mb-2"> {tournament.tournamentName} </h3>
                        <div className = "flex items-center mb-2">
                            <p> Organiser: {tournament.createdBy} </p>
                        </div>
                        <p className = "mb-2"> Date: {formatDate(tournament.startDate)} to {formatDate(tournament.endDate)} </p>
                        <p className = "mb-2"> Elo Rating Criteria: {tournament.minElo} to {tournament.maxElo} </p>
                        <p className = "mb-2"> Game: {tournament.category} </p>
                        <p className = "mb-2"> Gender: {tournament.gender} </p>
                        
                    </div>

                    <div className = "card-section-two border-l pl-4 flex-none w-1/3 relative">
                        <p className = "font-semibold mb-2"> Venue: {tournament.location} </p>
                        {tournament.remarks && (
                            <>
                                <p className = "font-semibold mt-2"> Remarks: </p>
                                <p className = "mb-2"> {tournament.remarks} </p>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

function UserPastTournaments() {

    // ------------------------------------- Past Tournament Functions -------------------------------------
    const [pastTournaments, setPastTournaments] = useState([]);

    const [loading, setLoading] = useState(true);

    const handlePastTournamentsClick = () => {
        getPastTournaments();
    }

    // ------------------------------------- API Call: Retrieiving user's past tournaments -------------------------------------
    async function getPastTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/users/tournaments/history",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            
            setPastTournaments(response.data);
        } catch (error) {
            console.error("Error fetching available tournaments: ", error);
            setPastTournaments([]);
        } finally {
            setLoading(false);
        }
    }


    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getPastTournaments();
    }, []);

    //---------------------------- SEARCH BAR FUNCTIONS ----------------------------------
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTournaments = pastTournaments.filter(
        (tournament) =>
            tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //------------------------------------------------------------------------------------

    return (
        <div className = "flex flex-col p-10 items-center justify-center w-4/5">
            <div className = "flex flex-col w-4/5 gap-8">
                {/* SEARCH BAR */}
                <input
                    type = "text"
                    placeholder = "Search for tournaments..."
                    value = { searchTerm }
                    onChange = { (e) => setSearchTerm(e.target.value) }
                    className = "border rounded-xl mt-5 p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {loading ? (
                    <p> Loading tournaments... </p>
                    ) : pastTournaments.length > 0 ? (
                    <TournamentCard userPastTournaments = {filteredTournaments} />
                    ) : (
                    <p> No tournaments found. </p>
                )}
            </div>
        </div>
    );
}

export default UserPastTournaments;