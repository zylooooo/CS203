import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Component: Tournament Details Card (for AdministratorTournaments)
const AdministratorTournamentDetails = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const fromPage = location.state?.from || "/administrator-tournaments"; // to retrieve page where admins clicked for tournament details

  const { tournamentName } = useParams();

  const [tournamentDetails, setTournamentDetails] = useState(null);

  const handleBackButtonClick = () => {
    navigate(fromPage);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.toLocaleString("en-US", { day: "2-digit" });
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.toLocaleString("en-US", { year: "numeric" });

    return `${day} ${month} ${year}`;
  };

  const checkThisAdmin = (adminName) => {
    return adminName === thisAdministrator;
  };

  const [thisAdministrator, setThisAdministrator] = useState("");

  // API Call: Retrieve tournament details by tournament name
  async function getTournamentByName() {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/admins/tournaments/${tournamentName}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );

      setThisAdministrator(adminData.adminName);

      if (response.status === 200) {
        setTournamentDetails(response.data);
      }
    } catch (error) {
      // WIP: EDIT DISPLAY ERROR MESSAGE
      alert(error.response.data);
      console.error("Error fetching tournament:", error.response.data.error);
      setTournamentDetails({});
    }
  }

  useEffect(() => {
    getTournamentByName(tournamentName);
  }, []);

  if (!tournamentDetails) {
    return (
      <p className="font-semibold text-lg mt-10">
        {" "}
        Loading tournament details...{" "}
      </p>
    );
  }

  // API Call: Generate Brackets
  async function generateBrackets() {
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData"));
      if (!adminData || !adminData.jwtToken) {
        console.error("No JWT token found");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/admins/tournaments/bracket/${tournamentName}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${adminData.jwtToken}`,
          },
        }
      );
      console.log(response.data);
      if (response.data.error) {
        alert(response.data.error);
      } else {
        alert("Brackets generated successfully! View the fixtures below.");
      }
      console.log("WORKS");
      return response.data;

    } catch (error) {
      // WIP: EDIT DISPLAY ERROR MESSAGE
      console.log("NO");
      console.error("Error generating brackets:", error.response.data.error);
    }
  }

  const handleGenerateBracketsClick = async () => {
    await generateBrackets(); // Wait for generateBrackets to complete
  };

  const handleShowFixturesClick = () => {
    navigate("/administrator-tournament-fixtures", { state: { tournamentName } });
  };

  return (
    <div className="tournament-card-template main-container flex">
      <div className="flex flex-col w-3/5 gap-4 border p-10 rounded-[8px] card-background shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faArrowLeft}
              onClick={handleBackButtonClick}
              className="back-icon cursor-pointer text-xl"
            />
            <h1 className="text-2xl font-bold mb-2 mt-1">
              {" "}
              {tournamentDetails.tournamentName}{" "}
            </h1>
          </div>
        </div>
        <p className="mb-2 text-lg">
          {" "}
          <strong> Date: </strong> {formatDate(tournamentDetails.startDate)}{" "}
        </p>
        <p className="mb-2 text-lg">
          {" "}
          <strong> Organiser: </strong> {tournamentDetails.createdBy}{" "}
        </p>
        <p className="mb-2 text-lg">
          {" "}
          <strong> Elo Rating Criteria: </strong> {tournamentDetails.minElo} to{" "}
          {tournamentDetails.maxElo}{" "}
        </p>
        <p className="mb-2 text-lg">
          {" "}
          <strong> Game Category: </strong> {tournamentDetails.category}{" "}
        </p>
        <p className="mb-2 text-lg">
          {" "}
          <strong> Gender: </strong> {tournamentDetails.gender}{" "}
        </p>
        <p className="mb-2 text-lg">
          {" "}
          <strong> Player Capacity: </strong> {tournamentDetails.playerCapacity}{" "}
        </p>
        {tournamentDetails.remarks && (
          <p className="mb-2 text-lg">
            {" "}
            <strong> Remarks: </strong> {tournamentDetails.remarks}{" "}
          </p>
        )}
        <p className="mb-2 text-lg">
          {tournamentDetails.playerCapacity -
            tournamentDetails.playersPool.length >
          0 ? (
            <span>
              <strong> Slots Available: </strong>{" "}
              {tournamentDetails.playerCapacity -
                tournamentDetails.playersPool.length}{" "}
            </span>
          ) : (
            <span>
              <strong> Slots are full!</strong>
            </span>
          )}
        </p>

        <p className="mb-2 text-lg">
          {" "}
          <strong> Venue: </strong> {tournamentDetails.location}{" "}
        </p>
        {/* <div className = "map-api-container h-64 border rounded-[8px]">
                    <p className = "text-center p-4"> Insert map here. </p>
                </div> */}

        <div className="flex justify-between items-start mt-4">
          <div className="players-list mt-4 p-4 border rounded-[8px] w-2/3 relative">
            <h2 className="text-xl font-semibold mb-2"> Current Players: </h2>
            <div
              style={{
                height: "1px",
                backgroundColor: "#DDDDDD",
                margin: "10px 0",
              }}
            />
            <p
              style={{
                color:
                  tournamentDetails.playerCapacity -
                    tournamentDetails.playersPool.length <=
                  10
                    ? "red"
                    : "black",
                fontWeight:
                  tournamentDetails.playerCapacity -
                    tournamentDetails.playersPool.length <=
                  10
                    ? 700
                    : "normal",
              }}
              className="text-md text-gray-500 absolute top-4 right-4 font-semibold"
            >
              {tournamentDetails.playerCapacity -
                tournamentDetails.playersPool.length >
              0
                ? `Slots left: ${
                    tournamentDetails.playerCapacity -
                    tournamentDetails.playersPool.length
                  }`
                : "Slots are full!"}
            </p>
            {tournamentDetails.playersPool &&
            tournamentDetails.playersPool.length > 0 ? (
              <ol className="list-decimal pl-5">
                {tournamentDetails.playersPool.map((player, index) => (
                  <li key={index} className="mt-5 mb-5">
                    {" "}
                    {player}{" "}
                  </li>
                ))}
              </ol>
            ) : (
              <p> No players have joined this tournament yet. </p>
            )}
          </div>

          <div className="flex flex-col gap-4 ml-2 self-start mt-4 mr-6">
            {checkThisAdmin(tournamentDetails.createdBy) && (
            <button
              onClick={handleGenerateBracketsClick}
              className="bg-primary-color-light-green hover:bg-primary-color-green text-white border px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
            >
              Generate Brackets
            </button>
            )}
            <button
              onClick={handleShowFixturesClick}
              className="bg-primary-color-light-green hover:bg-primary-color-green text-white border px-4 py-2 rounded-[8px] font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
            >
              Show Fixtures
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministratorTournamentDetails;
