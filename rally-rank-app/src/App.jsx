import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
    AdministratorLogin,
    AdministratorTools,
    AdministratorTournaments,
    AdministratorCreateTournaments,
} from "./administrator/AdministratorIndex";
import { MainHomepage, News, SignUp } from "./public/PublicIndex";
import {
    UserHome,
    UserLogin,
    UserProfile,
    UserTournaments,
} from "./user/UserIndex";
import MainLayout from "./components/MainLayout";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import { AuthProvider } from "./auth/AuthContext"; // Import AuthProvider
import "./index.css";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <MainLayout>
                                <MainHomepage />
                            </MainLayout>
                        }
                    />

                    <Route
                        path="/news"
                        element={
                            <MainLayout>
                                <News />
                            </MainLayout>
                        }
                    />

                    <Route
                        path="/sign-up"
                        element={
                            <MainLayout>
                                <SignUp />
                            </MainLayout>
                        }
                    />

                    <Route
                        path="/user-login"
                        element={
                            <MainLayout>
                                <UserLogin />
                            </MainLayout>
                        }
                    />

                    <Route
                        path="/administrator-login"
                        element={
                            <MainLayout>
                                <AdministratorLogin />
                            </MainLayout>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/home"
                        element={
                            <PrivateRoute
                                element={
                                    <MainLayout>
                                        <UserHome />
                                    </MainLayout>
                                }
                            />
                        }
                    />

                    <Route
                        path="/user-tournaments"
                        element={
                            <PrivateRoute
                                element={
                                    <MainLayout>
                                        <UserTournaments />
                                    </MainLayout>
                                }
                            />
                        }
                    />

                    <Route
                        path="/user-profile"
                        element={
                            <PrivateRoute
                                element={
                                    <MainLayout>
                                        <UserProfile />
                                    </MainLayout>
                                }
                            />
                        }
                    />

                    <Route
                        path="/administrator-tools"
                        element={
                            <PrivateRoute
                                element={
                                    <MainLayout>
                                        <AdministratorTools />
                                    </MainLayout>
                                }
                            />
                        }
                    />

                    <Route
                        path="/administrator-tournaments"
                        element={
                            <PrivateRoute
                                element={
                                    <MainLayout>
                                        <AdministratorTournaments />
                                    </MainLayout>
                                }
                            />
                        }
                    />

                    <Route
                        path="/administrator-create-tournaments"
                        element={
                            <PrivateRoute
                                element={
                                    <MainLayout>
                                        <AdministratorCreateTournaments />
                                    </MainLayout>
                                }
                            />
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
