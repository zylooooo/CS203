// src/components/NavBar.jsx
import { NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav className="flex justify-around p-8">
            <div className="text-3xl">RallyRank</div>
            <div className="flex gap-8 text-xl">
                <NavLink
                    to="/"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green hover:underline"
                    }
                    exact
                >
                    Home
                </NavLink>

                <NavLink
                    to="/about"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green"
                    }
                >
                    About
                </NavLink>
                <NavLink
                    to="/contact"
                    activeClassName="active"
                    className={
                        "text-secondary-color-dark-green hover:text-primary-color-green"
                    }
                >
                    Contact
                </NavLink>
            </div>
        </nav>
    );
}

export default NavBar;
