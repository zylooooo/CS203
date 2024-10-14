import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// CSS imports
import "./index.css";

// Administrator imports
import AdministratorLogin from "./administrator/AdministratorLogin";
import AdministratorTools from "./administrator/AdministratorTools";
import AdministratorViewTournaments from "./administrator/AdministratorViewTournaments";
import AdministratorCreateTournaments from "./administrator/AdministratorCreateTournaments";
import AdministratorEditTournaments from "./administrator/AdministratorEditTournaments";

// Component imports
import MainLayout from "./components/MainLayout";

// Public imports
import MainHomepage from "./public/MainHomepage";
import News from "./public/News";
import UserSignUp from "./public/UserSignUp";
import AdminSignUp from "./public/AdminSignUp";

// User imports
import UserHome from "./user/UserHome";
import UserLogin from "./user/UserLogin";
import UserProfile from "./user/UserProfile";
import UserTournaments from "./user/UserTournaments";
import TournamentCardTemplate from "./user/TournamentCardTemplate";
import UserVerify from "./user/UserVerify";
import EditProfileForm from "./user/EditProfileForm";

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
                        path="/auth/sign-up"
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
                                <AdminSignUp />
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
                        path="/user-tournaments"
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
                                    <TournamentCardTemplate />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/user-profile/edit"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <EditProfileForm />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                

                    {/* Protected Admin Routes */}
                    <Route
                        path="/administrator-tools"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorTools />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/administrator-tournaments"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorViewTournaments />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/administrator-create-tournaments"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorCreateTournaments />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />

                    {/* New Route for Editing Tournaments */}
                    <Route
                        path="/administrator-edit-tournaments/:tournamentName" // Updated to include a parameter
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <AdministratorEditTournaments />
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
