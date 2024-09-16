// src/components/NavBar.jsx
import { NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav className="flex items-center justify-around py-10">
            <img src="src/assets/Logo.svg" alt="RallyRank logo" />
            <div className="flex text-xl gap-5">
                <NavLink
                    to="/"
                    activeClassName="active"
                    className={
                        "bg-primary-color-light-green text-secondary-color-dark-green hover:text-primary-color-green hover:underline"
                    }
                    exact
                >
                    Login
                </NavLink>

                <NavLink
                    to="/about"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green"
                    }
                >
                    Sign Up
                </NavLink>
            </div>
        </nav>
    );
}

export default NavBar;
