function Home() {
  return (
    <div className="home-container flex w-full p-9 gap-8 justify-around">
      <div className="row-container flex flex-col w-9/12 gap-8">
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
      <div className="column-container">
        <h2 className="A">Tournament Leaderboard</h2>
      </div>
    </div>
  );
}

export default Home;
