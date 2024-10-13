import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../authentication/AuthContext";

function UserNavBar() {
    const {isUserLoggedIn, logoutUser} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/auth/user-login");
    };

    return (
        <nav className="flex justify-around py-10 pl-10 gap-5">
            <img src="src/assets/Rally-Rank-Logo.svg" alt="RallyRank Logo" />
            <div className="flex items-center text-xl gap-5">
                <NavLink
                    to="/users/home"
                    activeClassName="active"
                    className="text-secondary-color-dark-green hover:text-primary-color-green"
                    exact
                >
                    Home
                </NavLink>
                <NavLink
                    to="/user-tournaments"
                    activeClassName="active"
                    className="text-secondary-color-dark-green hover:text-primary-color-green"
                >
                    Tournaments
                </NavLink>
                <NavLink
                    to="/news"
                    activeClassName="active"
                    className="text-secondary-color-dark-green hover:text-primary-color-green"
                >
                    News
                </NavLink>
                <NavLink
                    to="/user-profile"
                    activeClassName="active"
                    className="text-secondary-color-dark-green hover:text-primary-color-green"
                >
                    Your Profile
                </NavLink>
                <button
                    type="button"
                    className="button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default UserNavBar;