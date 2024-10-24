import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// CSS imports
import "./index.css";

// Administrator imports
import AdministratorSignup from "./administrator/AdministratorSignup";
import AdminVerify from "./administrator/AdminVerify";
import AdministratorLogin from "./administrator/AdministratorLogin";
import AdministratorTournaments from "./administrator/AdministratorTournaments";
import CreateTournaments from "./administrator/CreateTournaments";
import AdministratorEditTournament from "./administrator/AdministratorEditTournament";
import AdministratorTournamentDetails from "./administrator/AdministratorTournamentDetails";
import AdministratorTournamentHistory from "./administrator/AdministratorTournamentHistory";
import AdministratorPastTournamentDetails from "./administrator/AdministratorPastTournamentDetails";

// Component imports
import MainLayout from "./components/MainLayout";

// Public imports
import MainHomepage from "./public/MainHomepage";
import News from "./public/News";

// User imports
import UserHome from "./user/UserHome";
import UserSignUp from "./user/UserSignUp";
import UserLogin from "./user/UserLogin";
import UserProfile from "./user/UserProfile";
import UserTournaments from "./user/UserTournaments";
import TournamentDetails from "./user/TournamentDetails";
import UserVerify from "./user/UserVerify";
import UserEditProfile from "./user/UserEditProfile";
import OtherUserProfile from "./user/OtherUserProfile";
import UserPastTournaments from "./user/UserPastTournaments";

// Authentication imports
import { AuthProvider } from "./authentication/AuthContext";
import PrivateRoute from "./authentication/PrivateRoute";
import AdminRoute from "./authentication/AdminRoute";

// NotFound import
import NotFound from "./NotFound";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    {/* MainHomepage */}
                    <Route
                        path="/"
                        element={
                            <MainLayout>
                                <MainHomepage />
                            </MainLayout>
                        }
                    />

                    {/* News */}
                    <Route
                        path="/news"
                        element={
                            <MainLayout>
                                <News />
                            </MainLayout>
                        }
                    />

                    {/* User SignUp */}
                    <Route
                        path="/auth/user-signup"
                        element={
                            <MainLayout>
                                <UserSignUp />
                            </MainLayout>
                        }
                    />

                    {/* Admin SignUp */}
                    <Route
                        path="/administrator-sign-up"
                        element={
                            <MainLayout>
                                <AdministratorSignup />
                            </MainLayout>
                        }
                    />

                    {/* UserLogin */}
                    <Route
                        path="/auth/user-login"
                        element={
                            <MainLayout>
                                <UserLogin />
                            </MainLayout>
                        }
                    />

                    {/* UserVerify */}
                    <Route
                        path="/auth/user-verify"
                        element={
                            <MainLayout>
                                <UserVerify />
                            </MainLayout>
                        }
                    />

                    {/* AdministratorLogin */}
                    <Route
                        path="/administrator-login"
                        element={
                            <MainLayout>
                                <AdministratorLogin />
                            </MainLayout>
                        }
                    />

                    {/* AdminVerify */}
                    <Route
                        path="/auth/admin-verify"
                        element={
                            <MainLayout>
                                <AdminVerify />
                            </MainLayout>
                        }
                    />


                    {/* Protected Player Routes */}
                    <Route
                        path="/users/home"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <UserHome />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/users/tournaments"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <UserTournaments />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/user-profile"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <UserProfile />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/tournament-details"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <TournamentDetails />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/user-profile/edit"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <UserEditProfile />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/other-user-profile"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <OtherUserProfile />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/past-tournaments"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <UserPastTournaments />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/administrator-tournament-history"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTournamentHistory />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/administrator-past-tournament-details"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorPastTournamentDetails />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/administrator-tournaments"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTournaments />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/administrator-create-tournaments"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <CreateTournaments />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/administrator-tournament-details"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTournamentDetails />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* New Route for Editing Tournaments */}
                    <Route
                        path="/administrator-edit-tournaments" 
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorEditTournament />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* Fallback Route */}
                    <Route
                        path="*"
                        element={
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
