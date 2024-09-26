import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// CSS imports 
import "./index.css";

// Administrator imports
import AdministratorLogin from "./administrator/AdministratorLogin";
import AdministratorTools from "./administrator/AdministratorTools";
import AdministratorViewTournaments from "./administrator/AdministratorViewTournaments";
import AdministratorCreateTournaments from "./administrator/AdministratorCreateTournaments";

// Public imports
import { MainHomepage, News, SignUp } from "./public/PublicIndex";
import MainLayout from "./components/MainLayout";

// User imports
import { UserHome, UserLogin, UserProfile, UserTournaments } from "./user/UserIndex";

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
                        path = "/"
                        element = {
                            <MainLayout>
                                <MainHomepage/>
                            </MainLayout>
                        }
                    />

                    {/* News */}
                    <Route 
                        path = "/news"
                        element = {
                            <MainLayout>
                                <News/>
                            </MainLayout>
                        }
                    />

                    {/* SignUp */}
                    <Route 
                        path = "/sign-up"
                        element = {
                            <MainLayout>
                                <SignUp/>
                            </MainLayout>
                        }
                    />

                    {/* UserLogin */}
                    <Route 
                        path = "/user-login"
                        element = {
                            <MainLayout>
                                <UserLogin/>
                            </MainLayout>
                        }
                    />

                    {/* AdministratorLogin */}
                    <Route 
                        path = "/administrator-login"
                        element = {
                            <MainLayout>
                                <AdministratorLogin/>
                            </MainLayout>
                        }
                    />

                    {/* Protected Player Routes */}
                    <Route
                        path="/home"
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