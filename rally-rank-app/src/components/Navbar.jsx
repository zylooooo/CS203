// src/components/NavBar.jsx
import { NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav className="flex items-center py-10 pl-10 gap-5">
            <img src="src/assets/Logo.svg" alt="RallyRank logo" />
            <div className="flex text-xl gap-5">

                {/* HOME */}
                <NavLink
                    to="/"
                    activeClassName="active"
                    className={
                        " text-secondary-color-dark-green hover:text-primary-color-green hover:underline"
                    }
                    exact
                >
                    Home
                </NavLink>

                {/* TOURNAMENTS */}
                <NavLink
                    to="/tournaments"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green"
                    }
                >
                    Tournaments
                </NavLink>

                {/* NEWS */}
                <NavLink
                    to="/news"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green"
                    }
                >
                    News
                </NavLink>

                {/* YOUR PROFILE */}
                <NavLink
                    to="/profile"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green"
                    }
                >
                    Your Profile
                </NavLink>

            </div>
        </nav>
    );
}

export default NavBar;
