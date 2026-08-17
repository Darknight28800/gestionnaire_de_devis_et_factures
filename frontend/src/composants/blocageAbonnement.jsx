import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import "../styles/composants/_blocageAbonnement.scss";

export default function BlocageAbonnement() {
    const { utilisateur } = useAuth();
    const [bloque, setBloque] = useState(false);

    useEffect(() => {
        const onBloque = () => setBloque(true);
        window.addEventListener("abonnement-bloque", onBloque);
        return () => window.removeEventListener("abonnement-bloque", onBloque);
    }, []);

    if (!bloque) return null;

    return (
        <div className="blocage-abonnement">
            <div className="blocage-abonnement__carte">
                <div className="blocage-abonnement__icone">🔒</div>
                <h1>Accès suspendu</h1>
                <p>
                    Votre période d'essai gratuite est terminée ou votre dernier paiement a échoué.
                    {utilisateur?.role === "admin"
                        ? " Choisissez ou réactivez un abonnement pour continuer à utiliser l'application."
                        : " Contactez votre administrateur pour réactiver l'abonnement."}
                </p>

                {utilisateur?.role === "admin" && (
                    <a className="btn btn-primaire" href="/abonnement">
                        Gérer mon abonnement
                    </a>
                )}

                <a className="blocage-abonnement__deconnexion" href="/logout">Se déconnecter</a>
            </div>
        </div>
    );
}
