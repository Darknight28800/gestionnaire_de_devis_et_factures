import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Footer() {
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
                        {parametres?.nom_entreprise ? "FacturePro by SphereWeb" : "by SphereWeb"}
                    </p>
                    {parametres?.adresse && <p>{parametres.adresse}</p>}
                    {parametres?.siret && <p>SIRET : {parametres.siret}</p>}
                    <p>© {new Date().getFullYear()} — Tous droits réservés.</p>
                </div>

                <div className="footer-col">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/clients">Clients</a></li>
                        <li><a href="/devis">Devis</a></li>
                        <li><a href="/factures">Factures</a></li>
                        <li><a href="/parametres">Paramètres</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="/support">Centre d’aide</a></li>
                        <li><a href="/support/contact">Contact</a></li>
                        <li><a href="/support/mentions-legales">Mentions légales</a></li>
                        <li><a href="/support/confidentialite">Confidentialité</a></li>
                    </ul>
                </div>

            </div>
        </footer>
    );
}
