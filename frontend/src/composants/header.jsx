import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/composants/_header.scss";

export default function Header({ onToggleSidebar }) {
    const [parametres, setParametres] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

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
    }, [parametres]);

    /* Appliquer le thème sauvegardé */
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
        }
    }, []);

    /* Toggle dark mode */
    const toggleDarkMode = () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    };

    return (
        <header className="header">
            <div className="header__left">

                {/* Bouton mobile */}
                <button className="header__burger" onClick={onToggleSidebar}>
                    ☰
                </button>

                {/* Logo FacturePro (fallback si aucun logo dans parametres) */}
                <img
                    src={parametres?.logo_url || "/assets/logo-facturepro.png"}
                    alt="Logo FacturePro"
                    className="header__logo"
                />

                {/* Nom entreprise */}
                <h1 className="header__title">
                    {parametres?.nom_entreprise || "FacturePro"}
                </h1>
            </div>

            <div className="header__right">

                {/* DARK MODE */}
                <button className="btn-darkmode" onClick={toggleDarkMode}>
                    🌙
                </button>

                {/* MENU UTILISATEUR */}
                <div
                    className="header__user"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="avatar"
                        className="header__avatar"
                    />
                    <span>John Doe</span>

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
