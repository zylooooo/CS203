import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerLogin from "./pages/Home/Login";
import "./index.css";

function App() {
    return (
        <div className="h-screen flex flex-col justify-center items-center">
            <PlayerLogin />
        </div>
    );
}

export default App;
