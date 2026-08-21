import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import "../styles/composants/_blocageAbonnement.scss";

export default function BlocageAbonnement() {
    const { t } = useTranslation();
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
                <h1>{t("commun.accesSuspendu")}</h1>
                <p>
                    {t("commun.accesSuspenduTexte")}
                    {utilisateur?.role === "admin"
                        ? " " + t("commun.accesSuspenduAdmin")
                        : " " + t("commun.accesSuspenduUtilisateur")}
                </p>

                {utilisateur?.role === "admin" && (
                    <a className="btn btn-primaire" href="/abonnement">
                        {t("commun.gererMonAbonnement")}
                    </a>
                )}

                <a className="blocage-abonnement__deconnexion" href="/logout">{t("commun.seDeconnecter")}</a>
            </div>
        </div>
    );
}
