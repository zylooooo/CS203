import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdministratorLogin, AdministratorTools, AdministratorTournaments } from "./administrator";
import { MainHomepage, News, SignUp } from "./public";
import { UserHome, UserLogin, UserProfile, UserTournaments } from "./user";
import MainLayout from "./components/MainLayout";
import "./index.css";

function App() {
    return (
        <Router>
            <Routes>

                {/* MainHomepage */}
                <Route 
                    path = "/"
                    element = {
                        <MainLayout isLoggedIn = {-1}>
                            <MainHomepage/>
                        </MainLayout>
                    }
                />

                {/* News */}
                <Route 
                    path = "/news"
                    element = {
                        <MainLayout isLoggedIn = {-1}>
                            <News/>
                        </MainLayout>
                    }
                />

                {/* SignUp */}
                <Route 
                    path = "/sign-up"
                    element = {
                        <MainLayout isLoggedIn = {-1}>
                            <SignUp/>
                        </MainLayout>
                    }
                />

                {/* UserLogin */}
                <Route 
                    path = "/user-login"
                    element = {
                        <MainLayout isLoggedIn = {-1}>
                            <UserLogin/>
                        </MainLayout>
                    }
                />

                {/* AdministratorLogin */}
                <Route 
                    path = "/administrator-login"
                    element = {
                        <MainLayout isLoggedIn = {-1}>
                            <AdministratorLogin/>
                        </MainLayout>
                    }
                />

                {/* UserHome */}
                <Route 
                    path = "/home"
                    element = {
                        <MainLayout isLoggedIn = {0}>
                            <UserHome/>
                        </MainLayout>
                    }
                />

                {/* UserTournaments */}
                <Route 
                    path = "/user-tournaments"  //yes?
                    element = {
                        <MainLayout isLoggedIn = {0}>
                            <UserTournaments/>
                        </MainLayout>
                    }
                />

                {/* UserProfile */}
                <Route 
                    path = "/user-profile"  //yes?
                    element = {
                        <MainLayout isLoggedIn = {0}>
                            <UserProfile/>
                        </MainLayout>
                    }
                />

                {/* AdministratorTools */}
                <Route 
                    path = "/administrator-tools"
                    element = {
                        <MainLayout isLoggedIn = {1}>
                            <AdministratorTools/>
                        </MainLayout>
                    }
                />

                {/* AdministratorTournaments */}
                <Route 
                    path = "/administrator-tournaments"
                    element = {
                        <MainLayout isLoggedIn = {1}>
                            <AdministratorTournaments/>
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;