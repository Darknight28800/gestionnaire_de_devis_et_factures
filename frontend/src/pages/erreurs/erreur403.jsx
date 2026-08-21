import { useTranslation } from "react-i18next";

export default function Erreur403() {
    const { t } = useTranslation();
    return (
        <div className="page page-erreur page-erreur--403">
            <h1 className="erreur-code">403</h1>
            <p className="erreur-message">{t("erreurs.403")}</p>

            <a href="/tableau-de-bord" className="erreur-btn">{t("erreurs.retourTableauDeBord")}</a>
        </div>
    );
}
