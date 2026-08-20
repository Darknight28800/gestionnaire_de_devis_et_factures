import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../styles/composants/_sidebar.scss";

const LIENS = [
    { to: "/", label: "Tableau de bord", icone: "📊", fin: true },
    { to: "/clients", label: "Clients", icone: "👤" },
    { to: "/devis", label: "Devis", icone: "📄" },
    { to: "/factures", label: "Factures", icone: "🧾" },
    { to: "/archives", label: "Archives", icone: "🗂️" },
    { to: "/parametres", label: "Paramètres", icone: "⚙️" },
    { to: "/abonnement", label: "Abonnement", icone: "💳", badge: "PRO" },
    { to: "/profil", label: "Profil", icone: "🙋" },
    { to: "/admin", label: "Administration", icone: "🛠️" },
    { to: "/support", label: "Support", icone: "🆘" }
];

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
                {LIENS.map((lien) => (
                    <NavLink key={lien.to} to={lien.to} end={lien.fin} className="sidebar_link">
                        <span className="sidebar_icon">{lien.icone}</span>
                        <span>{lien.label}</span>
                        {lien.badge && <span className="sidebar_badge">{lien.badge}</span>}
                    </NavLink>
                ))}

                <NavLink to="/logout" className="sidebar_link sidebar_logout">
                    <span className="sidebar_icon">🚪</span>
                    <span>Déconnexion</span>
                </NavLink>
            </nav>
        </aside>
    );
}
