import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { obtenirParcours } from "../tutoriel/parcours";
import "../styles/composants/_boutonAide.scss";

export default function BoutonAide() {
    const { t } = useTranslation();
    const location = useLocation();

    const lancerVisite = () => {
        const etapes = obtenirParcours(location.pathname, t);

        const visite = driver({
            showProgress: true,
            steps: etapes,
            nextBtnText: t("tour.etapeSuivante"),
            prevBtnText: t("tour.etapePrecedente"),
            doneBtnText: t("tour.terminer"),
            progressText: "{{current}} / {{total}}"
        });

        visite.drive();
    };

    return (
        <button
            type="button"
            className="bouton-aide"
            onClick={lancerVisite}
            title={t("tour.bouton")}
            aria-label={t("tour.bouton")}
        >
            ❓
        </button>
    );
}
