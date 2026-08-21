import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axios";

export default function Footer() {
    const { t } = useTranslation();
    const [parametres, setParametres] = useState(null);

    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/parametres");
                setParametres(res.data);
            } catch (err) {
                console.error("Erreur chargement paramètres :", err);
            }
        };
        charger();
    }, []);

    return (
        <footer className="footer-premium">
            <div className="footer-container">

                <div className="footer-col brand">
                    <h3>{parametres?.nom_entreprise || "FacturePro"}</h3>
                    <p className="footer-col__credit">
                        {parametres?.nom_entreprise ? t("commun.footerCreditAvecNom") : t("commun.footerCreditSansNom")}
                    </p>
                    {parametres?.adresse && <p>{parametres.adresse}</p>}
                    {parametres?.siret && <p>{t("commun.siret")} : {parametres.siret}</p>}
                    <p>© {new Date().getFullYear()} — {t("commun.tousDroitsReserves")}</p>
                </div>

                <div className="footer-col">
                    <h4>{t("nav.navigation")}</h4>
                    <ul>
                        <li><a href="/clients">{t("nav.clients")}</a></li>
                        <li><a href="/devis">{t("nav.devis")}</a></li>
                        <li><a href="/factures">{t("nav.factures")}</a></li>
                        <li><a href="/parametres">{t("nav.parametres")}</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>{t("nav.support")}</h4>
                    <ul>
                        <li><a href="/support">{t("support.centreAide")}</a></li>
                        <li><a href="/support/contact">{t("support.contact")}</a></li>
                        <li><a href="/support/mentions-legales">{t("legal.mentionsLegales.titre")}</a></li>
                        <li><a href="/support/confidentialite">{t("legal.confidentialite.titre")}</a></li>
                    </ul>
                </div>

            </div>
        </footer>
    );
}
