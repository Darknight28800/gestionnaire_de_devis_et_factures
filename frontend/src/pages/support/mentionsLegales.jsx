import { useEffect, useState } from "react";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";

const AFAIRE = "à compléter dans Paramètres";

export default function MentionsLegales() {
    const { utilisateur } = useAuth();
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

    const nom = parametres?.nom_entreprise || AFAIRE;
    const formeJuridique = parametres?.forme_juridique || AFAIRE;
    const adresse = parametres?.adresse || AFAIRE;
    const siret = parametres?.siret || AFAIRE;
    const email = parametres?.email || AFAIRE;
    const hebergeur = parametres?.hebergeur;

    return (
        <div className="page page-legal">
            <h1>Mentions légales</h1>
            <p className="page-legal__maj">
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
            </p>

            <section>
                <h2>Éditeur du site</h2>
                <p>
                    {nom}<br />
                    {formeJuridique}<br />
                    Siège social : {adresse}<br />
                    SIRET : {siret}<br />
                    Directeur de la publication : {utilisateur?.nom || AFAIRE}<br />
                    Email : {email}
                </p>
            </section>

            <section>
                <h2>Hébergement</h2>
                <p>
                    {hebergeur
                        ? <>Ce site est hébergé par {hebergeur}.</>
                        : "Application à usage interne, non hébergée publiquement à ce jour."}
                </p>
            </section>

            <section>
                <h2>Propriété intellectuelle</h2>
                <p>
                    L'ensemble des contenus de cette application (textes, logos, structure) est la
                    propriété de {nom}, sauf mention contraire. Toute reproduction sans
                    autorisation préalable est interdite.
                </p>
            </section>

            <section>
                <h2>Données personnelles</h2>
                <p>
                    Le traitement de vos données personnelles est détaillé dans notre{" "}
                    <a href="/support/confidentialite">politique de confidentialité</a>.
                </p>
            </section>

            {(nom === AFAIRE || formeJuridique === AFAIRE || adresse === AFAIRE || siret === AFAIRE) && (
                <p className="parametres-section__aide">
                    Certaines informations ci-dessus sont incomplètes. Rendez-vous dans{" "}
                    <a href="/parametres">Paramètres</a> pour les renseigner — cette page se met à jour
                    automatiquement.
                </p>
            )}
        </div>
    );
}
