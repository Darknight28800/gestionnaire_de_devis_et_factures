import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import "../styles/composants/_bandeauEssai.scss";

export default function BandeauEssai() {
    const { utilisateur } = useAuth();
    const [statut, setStatut] = useState(null);
    const [masque, setMasque] = useState(false);

    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/abonnement/statut");
                setStatut(res.data);
            } catch {
                // silencieux : ne doit jamais casser le reste de l'application
            }
        };
        charger();
    }, []);

    if (!statut || masque) return null;
    if (statut.statut !== "essai") return null;
    if (statut.joursRestants === null || statut.joursRestants > 3) return null;

    const texte =
        statut.joursRestants === 0
            ? "Votre essai gratuit se termine aujourd'hui."
            : `Votre essai gratuit se termine dans ${statut.joursRestants} jour${statut.joursRestants > 1 ? "s" : ""}.`;

    return (
        <div className="bandeau-essai">
            <span>⏳ {texte} Votre carte enregistrée sera débitée automatiquement pour poursuivre votre abonnement.</span>
            {utilisateur?.role === "admin" && (
                <Link to="/abonnement" className="bandeau-essai__lien">Gérer mon abonnement</Link>
            )}
            <button className="bandeau-essai__fermer" onClick={() => setMasque(true)} aria-label="Fermer">✕</button>
        </div>
    );
}
