import { useTranslation } from "react-i18next";

export default function Erreur401() {
    const { t } = useTranslation();
    return (
        <div className="page page-erreur page-erreur--401">
            <h1 className="erreur-code">401</h1>
            <p className="erreur-message">{t("erreurs.401")}</p>

            <a href="/connexion" className="erreur-btn">{t("connexion.seConnecter")}</a>
        </div>
    );
}
