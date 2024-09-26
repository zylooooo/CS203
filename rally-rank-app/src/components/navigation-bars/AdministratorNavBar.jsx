import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../authentication/AuthContext";

function AdministratorNavBar() {
    const { isAdminLoggedIn, logoutAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutAdmin();
        navigate("/administrator-login");
    };

    return (
        <nav className="flex justify-around items-center py-10 pl-10 gap-5">
            <img src="src/assets/Rally-Rank-Logo.svg" alt="RallyRank Logo" />
            <div className="flex items-center text-xl gap-5">
                {/* TOURNAMENTS */}
                <NavLink
                    to="/administrator-tournaments"
                    activeClassName="active"
                    className="text-secondary-color-dark-green hover:text-primary-color-green"
                >
                    Tournaments
                </NavLink>

                {/* ADMINISTRATOR TOOLS */}
                <NavLink
                    to="/administrator-tools"
                    activeClassName="active"
                    className="text-secondary-color-dark-green hover:text-primary-color-green"
                >
                    Administrator Tools
                </NavLink>

                {/* Manual Admin Logout */}

                {isAdminLoggedIn ? (
                    <button
                        type="button"
                    className="button bg-red-color font-bold hover:shadow-inner"
                    onClick={handleLogout}
                >
                    Manual Admin Logout
                </button>
                ) : ""}
            </div>
        </nav>
    );
}

export default AdministratorNavBar;