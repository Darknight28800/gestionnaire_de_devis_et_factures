import { useTranslation } from "react-i18next";

export default function Erreur404() {
    const { t } = useTranslation();
    return (
        <div className="page page-erreur page-erreur--404">
            <h1 className="erreur-code">404</h1>
            <p className="erreur-message">{t("erreurs.404")}</p>

            <a href="/tableau-de-bord" className="erreur-btn">{t("erreurs.retourTableauDeBord")}</a>
        </div>
    );
}
