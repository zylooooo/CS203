function Home() {
  return (
    <div className="home-container flex w-full p-9 gap-2 justify-evenly">
      <div className="row-container flex flex-col w-3/5 gap-8">
        <div>
          <h2 className="A">Your Scheduled Tournaments</h2>
          <button className="join-button px-4 py-2 border border-gray-300 text-sm whitespace-nowrap w-full min-height-300px">
            join tournamnet
          </button>
        </div>

        <div>
          <h2 className="A"> Join a tournament today! </h2>
          <button className="join-button px-4 py-2 border border-gray-300 text-sm whitespace-nowrap w-full min-height-300px">
            join tournamnet
          </button>
        </div>
      </div>
      <div className="column-container gap-5">
        <h2 className="A">Tournament Leaderboard</h2>
        <div className="switch-ranking flex gap-8">
          <button>Top</button>
          <button>You</button>
        </div>
        <button className="join-button px-4 py-2 border border-gray-300 text-sm whitespace-nowrap w-full min-height-600px min-w-72">
          leaderboard
        </button>
      </div>
    </div>
  );
}

export default Home;
