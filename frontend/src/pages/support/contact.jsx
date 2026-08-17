import { useEffect, useState } from "react";
import api from "../../api/axios";

const AFAIRE = "à compléter dans Paramètres";

export default function Contact() {
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
        <div className="page page-legal">
            <h1>Contact</h1>

            <section>
                <h2>Une question ?</h2>
                <p>
                    Pour toute demande concernant votre compte, votre abonnement ou l'utilisation de
                    l'application, la façon la plus rapide de nous joindre est de créer un ticket depuis
                    le <a href="/support">Centre d'aide</a>.
                </p>
            </section>

            <section>
                <h2>Coordonnées</h2>
                <p>
                    {parametres?.nom_entreprise || AFAIRE}<br />
                    {parametres?.adresse || AFAIRE}<br />
                    Email : {parametres?.email || AFAIRE}<br />
                    Téléphone : {parametres?.telephone || AFAIRE}
                </p>
            </section>
        </div>
    );
}
