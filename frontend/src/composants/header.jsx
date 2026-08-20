import { useContext, useEffect, useState } from "react";
import api, { resoudreUrlFichier } from "../api/axios";
import { AuthContexte } from "../contexte/authProvider";
import "../styles/composants/_header.scss";

export default function Header({ onToggleSidebar }) {
    const { utilisateur } = useContext(AuthContexte);
    const [parametres, setParametres] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [modeSombre, setModeSombre] = useState(false);

    const nomAffiche = utilisateur?.nom || utilisateur?.email || "Mon compte";
    const initiales = nomAffiche
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((mot) => mot[0].toUpperCase())
        .join("");

    /* Charger les paramètres */
    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/parametres");
                setParametres(res.data);
            } catch (err) {
                console.error("Erreur chargement paramètres :", err);
            }
        };
        charger();
    }, []);

    /* Appliquer les couleurs dynamiques */
    useEffect(() => {
        if (!parametres) return;

        const apply = (key, value) => {
            if (value) {
                document.documentElement.style.setProperty(key, value);
            }
        };

        apply("--couleur-primaire", parametres.couleur_primaire);
        apply("--couleur-secondaire", parametres.couleur_secondaire);
        apply("--couleur-accent", parametres.couleur_accent);
        // Sidebar/footer : figés sur cette même teinte, mais indépendants du mode sombre
        apply("--fond-marque", parametres.couleur_secondaire);
    }, [parametres]);

    /* Appliquer le thème sauvegardé */
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
            setModeSombre(true);
        }
    }, []);

    /* Toggle dark mode */
    const toggleDarkMode = () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        setModeSombre(isDark);
    };

    return (
        <header className="header">
            <div className="header__left">

                {/* Bouton mobile */}
                <button className="header__burger" onClick={onToggleSidebar}>
                    ☰
                </button>

                {/* Logo FacturePro (fallback si aucun logo dans parametres) */}
                <span className="header__logo-badge">
                    <img
                        src={parametres?.logo_url ? resoudreUrlFichier(parametres.logo_url) : "/assets/logo-facturepro.svg"}
                        alt="Logo FacturePro"
                        className="header__logo"
                    />
                </span>

                {/* Nom entreprise */}
                <h1 className="header__title">
                    {parametres?.nom_entreprise || "FacturePro"}
                </h1>
            </div>

            <div className="header__right">

                {/* DARK MODE */}
                <button className="btn-darkmode" onClick={toggleDarkMode} aria-label="Basculer le mode sombre">
                    {modeSombre ? "☀️" : "🌙"}
                </button>

                {/* MENU UTILISATEUR */}
                <div
                    className="header__user"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="header__avatar header__avatar--initiales">
                        {initiales || "?"}
                    </span>
                    <span>{nomAffiche}</span>

                    {menuOpen && (
                        <div className="user-menu">
                            <a href="/profil">Profil</a>
                            <a href="/parametres">Paramètres</a>
                            <a href="/logout">Déconnexion</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
