import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "../../styles/pages/_devisDetail.scss";

export default function DevisDetail() {
    const { id } = useParams();
    const [devis, setDevis] = useState(null);

    const rechargerDevis = useCallback(async () => {
        try {
            const res = await api.get(`/devis/${id}`);
            setDevis(res.data);
        } catch (err) {
            console.error("Erreur lors du chargement du devis :", err);
        }
    }, [id]);

    useEffect(() => {
        const run = async () => {
            await rechargerDevis();
        };
        run();
    }, [rechargerDevis]);

    const envoyerEmail = async () => {
        try {
            await api.post(`/emails/envoyer-devis/${id}`);
            rechargerDevis();
        } catch (err) {
            console.error("Erreur lors de l'envoi de l'email :", err);
        }
    };

    const telechargerPDF = async () => {
        try {
            const res = await api.get(`/devis/${id}/pdf`, {
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `devis-${id}.pdf`;
            a.click();
        } catch (err) {
            console.error("Erreur PDF :", err);
        }
    };

    if (!devis) return <p>Chargement...</p>;

    const totalHT = devis.lignes.reduce(
        (sum, l) => sum + l.quantite * l.prix,
        0
    );
    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    return (
        <div className="devis-detail">

            <div className="devis-detail__header">
                <h1>Devis #{devis.id}</h1>

                <div className="actions">
                    <button className="btn-texte" onClick={envoyerEmail}>✉️ Envoyer</button>
                    <button className="btn-primaire" onClick={telechargerPDF}>📄 Générer PDF</button>
                </div>
            </div>

            <div className="infos-grid">

                <div className="card">
                    <h3>Informations du devis</h3>
                    <p><strong>Statut :</strong> <span className={`statut statut--${devis.statut}`}>{devis.statut}</span></p>
                    <p><strong>Date :</strong> {new Date(devis.date_creation).toLocaleDateString()}</p>
                </div>

                <div className="card">
                    <h3>Client</h3>
                    <p><strong>Nom :</strong> {devis.client.nom}</p>
                    <p><strong>Email :</strong> {devis.client.email}</p>
                    <p><strong>Téléphone :</strong> {devis.client.telephone}</p>
                </div>

            </div>

            <div className="card">
                <h3>Lignes du devis</h3>

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
                        {devis.lignes.map((l, i) => (
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
                    {devis.historique.map((event, i) => (
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
