import { NavLink } from "react-router-dom";

function AdministratorNavBar() {
    return (
        <nav className = "flex items-center py-10 pl-10 gap-5">

            <img src = "src/assets/Rally-Rank-Logo.svg" alt = "RallyRank Logo"/>

            <div className = "flex text-xl gap-5">

                {/* TOURNAMENTS */}
                <NavLink
                    to = "/administrator-tournaments"
                        activeClassName = "active"
                        className = {"text-secondary-color-dark-green hover:text-primary-color-green hover:underline"}
                >
                    Tournaments
                </NavLink>

                {/* ADMINISTRATOR TOOLS */}
                <NavLink
                    to = "/administrator-tools"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green"}
                >
                    Administrator Tools
                </NavLink>
            </div>
        </nav>
    );
}

export default AdministratorNavBar;