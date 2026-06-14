import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../styles/composants/_sidebar.scss";

export default function Sidebar({ open }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${open ? "open" : ""}`}>
            <div className="sidebar_top">
                <div className="sidebar_logo">GDF</div>

                <button
                    className="sidebar_toggle"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    ☰
                </button>
            </div>

            <nav className="sidebar_nav">
                <NavLink to="/" end className="sidebar_link">
                    <span>Tableau de bord</span>
                </NavLink>

                <NavLink to="/clients" className="sidebar_link">
                    <span>Clients</span>
                </NavLink>

                <NavLink to="/devis" className="sidebar_link">
                    <span>Devis</span>
                </NavLink>

                <NavLink to="/factures" className="sidebar_link">
                    <span>Factures</span>
                </NavLink>

                <NavLink to="/parametres" className="sidebar_link">
                    <span>Paramètres</span>
                </NavLink>

                <NavLink to="/profil" className="sidebar_link">
                    <span>Profil</span>
                </NavLink>

                <NavLink to="/admin" className="sidebar_link">
                    <span>Administration</span>
                </NavLink>

                <NavLink to="/support" className="sidebar_link">
                    <span>Support</span>
                </NavLink>

                <NavLink to="/logout" className="sidebar_link sidebar_logout">
                    <span>Déconnexion</span>
                </NavLink>
            </nav>
        </aside>
    );
}
