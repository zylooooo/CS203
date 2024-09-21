import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import MainLayout from "./components/MainLayout";
import AdminLogin from "./AdminView/Login";
import News from "./PublicView/News";
import { Home, PlayerLogin, SignUp, Tournaments, Profile } from "./PlayerView";
import HomePage from "./PublicView/HomePage"; // Adjust the path as necessary


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
        <Route
          path="/tournaments"
          element={
            <MainLayout>
              <Tournaments />
            </MainLayout>
          }
        />
        <Route
          path="/RallyRank"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/your-profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
