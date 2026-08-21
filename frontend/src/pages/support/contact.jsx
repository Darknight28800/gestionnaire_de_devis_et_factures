import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";

export default function Contact() {
    const { t } = useTranslation();
    const [parametres, setParametres] = useState(null);
    const AFAIRE = t("legal.aCompleterParametres");

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
        <div className="page page-legal">
            <h1>{t("support.contact")}</h1>

            <section>
                <h2>{t("legal.contact.uneQuestion")}</h2>
                <p>
                    {t("legal.contact.texteIntro")}{" "}
                    <a href="/support">{t("nav.support")}</a>.
                </p>
            </section>

            <section>
                <h2>{t("legal.contact.coordonnees")}</h2>
                <p>
                    {parametres?.nom_entreprise || AFAIRE}<br />
                    {parametres?.adresse || AFAIRE}<br />
                    {t("commun.email")} : {parametres?.email || AFAIRE}<br />
                    {t("commun.telephone")} : {parametres?.telephone || AFAIRE}
                </p>
            </section>
        </div>
    );
}
