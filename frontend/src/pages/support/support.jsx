import { useState } from "react";
import api from "../../api/axios";

const CATEGORIES = [
    { valeur: "Question générale", icone: "💬" },
    { valeur: "Problème technique", icone: "🐛" },
    { valeur: "Facturation & abonnement", icone: "💳" },
    { valeur: "Autre", icone: "✨" }
];

const FAQ = [
    {
        question: "Comment créer mon premier devis ?",
        reponse: "Rendez-vous dans la section \"Devis\", cliquez sur \"Nouveau devis\", choisissez un client puis ajoutez vos lignes de prestation. Vous pouvez l'envoyer par email dès qu'il est prêt."
    },
    {
        question: "Comment marquer une facture comme payée ?",
        reponse: "Ouvrez la facture concernée depuis la section \"Factures\" et changez son statut en \"Payée\". Le tableau de bord se met à jour automatiquement."
    },
    {
        question: "Puis-je changer de formule d'abonnement à tout moment ?",
        reponse: "Oui, depuis \"Abonnement\" vous pouvez changer de formule ou l'annuler à tout moment, sans engagement."
    },
    {
        question: "Mes données sont-elles en sécurité ?",
        reponse: "Vos données sont hébergées de façon sécurisée et ne sont jamais partagées avec des tiers. Voir notre page Confidentialité pour le détail."
    }
];

export default function Support() {
    const [categorie, setCategorie] = useState(CATEGORIES[0].valeur);
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
            await api.post("/support/tickets", { sujet: `[${categorie}] ${sujet}`, message });
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
                    <h1 className="page-title">Centre d'aide</h1>
                    <p className="page-lede">
                        Une question, un problème ? Décrivez-le ci-dessous, notre équipe vous répondra rapidement.
                    </p>
                </div>
            </div>

            <div className="support-layout">

                {/* COLONNE GAUCHE : FAQ + LIENS */}
                <aside className="support-side">
                    <div className="support-card support-card--faq">
                        <h2>Questions fréquentes</h2>
                        <div className="faq-liste">
                            {FAQ.map((item, i) => (
                                <div
                                    key={item.question}
                                    className={`faq-item ${faqOuverte === i ? "faq-item--ouvert" : ""}`}
                                >
                                    <button
                                        type="button"
                                        className="faq-question"
                                        onClick={() => setFaqOuverte(faqOuverte === i ? null : i)}
                                    >
                                        <span>{item.question}</span>
                                        <span className="faq-chevron">⌄</span>
                                    </button>
                                    {faqOuverte === i && (
                                        <p className="faq-reponse">{item.reponse}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="support-card support-card--liens">
                        <h2>Autres ressources</h2>
                        <a href="/support/contact" className="support-lien">
                            <span className="support-lien__icone">📇</span>
                            <span>
                                <strong>Contact</strong>
                                <small>Nos coordonnées</small>
                            </span>
                            <span className="support-lien__fleche">→</span>
                        </a>
                        <a href="/support/mentions-legales" className="support-lien">
                            <span className="support-lien__icone">📜</span>
                            <span>
                                <strong>Mentions légales</strong>
                                <small>Informations juridiques</small>
                            </span>
                            <span className="support-lien__fleche">→</span>
                        </a>
                        <a href="/support/confidentialite" className="support-lien">
                            <span className="support-lien__icone">🔒</span>
                            <span>
                                <strong>Confidentialité</strong>
                                <small>Protection de vos données</small>
                            </span>
                            <span className="support-lien__fleche">→</span>
                        </a>
                    </div>
                </aside>

                {/* FORMULAIRE */}
                <div className="support-card support-card--form">
                    <h2>Envoyer une demande</h2>

                    <div className="support-categories">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.valeur}
                                type="button"
                                className={`support-categorie ${categorie === cat.valeur ? "support-categorie--actif" : ""}`}
                                onClick={() => setCategorie(cat.valeur)}
                            >
                                <span>{cat.icone}</span>
                                {cat.valeur}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={envoyer} className="form-support">
                        <div className="form-ligne">
                            <label>Sujet</label>
                            <input
                                placeholder="Ex : Erreur lors de l'envoi d'une facture"
                                value={sujet}
                                onChange={(e) => setSujet(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-ligne">
                            <label>
                                Message
                                <span className="support-compteur">{message.length}/1000</span>
                            </label>
                            <textarea
                                placeholder="Décrivez votre problème en détail..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                                rows={7}
                                required
                            />
                        </div>

                        {statut === "succes" && (
                            <p className="message message--succes">
                                ✅ Votre ticket a bien été envoyé, nous reviendrons vers vous rapidement.
                            </p>
                        )}
                        {statut === "erreur" && (
                            <p className="message message--erreur">
                                ❌ Une erreur est survenue lors de l'envoi. Merci de réessayer.
                            </p>
                        )}

                        <button type="submit" className="btn btn-primaire support-submit" disabled={envoi}>
                            {envoi ? "Envoi en cours..." : "Envoyer ma demande"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
