// Package Imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// CSS imports
import "./index.css";

// Assets and Component Imports
import MainLayout from "./components/MainLayout";

// Public Imports
// import News from "./public/News";                    --> KIV: To be implemented if time permits.
import MainHomepage from "./public/MainHomepage";

// User Imports
import UserHome from "./user/UserHome";
import UserLogin from "./user/UserLogin";
import UserVerify from "./user/UserVerify";
import UserSignUp from "./user/UserSignUp";
import UserProfile from "./user/UserProfile";
import UserEditProfile from "./user/UserEditProfile";
import UserTournaments from "./user/UserTournaments";
import OtherUserProfile from "./user/OtherUserProfile";
import TournamentDetails from "./user/TournamentDetails";
import UserPastTournaments from "./user/UserPastTournaments";

// Administrator Imports
import Fixtures from "./administrator/Fixtures";
import AdminVerify from "./administrator/AdminVerify";
import AdministratorLogin from "./administrator/AdministratorLogin";
import AdministratorSignup from "./administrator/AdministratorSignup";
import AdministratorTournaments from "./administrator/AdministratorTournaments";
import AdministratorEditTournament from "./administrator/AdministratorEditTournament";
import AdministratorTournamentHistory from "./administrator/AdministratorTournamentHistory";
import AdministratorCreateTournaments from "./administrator/AdministratorCreateTournaments";
import AdministratorTournamentDetails from "./administrator/AdministratorTournamentDetails";
import AdministratorPastTournamentDetails from "./administrator/AdministratorPastTournamentDetails";

// Authentication Imports
import AdminRoute from "./authentication/AdminRoute";
import PrivateRoute from "./authentication/PrivateRoute";
import { AuthProvider } from "./authentication/AuthContext";

// Not Found Imports
import NotFound from "./NotFound";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ---------------------- PUBLIC ROUTES ---------------------- */}
                    {/* MAIN PAGE */}
                    <Route
                        path = "/"
                        element = {
                            <MainLayout>
                                <MainHomepage />
                            </MainLayout>
                        }
                    />

                    {/* NEWS PAGE --> KIV */}
                    {/* <Route
                        path = "/news"
                        element = {
                            <MainLayout>
                                <News />
                            </MainLayout>
                        }
                    /> */}

                    {/* USER SIGNUP PAGE */}
                    <Route
                        path = "/auth/user-signup"
                        element = {
                            <MainLayout>
                                <UserSignUp />
                            </MainLayout>
                        }
                    />

                    {/* ADMINISTRATOR SIGNUP PAGE*/}
                    <Route
                        path = "/administrator-sign-up"
                        element = {
                            <MainLayout>
                                <AdministratorSignup />
                            </MainLayout>
                        }
                    />

                    {/* USER LOGIN PAGE */}
                    <Route
                        path = "/auth/user-login"
                        element = {
                            <MainLayout>
                                <UserLogin />
                            </MainLayout>
                        }
                    />

                    {/* USER VERIFY PAGE */}
                    <Route
                        path = "/auth/user-verify"
                        element = {
                            <MainLayout>
                                <UserVerify />
                            </MainLayout>
                        }
                    />

                    {/* ADMINISTRATOR LOGIN PAGE */}
                    <Route
                        path = "/administrator-login"
                        element = {
                            <MainLayout>
                                <AdministratorLogin />
                            </MainLayout>
                        }
                    />

                    {/* ADMINISTRATOR VERIFY PAGE */}
                    <Route
                        path = "/auth/admin-verify"
                        element = {
                            <MainLayout>
                                <AdminVerify />
                            </MainLayout>
                        }
                    />


                    {/* ---------------------- PROTECTED: PLAYER ROUTES ---------------------- */}
                    {/* USER'S HOME PAGE */}
                    <Route
                        path = "/users/home"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <UserHome />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* USER'S TOURNAMENTS PAGE */}
                    <Route
                        path = "/users/tournaments"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <UserTournaments />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* TOURNAMENT DETAILS */}
                    <Route
                        path = "/tournament-details/:tournamentName"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <TournamentDetails />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* USER'S PAST TOURNAMENTS PAGE */}
                    <Route
                        path = "/past-tournaments"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <UserPastTournaments />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* USER'S PROFILE PAGE */}
                    <Route
                        path = "/user-profile"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <UserProfile />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* EDIT PROFILE PAGE */}
                    <Route
                        path = "/user-profile/edit"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <UserEditProfile />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* OTHER USER'S PROFILE PAGE */}
                    <Route
                        path = "/user-profile/1"
                        element = {
                            <PrivateRoute>
                                <MainLayout>
                                    <OtherUserProfile />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* ---------------------- PROTECTED: ADMINISTRATOR ROUTES ---------------------- */}
                    {/* ADMINISTRATOR'S TOURNAMENT PAGE */}
                    <Route
                        path = "/administrator-tournaments"
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTournaments />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* ADMINISTRATOR'S (ALL) TOURNAMENT HISTORY PAGE */}
                    <Route
                        path = "/administrator-tournament-history"
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTournamentHistory />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* ADMINISTRATOR'S (CREATED) PAST TOURNAMENTS PAGE */}
                    <Route
                        path = "/administrator-past-tournament-details"
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorPastTournamentDetails />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* ADMINISTRATOR'S CREATE TOURNAMENTS PAGE */}
                    <Route
                        path = "/administrator-create-tournaments"
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorCreateTournaments />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* TOURNAMENT DETAILS */}
                    <Route
                        path = "/administrator/tournament-details/:tournamentName"
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTournamentDetails />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* EDIT TOURNAMENTS CREATED */}
                    <Route
                        path = "/administrator-edit-tournaments" 
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorEditTournament />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* VIEW FIXTURES */}
                    <Route
                        path = "/administrator-tournament-fixtures" 
                        element = {
                            <AdminRoute>
                                <MainLayout>
                                    <Fixtures />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* FALLBACK ROUTE */}
                    <Route
                        path = "*"
                        element = {
                            <MainLayout>
                                <NotFound />
                            </MainLayout>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;