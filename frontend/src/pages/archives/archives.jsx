import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import "../../styles/pages/_archives.scss";

const DUREE_CONSERVATION_ANNEES = 5;

function dateExpiration(archiveLe) {
    const date = new Date(archiveLe);
    date.setFullYear(date.getFullYear() + DUREE_CONSERVATION_ANNEES);
    return date;
}

export default function Archives() {
    const { utilisateur } = useAuth();
    const [onglet, setOnglet] = useState("devis");
    const [devis, setDevis] = useState([]);
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purge, setPurge] = useState(false);
    const [messagePurge, setMessagePurge] = useState(null);

    const charger = async () => {
        setLoading(true);
        try {
            const [resDevis, resFactures] = await Promise.all([
                api.get("/devis/archives"),
                api.get("/factures/archives")
            ]);
            setDevis(resDevis.data.devis);
            setFactures(resFactures.data.factures);
        } catch (err) {
            console.error("Erreur chargement archives :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const desarchiverDevis = async (id) => {
        await api.patch(`/devis/${id}/desarchiver`);
        charger();
    };

    const desarchiverFacture = async (id) => {
        await api.patch(`/factures/${id}/desarchiver`);
        charger();
    };

    const purgerArchives = async () => {
        if (!window.confirm(
            `Cette action supprime définitivement tous les devis et factures archivés depuis plus de ${DUREE_CONSERVATION_ANNEES} ans. Continuer ?`
        )) return;

        setPurge(true);
        setMessagePurge(null);
        try {
            const res = await api.post("/admin/purger-archives");
            setMessagePurge(
                `${res.data.devisSupprimes} devis et ${res.data.facturesSupprimees} facture(s) supprimés définitivement.`
            );
            charger();
        } catch (err) {
            console.error("Erreur purge :", err);
            setMessagePurge("Erreur lors de la purge.");
        } finally {
            setPurge(false);
        }
    };

    if (loading) return <p>Chargement…</p>;

    return (
        <div className="page-archives">
            <div className="archives-header">
                <div>
                    <h1>Archives</h1>
                    <p className="page-lede">
                        Devis et factures terminés, conservés {DUREE_CONSERVATION_ANNEES} ans maximum avant suppression définitive.
                    </p>
                </div>

                {utilisateur?.role === "admin" && (
                    <button className="btn btn-texte" onClick={purgerArchives} disabled={purge}>
                        {purge ? "Purge en cours..." : "Purger les archives expirées"}
                    </button>
                )}
            </div>

            {messagePurge && <p className="message message--succes">{messagePurge}</p>}

            <div className="archives-tabs">
                <button
                    className={onglet === "devis" ? "actif" : ""}
                    onClick={() => setOnglet("devis")}
                >
                    Devis archivés ({devis.length})
                </button>
                <button
                    className={onglet === "factures" ? "actif" : ""}
                    onClick={() => setOnglet("factures")}
                >
                    Factures archivées ({factures.length})
                </button>
            </div>

            {onglet === "devis" && (
                devis.length === 0 ? (
                    <p>Aucun devis archivé.</p>
                ) : (
                    <table className="table-archives">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>Montant</th>
                                <th>Archivé le</th>
                                <th>Suppression définitive prévue</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devis.map((d) => (
                                <tr key={d.id}>
                                    <td>#{d.id}</td>
                                    <td>{d.client_nom}</td>
                                    <td>{d.montant_total} €</td>
                                    <td>{new Date(d.archive_le).toLocaleDateString()}</td>
                                    <td>{dateExpiration(d.archive_le).toLocaleDateString()}</td>
                                    <td className="actions-cellule">
                                        <Link className="btn-lien" to={`/devis/${d.id}`}>Voir →</Link>
                                        <button className="btn-lien" onClick={() => desarchiverDevis(d.id)}>
                                            Désarchiver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}

            {onglet === "factures" && (
                factures.length === 0 ? (
                    <p>Aucune facture archivée.</p>
                ) : (
                    <table className="table-archives">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Montant</th>
                                <th>Archivée le</th>
                                <th>Suppression définitive prévue</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factures.map((f) => (
                                <tr key={f.id}>
                                    <td>#{f.id}</td>
                                    <td>{f.montant} €</td>
                                    <td>{new Date(f.archive_le).toLocaleDateString()}</td>
                                    <td>{dateExpiration(f.archive_le).toLocaleDateString()}</td>
                                    <td className="actions-cellule">
                                        <Link className="btn-lien" to={`/factures/${f.id}`}>Voir →</Link>
                                        <button className="btn-lien" onClick={() => desarchiverFacture(f.id)}>
                                            Désarchiver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
        </div>
    );
}
