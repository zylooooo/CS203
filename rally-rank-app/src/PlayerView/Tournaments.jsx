import ButtonGroup from "../components/ButtonGroup";

function Tournaments() {
  return (
    <div className = "tournaments-page flex w-full p-9 gap-2 justify-evenly">
        <div className = "row-container flex flex-col w-3/5 gap-8">

            {/* LABELS */}
            <div className = "tournaments-labels">
            <ButtonGroup buttons = {["Upcoming Tournaments", "Past Tournaments", "My Tournaments"]} />
            </div>

            {/* SEARCH BAR */}
            <div className="tournaments-search-bar flex gap-3">

                <input className = "border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type = "text" placeholder="Search tournaments..."></input>


                <button className = "border border-blue-500 text-blue-500 rounded-xl px-4 py-2 hover:bg-blue-500 hover:text-white transition">
                    Search
                </button>

        </div>

            {/* TOURNAMENTS LIST */}
            <div className = "tournaments-list">
                test
            </div>

        </div>

        <div className = "col-container">
                test
        </div>

    </div>

    
    
  );
}

export default Tournaments;


