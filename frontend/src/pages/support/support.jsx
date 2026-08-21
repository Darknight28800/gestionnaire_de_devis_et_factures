import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";

const CATEGORIES = [
    { cle: "general", icone: "💬" },
    { cle: "technique", icone: "🐛" },
    { cle: "facturation", icone: "💳" },
    { cle: "autre", icone: "✨" }
];

const FAQ_CLES = ["premierDevis", "factureFayee", "changerFormule", "donneesSecurite"];

export default function Support() {
    const { t } = useTranslation();
    const [categorie, setCategorie] = useState(CATEGORIES[0].cle);
    const [sujet, setSujet] = useState("");
    const [message, setMessage] = useState("");
    const [envoi, setEnvoi] = useState(false);
    const [statut, setStatut] = useState(null); // "succes" | "erreur" | null
    const [faqOuverte, setFaqOuverte] = useState(null);

    const envoyer = async (e) => {
        e.preventDefault();
        setEnvoi(true);
        setStatut(null);

        try {
            await api.post("/support/tickets", { sujet: `[${t(`support.categorie.${categorie}`)}] ${sujet}`, message });
            setStatut("succes");
            setSujet("");
            setMessage("");
        } catch (err) {
            console.error("Erreur envoi ticket :", err);
            setStatut("erreur");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <div className="page page-support">

            {/* EN-TÊTE */}
            <div className="support-hero">
                <span className="support-hero__badge">🆘</span>
                <div>
                    <h1 className="page-title">{t("nav.support")}</h1>
                    <p className="page-lede">{t("support.introduction")}</p>
                </div>
            </div>

            <div className="support-layout">

                {/* COLONNE GAUCHE : FAQ + LIENS */}
                <aside className="support-side">
                    <div className="support-card support-card--faq">
                        <h2>{t("support.questionsFrequentes")}</h2>
                        <div className="faq-liste">
                            {FAQ_CLES.map((cle, i) => (
                                <div
                                    key={cle}
                                    className={`faq-item ${faqOuverte === i ? "faq-item--ouvert" : ""}`}
                                >
                                    <button
                                        type="button"
                                        className="faq-question"
                                        onClick={() => setFaqOuverte(faqOuverte === i ? null : i)}
                                    >
                                        <span>{t(`support.faq.${cle}.question`)}</span>
                                        <span className="faq-chevron">⌄</span>
                                    </button>
                                    {faqOuverte === i && (
                                        <p className="faq-reponse">{t(`support.faq.${cle}.reponse`)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="support-card support-card--liens">
                        <h2>{t("support.autresRessources")}</h2>
                        <a href="/support/contact" className="support-lien">
                            <span className="support-lien__icone">📇</span>
                            <span>
                                <strong>{t("support.contact")}</strong>
                                <small>{t("support.nosCoordonnees")}</small>
                            </span>
                            <span className="support-lien__fleche">→</span>
                        </a>
                        <a href="/support/mentions-legales" className="support-lien">
                            <span className="support-lien__icone">📜</span>
                            <span>
                                <strong>{t("support.mentionsLegales")}</strong>
                                <small>{t("support.informationsJuridiques")}</small>
                            </span>
                            <span className="support-lien__fleche">→</span>
                        </a>
                        <a href="/support/confidentialite" className="support-lien">
                            <span className="support-lien__icone">🔒</span>
                            <span>
                                <strong>{t("support.confidentialite")}</strong>
                                <small>{t("support.protectionDonnees")}</small>
                            </span>
                            <span className="support-lien__fleche">→</span>
                        </a>
                    </div>
                </aside>

                {/* FORMULAIRE */}
                <div className="support-card support-card--form">
                    <h2>{t("support.envoyerDemande")}</h2>

                    <div className="support-categories">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.cle}
                                type="button"
                                className={`support-categorie ${categorie === cat.cle ? "support-categorie--actif" : ""}`}
                                onClick={() => setCategorie(cat.cle)}
                            >
                                <span>{cat.icone}</span>
                                {t(`support.categorie.${cat.cle}`)}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={envoyer} className="form-support">
                        <div className="form-ligne">
                            <label>{t("support.sujet")}</label>
                            <input
                                placeholder={t("support.placeholderSujet")}
                                value={sujet}
                                onChange={(e) => setSujet(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-ligne">
                            <label>
                                {t("support.message")}
                                <span className="support-compteur">{message.length}/1000</span>
                            </label>
                            <textarea
                                placeholder={t("support.placeholderMessage")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                                rows={7}
                                required
                            />
                        </div>

                        {statut === "succes" && (
                            <p className="message message--succes">
                                ✅ {t("support.ticketEnvoye")}
                            </p>
                        )}
                        {statut === "erreur" && (
                            <p className="message message--erreur">
                                ❌ {t("support.erreurEnvoi")}
                            </p>
                        )}

                        <button type="submit" className="btn btn-primaire support-submit" disabled={envoi}>
                            {envoi ? t("support.envoiEnCours") : t("support.envoyerMaDemande")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
