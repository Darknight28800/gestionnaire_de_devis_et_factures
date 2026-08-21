import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";

export default function MentionsLegales() {
    const { t, i18n } = useTranslation();
    const { utilisateur } = useAuth();
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

    const nom = parametres?.nom_entreprise || AFAIRE;
    const formeJuridique = parametres?.forme_juridique || AFAIRE;
    const adresse = parametres?.adresse || AFAIRE;
    const siret = parametres?.siret || AFAIRE;
    const email = parametres?.email || AFAIRE;
    const hebergeur = parametres?.hebergeur;

    return (
        <div className="page page-legal">
            <h1>{t("legal.mentionsLegales.titre")}</h1>
            <p className="page-legal__maj">
                {t("legal.derniereMaj")} : {new Date().toLocaleDateString(i18n.language, { year: "numeric", month: "long" })}
            </p>

            <section>
                <h2>{t("legal.mentionsLegales.editeurSite")}</h2>
                <p>
                    {nom}<br />
                    {formeJuridique}<br />
                    {t("legal.mentionsLegales.siegeSocial")} : {adresse}<br />
                    SIRET : {siret}<br />
                    {t("legal.mentionsLegales.directeurPublication")} : {utilisateur?.nom || AFAIRE}<br />
                    {t("commun.email")} : {email}
                </p>
            </section>

            <section>
                <h2>{t("legal.mentionsLegales.hebergement")}</h2>
                <p>
                    {hebergeur
                        ? t("legal.mentionsLegales.hebergePar", { hebergeur })
                        : t("legal.mentionsLegales.pasHeberge")}
                </p>
            </section>

            <section>
                <h2>{t("legal.mentionsLegales.proprieteIntellectuelle")}</h2>
                <p>{t("legal.mentionsLegales.proprieteIntellectuelleTexte", { nom })}</p>
            </section>

            <section>
                <h2>{t("legal.mentionsLegales.donneesPersonnelles")}</h2>
                <p>
                    {t("legal.mentionsLegales.donneesPersonnellesTexte")}{" "}
                    <a href="/support/confidentialite">{t("support.confidentialite")}</a>.
                </p>
            </section>

            {(nom === AFAIRE || formeJuridique === AFAIRE || adresse === AFAIRE || siret === AFAIRE) && (
                <p className="parametres-section__aide">
                    {t("legal.mentionsLegales.informationsIncompletes")}{" "}
                    <a href="/parametres">{t("nav.parametres")}</a> {t("legal.mentionsLegales.pourLesRenseigner")}
                </p>
            )}
        </div>
    );
}
