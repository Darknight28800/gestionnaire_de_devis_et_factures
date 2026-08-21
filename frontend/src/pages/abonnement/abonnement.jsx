import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import "../../styles/pages/_abonnement.scss";

const ICONES_STATUT = {
    attente_carte: "🔓",
    essai: "⏳",
    actif: "✅",
    impaye: "⚠️",
    annule: "🔒"
};

const ICONES_OFFRE = ["🚀", "⭐", "💎", "🏆"];

export default function Abonnement() {
    const { t } = useTranslation();
    const { utilisateur } = useAuth();
    const [searchParams] = useSearchParams();
    const [statut, setStatut] = useState(null);
    const [offresInfo, setOffresInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chargementOffre, setChargementOffre] = useState(null);
    const [chargementPortail, setChargementPortail] = useState(false);
    const [erreur, setErreur] = useState(null);

    const paiementRetour = searchParams.get("paiement");

    const formaterLimite = (valeur) => (valeur === null || valeur === undefined ? t("accueil.illimite") : valeur);

    const LABELS_STATUT = {
        attente_carte: t("abonnement.statutAttenteCarte"),
        essai: t("abonnement.statutEssai"),
        actif: t("abonnement.statutActif"),
        impaye: t("abonnement.statutImpaye"),
        annule: t("abonnement.statutAnnule")
    };

    const charger = async () => {
        try {
            const [resStatut, resOffres] = await Promise.all([
                api.get("/abonnement/statut"),
                api.get("/abonnement/offres")
            ]);
            setStatut(resStatut.data);
            setOffresInfo(resOffres.data);
        } catch (err) {
            console.error("Erreur chargement abonnement :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const choisirOffre = async (offreCode) => {
        setErreur(null);
        setChargementOffre(offreCode);
        try {
            const res = await api.post("/abonnement/creer-session-paiement", { offreCode });
            window.location.href = res.data.url;
        } catch (err) {
            setErreur(err.response?.data?.message || t("abonnement.erreurPaiement"));
            setChargementOffre(null);
        }
    };

    const ouvrirPortail = async () => {
        setErreur(null);
        setChargementPortail(true);
        try {
            const res = await api.post("/abonnement/portail");
            window.location.href = res.data.url;
        } catch (err) {
            setErreur(err.response?.data?.message || t("abonnement.erreurPortail"));
            setChargementPortail(false);
        }
    };

    if (loading) return <p>{t("commun.chargement")}</p>;

    const estAdmin = utilisateur?.role === "admin";
    const stripePret = offresInfo?.stripeConfigure;

    return (
        <div className="page-abonnement">

            {/* EN-TÊTE */}
            <div className="abonnement-hero">
                <span className="abonnement-hero__badge">💎</span>
                <div>
                    <h1 className="page-title">{t("nav.abonnement")}</h1>
                    <p className="page-lede">{t("abonnement.gererFormule")}</p>
                </div>
            </div>

            {paiementRetour === "succes" && (
                <p className="message message--succes">
                    ✅ {t("abonnement.paiementSucces")}
                </p>
            )}
            {paiementRetour === "annule" && (
                <p className="message message--erreur">{t("abonnement.paiementAnnule")}</p>
            )}
            {erreur && <p className="message message--erreur">{erreur}</p>}

            {!stripePret && (
                <div className="callout callout--info">
                    {t("abonnement.stripeNonConfigure")}
                    {estAdmin ? ` ${t("abonnement.stripeInstructions")}` : ""}
                </div>
            )}

            <div className={`carte-statut carte-statut--${statut.statut}`}>
                <div className="carte-statut__entete">
                    <span className="carte-statut__icone">{ICONES_STATUT[statut.statut] || "📦"}</span>
                    <div className="carte-statut__corps">
                        <h2>{LABELS_STATUT[statut.statut] || statut.statut}</h2>

                        {statut.statut === "essai" && (
                            <>
                                <p>
                                    {t("abonnement.offre")} <strong>{statut.offre?.nom}</strong> — {t("abonnement.seTermineLe")}{" "}
                                    <strong>{new Date(statut.essaiFin).toLocaleDateString()}</strong>
                                    {" "}({t("abonnement.jourRestant", { count: statut.joursRestants })}).
                                    {" "}{t("abonnement.carteDebitee")}
                                </p>
                                <div className="carte-statut__progression">
                                    <div
                                        className="carte-statut__progression-barre"
                                        style={{
                                            width: `${Math.max(4, Math.min(100, ((offresInfo.dureeEssaiJours - statut.joursRestants) / offresInfo.dureeEssaiJours) * 100))}%`
                                        }}
                                    />
                                </div>
                            </>
                        )}
                        {statut.statut === "actif" && (
                            <p>{t("abonnement.offre")} <strong>{statut.offre?.nom}</strong> — {statut.offre?.prix_mensuel} {t("accueil.parMois")}.</p>
                        )}
                        {statut.statut === "impaye" && (
                            <p>{t("abonnement.dernierPrelevementEchoue")}</p>
                        )}
                        {statut.statut === "attente_carte" && (
                            <p>{t("abonnement.choisirOffreEssai", { jours: offresInfo.dureeEssaiJours })}</p>
                        )}
                        {statut.statut === "annule" && (
                            <p>{t("abonnement.choisirNouvelleOffre")}</p>
                        )}

                        {!estAdmin && (
                            <p className="carte-statut__note">{t("abonnement.seulAdmin")}</p>
                        )}

                        {estAdmin && ["actif", "impaye"].includes(statut.statut) && stripePret && (
                            <button className="btn btn-primaire" onClick={ouvrirPortail} disabled={chargementPortail}>
                                {chargementPortail ? t("abonnement.ouverture") : t("abonnement.gererMonAbonnement")}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="offres-titre">{t("abonnement.nosOffres")}</h2>
            <div className="grille-offres">
                {offresInfo.offres.map((offre, i) => {
                    const estOffreActuelle = statut.offre?.id === offre.id;
                    return (
                        <div
                            key={offre.id}
                            className={`carte-offre ${estOffreActuelle ? "carte-offre--actuelle" : ""}`}
                        >
                            {estOffreActuelle && <span className="carte-offre__ruban">{t("abonnement.offreActuelle")}</span>}

                            <span className="carte-offre__icone">{ICONES_OFFRE[i % ICONES_OFFRE.length]}</span>
                            <h3>{offre.nom}</h3>
                            <p className="carte-offre__description">{offre.description}</p>
                            <p className="carte-offre__prix">
                                {offre.prix_mensuel} € <span>{t("accueil.parMois")}</span>
                            </p>
                            <ul>
                                <li><span className="carte-offre__puce">👥</span> {formaterLimite(offre.max_utilisateurs)} {t(offre.max_utilisateurs === 1 ? "accueil.utilisateur" : "accueil.utilisateurs")}</li>
                                <li><span className="carte-offre__puce">📄</span> {formaterLimite(offre.max_devis_mois)} {t("accueil.devisParMois")}</li>
                                <li><span className="carte-offre__puce">🧾</span> {formaterLimite(offre.max_factures_mois)} {t("accueil.facturesParMois")}</li>
                            </ul>

                            {estAdmin && (
                                <button
                                    className="btn btn-primaire"
                                    disabled={!stripePret || chargementOffre === offre.code || estOffreActuelle}
                                    onClick={() => choisirOffre(offre.code)}
                                >
                                    {estOffreActuelle
                                        ? t("abonnement.offreActuelle")
                                        : chargementOffre === offre.code
                                            ? t("abonnement.redirection")
                                            : t("accueil.commencer")}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
