import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdministratorLogin, AdministratorTools, AdministratorTournaments } from "./administrator/AdministratorIndex";
import { MainHomepage, News, SignUp } from "./public/PublicIndex";
import { UserHome, UserLogin, UserProfile, UserTournaments } from "./user/UserIndex";
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

                {/* UserHome */}
                <Route 
                    path = "/home"
                    element = {
                        <MainLayout>
                            <UserHome/>
                        </MainLayout>
                    }
                />

                {/* UserTournaments */}
                <Route 
                    path = "/user-tournaments"  //yes?
                    element = {
                        <MainLayout>
                            <UserTournaments/>
                        </MainLayout>
                    }
                />

                {/* UserProfile */}
                <Route 
                    path = "/user-profile"  //yes?
                    element = {
                        <MainLayout>
                            <UserProfile/>
                        </MainLayout>
                    }
                />

                {/* AdministratorTools */}
                <Route 
                    path = "/administrator-tools"
                    element = {
                        <MainLayout>
                            <AdministratorTools/>
                        </MainLayout>
                    }
                />

                {/* AdministratorTournaments */}
                <Route 
                    path = "/administrator-tournaments"
                    element = {
                        <MainLayout>
                            <AdministratorTournaments/>
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;