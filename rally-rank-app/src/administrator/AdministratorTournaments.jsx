// Configuration imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Assets and Components Imports
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AlertMessageWarning from '../components/AlertMessageWarning';
import AdministratorTournamentCard from "../components/AdministratorTournamentCard";
import AdministratorTournamentsButtons from "../components/AdministratorTournamentsButtons";

function AdministratorTournaments() {
    const [hovered, setHovered] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");

    //--------------------- ADMINISTRATOR TOURNAMENTS FUNCTIONS --------------------------
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [allTournaments, setAllTournaments] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [thisAdministrator, setThisAdministrator] = useState(null);
    const [myCreatedTournaments, setMyCreatedTournaments] = useState([]);

    const handleAllTournamentsClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(allTournaments);
        }, 300);
        setIsTransitioning(false);
    };

    const handleMyCreatedTournamentsClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setTournaments(myCreatedTournaments);
        }, 300);
        setIsTransitioning(false);
    };

    const handleCreateClick = () => {
        navigate("/administrator-create-tournaments");
    };

    // ----------------------- API Call: Retrieve all tournaments created -----------------------
    async function getAllTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/ongoing`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`,
                    },
                },
            );

            setAllTournaments(response.data);
            setTournaments(response.data);
        } catch (error) {
            setWarningMessage("Unable to retrieve tournaments.");
            console.error('Error fetching available tournaments:', error.response.data.error);
            setAllTournaments([]); 
            setTournaments([]); 
        }
    };

   // ----------------------- API Call: Retrieve all tournaments created by the administrator -----------------------
    async function getMyTournaments() {
        try {
            const adminData = JSON.parse(localStorage.getItem("adminData"));
            if (!adminData || !adminData.jwtToken) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.get(
                `${API_URL}/admins/tournaments/scheduled`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${adminData.jwtToken}`
                    },
                },
            );

            setMyCreatedTournaments(response.data);
            setThisAdministrator(adminData.adminName);

        } catch (error) {
            setWarningMessage("Unable to retrieve your created tournaments.");
            setMyCreatedTournaments([]); 
            setTournaments([]); 
        }
    };

    // ----------------------- useEffect() -----------------------
    useEffect(() => {
        getAllTournaments();
        getMyTournaments();
    }, []);

    //---------------------------- SEARCH BAR FUNCTIONS ----------------------------------
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTournaments = tournaments.filter(
        (tournament) =>
            tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className = {`tournaments-page main-container flex w-full p-9 gap-2 justify-evenly transition-opacity duration-300 ${ isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <AlertMessageWarning message = {warningMessage} onClose = {() => setWarningMessage("")} />
            <div className = "row-container flex flex-col w-5/6 p-14 gap-8">
                {/* LABELS */}
                <AdministratorTournamentsButtons
                    buttons = {["All Tournaments", "My Created Tournaments"]}
                    onAllClick = {handleAllTournamentsClick}
                    onMyClick = {handleMyCreatedTournamentsClick}
                />
                <div className = "flex flex-col">
                    {/* SEARCH BAR */}
                    <input
                        type = "text"
                        placeholder = "Search by Tournament Name or Administrator's Name"
                        value = {searchTerm}
                        onChange = {(e) => setSearchTerm(e.target.value)}
                        className = "p-3 border mb-5 rounded-[16px] w-full card-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* TOURNAMENT LIST */}
                    {tournaments.length > 0 ? (
                        <AdministratorTournamentCard tournaments = {filteredTournaments} setIsTransitioning = {setIsTransitioning} thisAdministrator = {thisAdministrator}/>
                    ) : (
                        <p className = "text-secondary-color-dark-green text-md font-semibold">
                            No tournaments found. Create a new tournament today!
                        </p>
                    )}
                </div>
                {/* CREATE TOURNAMENT BUTTON */}
                <div className = "tournament-actions flex fixed right-14 bottom-16 justify-end cursor-pointer">
                    <button
                        onClick = {handleCreateClick}
                        className = "font-semibold py-2 px-4 rounded-full shadow-md bg-primary-color-light-green text-white hover:shadow-md hover:bg-primary-color-green transition-all duration-300 ease-in-out"
                        onMouseEnter = {() => setHovered(true)}
                        onMouseLeave = {() => setHovered(false)}
                        style = {{
                            width: hovered ? 'auto' : '50px',
                            height: '50px',
                            paddingLeft: hovered ? '12px' : '0',
                            paddingRight: hovered ? '12px' : '0',
                        }}
                    >
                        <span className = {`transition-opacity duration-300 ease-in-out ${hovered ? 'opacity-0' : 'opacity-100'}`}>
                            <FontAwesomeIcon icon = {faPlus} className = "text-2xl mt-1" />
                        </span>
                        <span className = {`mr-6 transition-opacity duration-300 ease-in-out ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                            Create Tournament
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdministratorTournaments;