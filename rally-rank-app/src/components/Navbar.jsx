// src/components/NavBar.jsx
import { NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav>
            <NavLink to="/" activeClassName="active" exact>
                Home
            </NavLink>
            <NavLink to="/about" activeClassName="active">
                About
            </NavLink>
            <NavLink to="/contact" activeClassName="active">
                Contact
            </NavLink>
        </nav>
    );
}

export default NavBar;
