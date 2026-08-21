import { useTranslation } from "react-i18next";

export default function Confidentialite() {
    const { t } = useTranslation();

    return (
        <div className="page page-legal">
            <h1>{t("legal.confidentialite.titre")}</h1>
            <p className="page-legal__maj">{t("legal.derniereMaj")} : {t("legal.aCompleter")}</p>

            <section>
                <h2>{t("legal.confidentialite.donneesCollectees")}</h2>
                <p>{t("legal.confidentialite.donneesCollecteesTexte")}</p>
            </section>

            <section>
                <h2>{t("legal.confidentialite.utilisationDonnees")}</h2>
                <p>{t("legal.confidentialite.utilisationDonneesTexte")}</p>
            </section>

            <section>
                <h2>{t("legal.confidentialite.conservation")}</h2>
                <p>{t("legal.confidentialite.conservationTexte")}</p>
            </section>

            <section>
                <h2>{t("legal.confidentialite.vosDroits")}</h2>
                <p>
                    {t("legal.confidentialite.vosDroitsTexte")}{" "}
                    <a href="/support">{t("nav.support")}</a>.
                </p>
            </section>
        </div>
    );
}
