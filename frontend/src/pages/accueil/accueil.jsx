import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import SelecteurLangue from "../../composants/selecteurLangue";
import "../../styles/pages/_accueil.scss";

export default function Accueil() {
    const { t } = useTranslation();
    const { utilisateur } = useAuth();
    const [offres, setOffres] = useState([]);

    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/abonnement/offres");
                setOffres(res.data.offres || []);
            } catch (err) {
                console.error("Erreur chargement des offres :", err);
            }
        };
        charger();
    }, []);

    if (utilisateur) {
        return <Navigate to="/tableau-de-bord" replace />;
    }

    const formaterLimite = (valeur) => (valeur === null || valeur === undefined ? t("accueil.illimite") : valeur);

    const FONCTIONNALITES = [
        { icone: "📄", titre: t("accueil.fonctionnalite1Titre"), texte: t("accueil.fonctionnalite1Texte") },
        { icone: "🧾", titre: t("accueil.fonctionnalite2Titre"), texte: t("accueil.fonctionnalite2Texte") },
        { icone: "👥", titre: t("accueil.fonctionnalite3Titre"), texte: t("accueil.fonctionnalite3Texte") },
        { icone: "📊", titre: t("accueil.fonctionnalite4Titre"), texte: t("accueil.fonctionnalite4Texte") }
    ];

    return (
        <div className="page-accueil">

            {/* HEADER PUBLIC */}
            <header className="accueil-header">
                <div className="accueil-header__marque">
                    <img src="/assets/logo-facturepro.svg" alt="" className="accueil-header__logo" />
                    <span>FacturePro</span>
                </div>
                <nav className="accueil-header__nav">
                    <a href="#fonctionnalites">{t("accueil.fonctionnalites")}</a>
                    <a href="#tarifs">{t("accueil.tarifs")}</a>
                    <Link to="/support">{t("accueil.centreAide")}</Link>
                </nav>
                <div className="accueil-header__actions">
                    <SelecteurLangue />
                    <Link to="/connexion" className="btn-texte">{t("accueil.seConnecter")}</Link>
                    <Link to="/connexion" className="btn btn-primaire">{t("accueil.essayerGratuitement")}</Link>
                </div>
            </header>

            {/* HERO */}
            <section className="accueil-hero">
                <span className="accueil-hero__badge">{t("accueil.badge")}</span>
                <h1>{t("accueil.titre")}</h1>
                <p>{t("accueil.sousTitre")}</p>
                <div className="accueil-hero__actions">
                    <Link to="/connexion" className="btn btn-primaire accueil-hero__cta">{t("accueil.essayerGratuitement")}</Link>
                    <Link to="/connexion?demo=1" className="btn-texte accueil-hero__demo">{t("accueil.voirDemo")}</Link>
                </div>
            </section>

            {/* FONCTIONNALITÉS */}
            <section className="accueil-section" id="fonctionnalites">
                <h2>{t("accueil.fonctionnalitesTitre")}</h2>
                <div className="accueil-fonctionnalites">
                    {FONCTIONNALITES.map((f) => (
                        <div className="accueil-fonctionnalite" key={f.titre}>
                            <span className="accueil-fonctionnalite__icone">{f.icone}</span>
                            <h3>{f.titre}</h3>
                            <p>{f.texte}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* TARIFS */}
            <section className="accueil-section" id="tarifs">
                <h2>{t("accueil.tarifsTitre")}</h2>
                <p className="accueil-section__sous-titre">{t("accueil.tarifsSousTitre")}</p>

                <div className="accueil-tarifs">
                    {offres.map((offre) => (
                        <div className="accueil-tarif" key={offre.id}>
                            <h3>{offre.nom}</h3>
                            <p className="accueil-tarif__description">{offre.description}</p>
                            <p className="accueil-tarif__prix">
                                {offre.prix_mensuel} € <span>{t("accueil.parMois")}</span>
                            </p>
                            <ul>
                                <li>{formaterLimite(offre.max_utilisateurs)} {t(offre.max_utilisateurs === 1 ? "accueil.utilisateur" : "accueil.utilisateurs")}</li>
                                <li>{formaterLimite(offre.max_devis_mois)} {t("accueil.devisParMois")}</li>
                                <li>{formaterLimite(offre.max_factures_mois)} {t("accueil.facturesParMois")}</li>
                            </ul>
                            <Link to="/connexion" className="btn btn-primaire">{t("accueil.commencer")}</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* PIED DE PAGE */}
            <footer className="accueil-footer">
                <div className="accueil-header__marque">
                    <img src="/assets/logo-facturepro.svg" alt="" className="accueil-header__logo" />
                    <span>FacturePro</span>
                </div>
                <p>© {new Date().getFullYear()} FacturePro by SphereWeb — {t("accueil.droitsReserves")}</p>
            </footer>
        </div>
    );
}
