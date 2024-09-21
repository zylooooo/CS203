import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import MainLayout from "./components/MainLayout";
import AdminLogin from "./AdminView/Login";
import News from "./PublicView/News";
import { Home, PlayerLogin, SignUp, Tournaments, Profile } from "./PlayerView";
import HomePage from "./PublicView/HomePage"; // Adjust the path as necessary
import AdminTools from "./AdminView/AdminTools"; // Adjust the path as necessary
import AdminTournaments from "./AdminView/Tournaments";


function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout isLoggedIn = {0}>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout isLoggedIn = {-1}>
              <PlayerLogin />
            </MainLayout>
          }
        />
        <Route
          path="/login-admin"
          element={
            <MainLayout isLoggedIn = {1}>
              <AdminLogin />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout isLoggedIn = {-1}>
              <SignUp />
            </MainLayout>
          }
        />
        <Route
          path="/News"
          element={
            <MainLayout isLoggedIn = {0}>
              <News />
            </MainLayout>
          }
        />
        <Route
          path="/tournaments"
          element={
            <MainLayout isLoggedIn = {0}>
              <Tournaments />
            </MainLayout>
          }
        />
        <Route
          path="/RallyRank"
          element={
            <MainLayout isLoggedIn = {-1}>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/your-profile"
          element={
            <MainLayout isLoggedIn = {0}>
              <Profile />
            </MainLayout>
          }
        />
         <Route
          path="/admin-tournaments"
          element={
            <MainLayout isLoggedIn = {1}>
              <AdminTournaments /> 
            </MainLayout>
          }
        />
         <Route
          path="/admin-tools"
          element={
            <MainLayout isLoggedIn = {1}>
              <AdminTools />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
