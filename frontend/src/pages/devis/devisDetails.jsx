import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import { useDialog } from "../../contexte/dialogProvider";
import "../../styles/pages/_devisDetail.scss";

export default function DevisDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { alerter } = useDialog();
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
        const fetchData = async () => {
            await rechargerDevis();
        };
        fetchData();
    }, [rechargerDevis]);

    /* ============================
       ENVOI EMAIL
    ============================ */
    const envoyerEmail = async () => {
        try {
            await api.post(`/emails/envoyer-devis/${id}`);
            await rechargerDevis();
        } catch (err) {
            console.error("Erreur lors de l'envoi de l'email :", err);
        }
    };

    /* ============================
       PDF
    ============================ */
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

    const convertirEnFacture = async () => {
        try {
            const res = await api.post(`/factures/convertir/${id}`);
            navigate(`/factures/${res.data.facture.id}`);
        } catch (err) {
            console.error("Erreur conversion en facture :", err);
            await alerter(t("devis.erreurConversion"));
        }
    };

    const archiver = async () => {
        try {
            await api.patch(`/devis/${id}/archiver`);
            await rechargerDevis();
        } catch (err) {
            console.error("Erreur archivage :", err);
        }
    };

    const desarchiver = async () => {
        try {
            await api.patch(`/devis/${id}/desarchiver`);
            await rechargerDevis();
        } catch (err) {
            console.error("Erreur désarchivage :", err);
        }
    };

    if (!devis) return <p>{t("commun.chargement")}</p>;

    const totalHT = devis.lignes.reduce(
        (sum, l) => sum + l.quantite * l.prix,
        0
    );
    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    return (
        <div className="devis-detail">

            <div className="devis-detail__header">
                <h1>{t("nav.devis")} #{devis.id}</h1>

                <div className="actions">
                    {devis.statut === "accepte" && !devis.archive_le && (
                        <button className="btn-primaire" onClick={convertirEnFacture}>🧾 {t("devis.convertirEnFacture")}</button>
                    )}
                    <button className="btn-texte" onClick={envoyerEmail}>✉️ {t("commun.envoyer")}</button>
                    <button className="btn-primaire" onClick={telechargerPDF}>📄 {t("commun.genererPDF")}</button>
                    {devis.archive_le ? (
                        <button className="btn-texte" onClick={desarchiver}>📤 {t("commun.desarchiver")}</button>
                    ) : (
                        (devis.statut === "accepte" || devis.statut === "refuse") && (
                            <button className="btn-texte" onClick={archiver}>🗄️ {t("commun.archiver")}</button>
                        )
                    )}
                    <Link className="btn-texte" to="/devis">← {t("commun.retour")}</Link>
                </div>
            </div>

            {devis.archive_le && (
                <p className="message message--succes">
                    📦 {t("devis.archiveDepuis", { date: new Date(devis.archive_le).toLocaleDateString() })}
                </p>
            )}

            <div className="infos-grid">

                <div className="card">
                    <h3>{t("devis.informationsDevis")}</h3>
                    <p><strong>{t("devis.titreDevis")} :</strong> {devis.titre}</p>
                    <p><strong>{t("commun.description")} :</strong> {devis.description}</p>
                    <p><strong>{t("commun.statut")} :</strong> <span className={`statut statut--${devis.statut}`}>{t(`statuts.devis.${devis.statut}`, devis.statut)}</span></p>
                    <p><strong>{t("commun.date")} :</strong> {new Date(devis.date_creation).toLocaleDateString()}</p>
                </div>

                <div className="card">
                    <h3>{t("commun.client")}</h3>
                    <p><strong>{t("commun.nom")} :</strong> {devis.client.nom}</p>
                    <p><strong>{t("commun.email")} :</strong> {devis.client.email}</p>
                    <p><strong>{t("commun.telephone")} :</strong> {devis.client.telephone}</p>
                </div>

            </div>

            <div className="card">
                <h3>{t("devis.lignesDevis")}</h3>

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
                <p>{t("devis.totalHT")} : <strong>{totalHT.toFixed(2)} €</strong></p>
                <p>{t("devis.tva")} : <strong>{totalTVA.toFixed(2)} €</strong></p>
                <p>{t("devis.totalTTC")} : <strong>{totalTTC.toFixed(2)} €</strong></p>
            </div>

            <div className="card timeline">
                <h3>{t("commun.historique")}</h3>
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
