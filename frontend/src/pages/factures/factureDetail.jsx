import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import "../../styles/pages/_factureDetail.scss";

export default function FactureDetail() {
    const { t } = useTranslation();
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

    const marquerPayee = async () => {
        try {
            await api.patch(`/factures/${id}/payer`);
            await rechargerFacture();
        } catch (err) {
            console.error("Erreur marquage payée :", err);
        }
    };

    const archiver = async () => {
        try {
            await api.patch(`/factures/${id}/archiver`);
            await rechargerFacture();
        } catch (err) {
            console.error("Erreur archivage :", err);
        }
    };

    const desarchiver = async () => {
        try {
            await api.patch(`/factures/${id}/desarchiver`);
            await rechargerFacture();
        } catch (err) {
            console.error("Erreur désarchivage :", err);
        }
    };

    if (!facture) return <p>{t("commun.chargement")}</p>;

    const totalHT = facture.lignes.reduce(
        (sum, l) => sum + l.quantite * l.prix,
        0
    );
    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    return (
        <div className="facture-detail">

            <div className="facture-detail__header">
                <h1>{t("nav.factures")} #{facture.id}</h1>

                <div className="actions">
                    {facture.statut !== "payee" && (
                        <button className="btn-primaire" onClick={marquerPayee}>✅ {t("factures.marquerPayee")}</button>
                    )}
                    <button className="btn-texte" onClick={envoyerEmail}>✉️ {t("commun.envoyer")}</button>
                    <button className="btn-primaire" onClick={telechargerPDF}>📄 {t("commun.genererPDF")}</button>
                    {facture.archive_le ? (
                        <button className="btn-texte" onClick={desarchiver}>📤 {t("commun.desarchiver")}</button>
                    ) : (
                        facture.statut === "payee" && (
                            <button className="btn-texte" onClick={archiver}>🗄️ {t("commun.archiver")}</button>
                        )
                    )}
                    <Link className="btn-texte" to="/factures">← {t("commun.retour")}</Link>
                </div>
            </div>

            {facture.archive_le && (
                <p className="message message--succes">
                    📦 {t("factures.archiveeDepuis", { date: new Date(facture.archive_le).toLocaleDateString() })}
                </p>
            )}

            <div className="infos-grid">

                <div className="card">
                    <h3>{t("factures.informationsFacture")}</h3>
                    <p><strong>{t("commun.statut")} :</strong> <span className={`statut statut--${facture.statut}`}>{t(`statuts.facture.${facture.statut}`, facture.statut)}</span></p>
                    <p><strong>{t("commun.date")} :</strong> {new Date(facture.date_creation).toLocaleDateString()}</p>
                </div>

                <div className="card">
                    <h3>{t("commun.client")}</h3>
                    <p><strong>{t("commun.nom")} :</strong> {facture.client.nom}</p>
                    <p><strong>{t("commun.email")} :</strong> {facture.client.email}</p>
                    <p><strong>{t("commun.telephone")} :</strong> {facture.client.telephone}</p>
                </div>

            </div>

            <div className="card">
                <h3>{t("factures.lignesFacture")}</h3>

                <table className="table-lignes">
                    <thead>
                        <tr>
                            <th>{t("commun.description")}</th>
                            <th>{t("devis.qte")}</th>
                            <th>{t("devis.prix")}</th>
                            <th>{t("commun.total")}</th>
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
                <p>{t("devis.totalHT")} : <strong>{totalHT.toFixed(2)} €</strong></p>
                <p>{t("devis.tva")} : <strong>{totalTVA.toFixed(2)} €</strong></p>
                <p>{t("devis.totalTTC")} : <strong>{totalTTC.toFixed(2)} €</strong></p>
            </div>

            <div className="card timeline">
                <h3>{t("commun.historique")}</h3>
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
