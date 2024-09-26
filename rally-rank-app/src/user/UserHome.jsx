import ButtonGroup from "../components/ButtonGroup";

function UserHome() {
  return (
    <div className = "home-container flex w-full p-9 gap-2 justify-evenly">

      {/* ROW CONTAINER: SCHEDULED TOURNAMENTS AND JOIN TOURNAMENTS */}
      <div className = "row-container flex flex-col w-3/5 gap-8">
      
        {/* SCHEDULED TOURNAMENTS CONTAINER */}
        <div className = "scheduled-tournaments-container">
          <h2 className = "mb-2"> Your Scheduled Tournaments </h2>
          <div className = "p-4 bg-blue-500 text-white rounded shadow-lg border">
            You have no scheduled tournaments. Join a tournament today!
          </div>
        </div>

        {/* JOIN TOURNAMENTS CONTAINER */}
        <div className = "join-tournament-container">
          <h2 className = "mb-2"> Join a tournament today! </h2>
          <button className = "join-button px-4 py-2 border border-gray-300 text-sm whitespace-nowrap w-full min-height-300px">
            Join tournament!
          </button>
        </div>
      </div>

      {/* COLUMN CONTAINER: LEADERBOARD CONTAINER */}
      <div className = "col-container gap-8">
        <div className = "leaderboard container">
          <h2> Tournament Leaderboard </h2>
          <div className = "leaderboard-switch-view-container flex gap-10 mb-2">
            <ButtonGroup buttons={["Top", "You"]} />
          </div>
          <div className = "leaderboard-box bg-gray-100 border border-gray-300 text-sm text-center w-full h-72 min-w-72 flex items-center justify-center min-height-500px">
            Add leaderboard rankings here
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome;