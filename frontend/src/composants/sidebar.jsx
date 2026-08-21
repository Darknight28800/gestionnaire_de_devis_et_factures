import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/composants/_sidebar.scss";

const LIENS = [
    { to: "/tableau-de-bord", cle: "tableauDeBord", icone: "📊", fin: true },
    { to: "/clients", cle: "clients", icone: "👤" },
    { to: "/devis", cle: "devis", icone: "📄" },
    { to: "/factures", cle: "factures", icone: "🧾" },
    { to: "/archives", cle: "archives", icone: "🗂️" },
    { to: "/parametres", cle: "parametres", icone: "⚙️" },
    { to: "/abonnement", cle: "abonnement", icone: "💳", badge: "PRO" },
    { to: "/profil", cle: "profil", icone: "🙋" },
    { to: "/admin", cle: "administration", icone: "🛠️" },
    { to: "/support", cle: "support", icone: "🆘" }
];

export default function Sidebar({ open }) {
    const { t } = useTranslation();
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
                    <NavLink key={lien.to} to={lien.to} end={lien.fin} className="sidebar_link" data-tour={`nav-${lien.cle}`}>
                        <span className="sidebar_icon">{lien.icone}</span>
                        <span>{t(`nav.${lien.cle}`)}</span>
                        {lien.badge && <span className="sidebar_badge">{lien.badge}</span>}
                    </NavLink>
                ))}

                <NavLink to="/logout" className="sidebar_link sidebar_logout">
                    <span className="sidebar_icon">🚪</span>
                    <span>{t("nav.deconnexion")}</span>
                </NavLink>
            </nav>
        </aside>
    );
}
