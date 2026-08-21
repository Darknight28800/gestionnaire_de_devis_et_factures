import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import "../../styles/pages/_abonnement.scss";

const LABELS_STATUT = {
    attente_carte: "Aucun abonnement démarré",
    essai: "Essai gratuit en cours",
    actif: "Abonnement actif",
    impaye: "Paiement échoué",
    annule: "Abonnement résilié"
};

const ICONES_STATUT = {
    attente_carte: "🔓",
    essai: "⏳",
    actif: "✅",
    impaye: "⚠️",
    annule: "🔒"
};

const ICONES_OFFRE = ["🚀", "⭐", "💎", "🏆"];

function formaterLimite(valeur) {
    return valeur === null || valeur === undefined ? "Illimité" : valeur;
}

export default function Abonnement() {
    const { utilisateur } = useAuth();
    const [searchParams] = useSearchParams();
    const [statut, setStatut] = useState(null);
    const [offresInfo, setOffresInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chargementOffre, setChargementOffre] = useState(null);
    const [chargementPortail, setChargementPortail] = useState(false);
    const [erreur, setErreur] = useState(null);

    const paiementRetour = searchParams.get("paiement");

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
            setErreur(err.response?.data?.message || "Impossible de démarrer le paiement pour le moment.");
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
            setErreur(err.response?.data?.message || "Impossible d'ouvrir le portail de facturation.");
            setChargementPortail(false);
        }
    };

    if (loading) return <p>Chargement…</p>;

    const estAdmin = utilisateur?.role === "admin";
    const stripePret = offresInfo?.stripeConfigure;

    return (
        <div className="page-abonnement">

            {/* EN-TÊTE */}
            <div className="abonnement-hero">
                <span className="abonnement-hero__badge">💎</span>
                <div>
                    <h1 className="page-title">Abonnement</h1>
                    <p className="page-lede">Gérez votre formule et suivez l'état de votre abonnement.</p>
                </div>
            </div>

            {paiementRetour === "succes" && (
                <p className="message message--succes">
                    ✅ Merci ! Votre carte a bien été enregistrée. Votre essai gratuit démarre maintenant.
                </p>
            )}
            {paiementRetour === "annule" && (
                <p className="message message--erreur">Paiement annulé — aucune modification n'a été effectuée.</p>
            )}
            {erreur && <p className="message message--erreur">{erreur}</p>}

            {!stripePret && (
                <div className="callout callout--info">
                    Le paiement n'est pas encore configuré pour cette installation (clés Stripe manquantes).
                    {estAdmin ? " Renseignez STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY et STRIPE_WEBHOOK_SECRET côté serveur pour l'activer." : ""}
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
                                    Offre <strong>{statut.offre?.nom}</strong> — se termine le{" "}
                                    <strong>{new Date(statut.essaiFin).toLocaleDateString()}</strong>
                                    {" "}({statut.joursRestants} jour{statut.joursRestants > 1 ? "s" : ""} restant{statut.joursRestants > 1 ? "s" : ""}).
                                    Votre carte enregistrée sera débitée automatiquement à la fin de l'essai.
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
                            <p>Offre <strong>{statut.offre?.nom}</strong> — {statut.offre?.prix_mensuel} €/mois.</p>
                        )}
                        {statut.statut === "impaye" && (
                            <p>Le dernier prélèvement a échoué. Mettez à jour votre moyen de paiement pour ne pas perdre l'accès à l'application.</p>
                        )}
                        {statut.statut === "attente_carte" && (
                            <p>Choisissez une offre ci-dessous pour démarrer votre essai gratuit de {offresInfo.dureeEssaiJours} jours (carte requise, aucun prélèvement avant la fin de l'essai).</p>
                        )}
                        {statut.statut === "annule" && (
                            <p>Choisissez une nouvelle offre ci-dessous pour réactiver l'accès.</p>
                        )}

                        {!estAdmin && (
                            <p className="carte-statut__note">Seul un administrateur peut gérer l'abonnement. Contactez-le si besoin.</p>
                        )}

                        {estAdmin && ["actif", "impaye"].includes(statut.statut) && stripePret && (
                            <button className="btn btn-primaire" onClick={ouvrirPortail} disabled={chargementPortail}>
                                {chargementPortail ? "Ouverture..." : "Gérer mon abonnement"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="offres-titre">Nos offres</h2>
            <div className="grille-offres">
                {offresInfo.offres.map((offre, i) => {
                    const estOffreActuelle = statut.offre?.id === offre.id;
                    return (
                        <div
                            key={offre.id}
                            className={`carte-offre ${estOffreActuelle ? "carte-offre--actuelle" : ""}`}
                        >
                            {estOffreActuelle && <span className="carte-offre__ruban">Offre actuelle</span>}

                            <span className="carte-offre__icone">{ICONES_OFFRE[i % ICONES_OFFRE.length]}</span>
                            <h3>{offre.nom}</h3>
                            <p className="carte-offre__description">{offre.description}</p>
                            <p className="carte-offre__prix">
                                {offre.prix_mensuel} € <span>/ mois</span>
                            </p>
                            <ul>
                                <li><span className="carte-offre__puce">👥</span> {formaterLimite(offre.max_utilisateurs)} utilisateur{offre.max_utilisateurs !== 1 ? "s" : ""}</li>
                                <li><span className="carte-offre__puce">📄</span> {formaterLimite(offre.max_devis_mois)} devis / mois</li>
                                <li><span className="carte-offre__puce">🧾</span> {formaterLimite(offre.max_factures_mois)} factures / mois</li>
                            </ul>

                            {estAdmin && (
                                <button
                                    className="btn btn-primaire"
                                    disabled={!stripePret || chargementOffre === offre.code || estOffreActuelle}
                                    onClick={() => choisirOffre(offre.code)}
                                >
                                    {estOffreActuelle
                                        ? "Offre actuelle"
                                        : chargementOffre === offre.code
                                            ? "Redirection..."
                                            : "Choisir cette offre"}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
