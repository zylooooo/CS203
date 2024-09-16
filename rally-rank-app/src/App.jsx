import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import MainLayout from "./pages/MainLayout";
import Home from "./pages/Home";
import { PlayerLogin, AdminLogin } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { News } from "./pages/News";

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
                <Route
                    path="/signup"
                    element={
                        <MainLayout>
                            <SignUp />
                        </MainLayout>
                    }
                />
                <Route
                    path="/News"
                    element={
                        <MainLayout>
                            <News />
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
