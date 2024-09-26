import { NavLink } from "react-router-dom";

function UserNavBar() {
    return (
        <nav className = "flex items-center py-10 pl-10 gap-5">

            <img src = "src/assets/Rally-Rank-Logo.svg" alt = "RallyRank Logo"/>

            <div className = "flex text-xl gap-5">

                {/* HOME */}
                <NavLink
                    to = "/home"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green "}
                    exact
                >
                    Home
                </NavLink>

                {/* TOURNAMENTS */}
                <NavLink
                    to = "/user-tournaments"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green"}
                >
                    Tournaments
                </NavLink>

                {/* NEWS */}
                <NavLink
                    to = "/news"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green"}
                >
                    News
                </NavLink>

                {/* YOUR PROFILE */}
                <NavLink
                    to = "/user-profile"
                    activeClassName = "active"
                    className = {"text-secondary-color-dark-green hover:text-primary-color-green"}
                >
                    Your Profile
                </NavLink>
            </div>
        </nav>
    );
}

export default UserNavBar;