import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import MainLayout from "./pages/Home/MainLayout";
import Home from "./pages/Home/Home";
import { PlayerLogin, AdminLogin } from "./pages/Home/Login";

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <MainLayout>
                            <PlayerLogin />
                        </MainLayout>
                    }
                />
                <Route
                    path="/login-admin"
                    element={
                        <MainLayout>
                            <AdminLogin />
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
