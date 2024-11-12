// Configuration Imports
import { API_URL } from '../../config';

// Package Imports
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Assets and Components Imports
import UserTournamentCard from '../components/UserTournamentCard';
import UserTournamentButtons from "../components/UserTournamentButtons";

function UserTournaments() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("currUrl", location.pathname);
    }, []);

    // ------------------------------------- Tournament Functions -------------------------------------
    const [loading, setLoading] = useState(true);
    const { tab } = useParams();
    const [activeButton, setActiveButton] = useState(parseInt(localStorage.getItem("userActiveTab")) || 0);
    const [availableTournaments, setAvailableTournaments] = useState([]);
    const [displayTournamentType, setDisplayTournamentType] = useState([]);
    const [myScheduledTournaments, setMyScheduledTournaments] = useState([]);

    const handleAvailableTournamentClick = () => {
        navigate(`/users/Tournaments/${0}`);
        setActiveButton(0);
        getAvailableTournaments();
    };

    const handleMyScheduledTournamentsClick = () => {
        navigate(`/users/Tournaments/${1}`);
        setActiveButton(1);
        getMyScheduledTournaments();
        setDisplayTournamentType(myScheduledTournaments)
    };

    // ------------------------------------- API Call: Retrieiving available tournaments -------------------------------------
    async function getAvailableTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
                `${API_URL}/users/tournaments/available`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            setAvailableTournaments(response.data);
            setDisplayTournamentType(response.data);
        } catch (error) {
            console.error("Error fetching available tournaments: ", error);
            setAvailableTournaments([]);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------- API Call: Retrieiving user's scheduled tournaments (ongoing and upcoming) -------------------------------------
    async function getMyScheduledTournaments() {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.jwtToken) {
                console.error("No JWT Token found!");
                return;
            }
            const response = await axios.get(
                `${API_URL}/users/tournaments/scheduled`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.jwtToken}`
                    }
                }
            );
            setMyScheduledTournaments(response.data);
            setDisplayTournamentType(response.data);
        } catch (error) {
            console.error("Error fetching user's scheduled tournaments: ", error);
            setMyScheduledTournaments([]);
            setDisplayTournamentType([]);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------- useEffect() -------------------------------------
    useEffect(() => {
        getAvailableTournaments();
    }, []);

    //---------------------------- SEARCH BAR FUNCTIONS ----------------------------------
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTournaments = displayTournamentType.filter(
        (tournament) =>
            tournament.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className = "flex flex-col p-10 items-center justify-center w-4/5">
            <div className = "flex flex-col w-4/5 gap-8 mt-5">
                <UserTournamentButtons
                    buttons = {["Available Tournaments", "My Scheduled Tournaments"]}
                    onAvailableTournamentsClick = {handleAvailableTournamentClick}
                    onMyScheduledTournamentsClick = {handleMyScheduledTournamentsClick}
                />
                {/* SEARCH BAR */}
                <input
                    type = "text"
                    placeholder = "Search for tournaments..."
                    value = {searchTerm}
                    onChange = { (e) => setSearchTerm(e.target.value) }
                    className = "p-3 border mb-5 rounded-[16px] w-full card-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {loading ? (
                    <p> Loading tournaments... </p>
                ) : displayTournamentType.length > 0 ? (
                    <UserTournamentCard
                        tournamentType = {filteredTournaments}
                        isAvailableTournament = {activeButton === 0}
                        isScheduledTournament = {activeButton === 1}
                    />
                ) : (
                    <p> No tournaments found. </p>
                )}
            </div>
        </div>
    );
};

export default UserTournaments;