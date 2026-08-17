import { useState } from "react";
import api from "../../api/axios";

export default function Support() {
    const [sujet, setSujet] = useState("");
    const [message, setMessage] = useState("");
    const [envoi, setEnvoi] = useState(false);
    const [statut, setStatut] = useState(null); // "succes" | "erreur" | null

    const envoyer = async (e) => {
        e.preventDefault();
        setEnvoi(true);
        setStatut(null);

        try {
            await api.post("/support/tickets", { sujet, message });
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
            <h1 className="page-title">Centre d'aide</h1>
            <p className="page-lede">
                Une question, un problème ? Décrivez-le ci-dessous, notre équipe vous répondra rapidement.
            </p>

            <form onSubmit={envoyer} className="form-support card">
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
                    <label>Message</label>
                    <textarea
                        placeholder="Décrivez votre problème en détail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
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

                <button type="submit" className="btn btn-primaire" disabled={envoi}>
                    {envoi ? "Envoi en cours..." : "Envoyer"}
                </button>
            </form>
        </div>
    );
}
