// Configuration Imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import React, { useState, useEffect } from "react";

// Assets and Components Imports
import AlertMessageWarning from "../components/AlertMessageWarning";
import AdministratorTournamentCard from '../components/AdministratorTournamentCard';
import AdministratorTournamentsButtons from "../components/AdministratorTournamentsButtons";

function AdministratorTournamentHistory() {
    const [tournaments, setTournaments] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [myPastTournaments, setMyPastTournaments] = useState([]);
    const [allPastTournaments, setAllPastTournaments] = useState([]);

    // For Alert Messages
    const [warningMessage, setWarningMessage] = useState("");

    const handleAllClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(allPastTournaments);
        }, 300);
        setIsTransitioning(false);
    };

    const handleMyClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(myPastTournaments);
        }, 300);
        setIsTransitioning(false);
    };

    // -------------------------- API Call: Retrieve all past and completed tournaments ---------------------------
    async function getAllPastTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/all-history`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );
            
            setTournaments(response.data); 
            setAllPastTournaments(response.data);

        } catch (error) {
            setWarningMessage("Unable to fetch all past tournaments. Please reload and try again.");
            setAllPastTournaments([]);
            setTournaments([]); 
        }
    };

    // -------------------------- API Call: Retrieve all past and completed tournaments created by administrator ---------------------------
    async function getMyPastTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/my-history`,
                
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            setMyPastTournaments(response.data);

        } catch (error) {
            setWarningMessage("Unable to fetch your past tournaments. Please reload and try again.");
            console.error('Error fetching available tournaments:', error.response.data.error);
            setMyPastTournaments([]); 
            setTournaments([]); 
        }
    };

    // -------------------------- useEffect() ---------------------------
    useEffect(() => {
        getAllPastTournaments();
        getMyPastTournaments();
    }, []);

    //---------------------------- SEARCH BAR FUNCTIONS ----------------------------------
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTournaments = tournaments.filter(
        (tournament) =>
            tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className = {`tournaments-page flex w-full p-9 gap-2 justify-evenly transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <div className = "row-container flex flex-col w-5/6 p-14 gap-8">
                <AdministratorTournamentsButtons buttons = {["All Past Tournaments", "My Past Tournaments"]} onAllClick = {handleAllClick} onMyClick = {handleMyClick} />
                <div className = "flex flex-col gap-5">
                    <input
                        type = "text"
                        placeholder = "Search by Tournament Name or Admin Name"
                        value = { searchTerm }
                        onChange = { (e) => setSearchTerm(e.target.value) }
                        className = "p-2 border rounded-lg w-full card-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {tournaments.length > 0 ? (
                        <AdministratorTournamentCard tournaments = {filteredTournaments} setIsTransitioning = {setIsTransitioning}/>
                    ) : (
                        <p> No tournaments found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdministratorTournamentHistory;