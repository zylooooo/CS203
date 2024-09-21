import { NavLink } from "react-router-dom";

function AdminNavBar() {
    return (
        <nav className = "flex items-center py-10 pl-10 gap-5">

            <img src = "src/assets/Logo.svg" alt = "RallyRank-Logo"/>

            <div className = "flex text-xl gap-5">

                {/* TOURNAMENTS */}
                <NavLink
                    to = "/admin-tournaments"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green hover:underline"}
                >
                    Tournaments
                </NavLink>

                {/* ADMIN TOOLS */}
                <NavLink
                    to = "/admin-tools"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green"}
                >
                    Admin Tools
                </NavLink>
            </div>
        </nav>
    );
}

export default AdminNavBar;