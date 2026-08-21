import { useTranslation } from "react-i18next";

export default function Erreur500() {
    const { t } = useTranslation();
    return (
        <div className="page page-erreur page-erreur--500">
            <h1 className="erreur-code">500</h1>
            <p className="erreur-message">{t("erreurs.500")}</p>

            <a href="/tableau-de-bord" className="erreur-btn">{t("erreurs.retourTableauDeBord")}</a>
        </div>
    );
}
