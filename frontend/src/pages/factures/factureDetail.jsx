import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "../../styles/pages/_factureDetail.scss";

export default function FactureDetail() {
    const { id } = useParams();
    const [facture, setFacture] = useState(null);

    const rechargerFacture = useCallback(async () => {
        try {
            const res = await api.get(`/factures/${id}`);
            setFacture(res.data);
        } catch (err) {
            console.error("Erreur chargement facture :", err);
        }
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            await rechargerFacture();
        };
        fetchData();
    }, [rechargerFacture]);


    const envoyerEmail = async () => {
        try {
            await api.post(`/emails/envoyer-facture/${id}`);
            rechargerFacture();
        } catch (err) {
            console.error("Erreur email facture :", err);
        }
    };

    const telechargerPDF = async () => {
        try {
            const res = await api.get(`/factures/${id}/pdf`, {
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `facture-${id}.pdf`;
            a.click();
        } catch (err) {
            console.error("Erreur PDF facture :", err);
        }
    };

    if (!facture) return <p>Chargement...</p>;

    const totalHT = facture.lignes.reduce(
        (sum, l) => sum + l.quantite * l.prix,
        0
    );
    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    return (
        <div className="facture-detail">

            <div className="facture-detail__header">
                <h1>Facture #{facture.id}</h1>

                <div className="actions">
                    <button className="btn-texte" onClick={envoyerEmail}>✉️ Envoyer</button>
                    <button className="btn-primaire" onClick={telechargerPDF}>📄 Générer PDF</button>
                </div>
            </div>

            <div className="infos-grid">

                <div className="card">
                    <h3>Informations facture</h3>
                    <p><strong>Statut :</strong> <span className={`statut statut--${facture.statut}`}>{facture.statut}</span></p>
                    <p><strong>Date :</strong> {new Date(facture.date_creation).toLocaleDateString()}</p>
                </div>

                <div className="card">
                    <h3>Client</h3>
                    <p><strong>Nom :</strong> {facture.client.nom}</p>
                    <p><strong>Email :</strong> {facture.client.email}</p>
                    <p><strong>Téléphone :</strong> {facture.client.telephone}</p>
                </div>

            </div>

            <div className="card">
                <h3>Lignes de la facture</h3>

                <table className="table-lignes">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qté</th>
                            <th>Prix</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facture.lignes.map((l, i) => (
                            <tr key={i}>
                                <td>{l.description}</td>
                                <td>{l.quantite}</td>
                                <td>{l.prix} €</td>
                                <td>{(l.quantite * l.prix).toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="totaux">
                <p>Total HT : <strong>{totalHT.toFixed(2)} €</strong></p>
                <p>TVA (20%) : <strong>{totalTVA.toFixed(2)} €</strong></p>
                <p>Total TTC : <strong>{totalTTC.toFixed(2)} €</strong></p>
            </div>

            <div className="card timeline">
                <h3>Historique</h3>
                <ul>
                    {facture.historique.map((event, i) => (
                        <li key={i}>
                            <span className="dot"></span>
                            <div>
                                <p>{event.message}</p>
                                <small>{new Date(event.date).toLocaleString()}</small>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}
