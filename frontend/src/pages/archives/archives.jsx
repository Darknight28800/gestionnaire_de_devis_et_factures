import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { useDialog } from "../../contexte/dialogProvider";
import "../../styles/pages/_archives.scss";

const DUREE_CONSERVATION_ANNEES = 5;

function dateExpiration(archiveLe) {
    const date = new Date(archiveLe);
    date.setFullYear(date.getFullYear() + DUREE_CONSERVATION_ANNEES);
    return date;
}

export default function Archives() {
    const { t } = useTranslation();
    const { utilisateur } = useAuth();
    const { confirmer } = useDialog();
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
        const ok = await confirmer(t("archives.confirmerPurge", { annees: DUREE_CONSERVATION_ANNEES }), { variante: "danger", texteConfirmer: t("commun.supprimer") });
        if (!ok) return;

        setPurge(true);
        setMessagePurge(null);
        try {
            const res = await api.post("/admin/purger-archives");
            setMessagePurge(
                t("archives.resultatPurge", { devis: res.data.devisSupprimes, factures: res.data.facturesSupprimees })
            );
            charger();
        } catch (err) {
            console.error("Erreur purge :", err);
            setMessagePurge(t("archives.erreurPurge"));
        } finally {
            setPurge(false);
        }
    };

    if (loading) return <p>{t("commun.chargement")}</p>;

    return (
        <div className="page-archives">
            <div className="archives-header">
                <div>
                    <h1>{t("nav.archives")}</h1>
                    <p className="page-lede">
                        {t("archives.description", { annees: DUREE_CONSERVATION_ANNEES })}
                    </p>
                </div>

                {utilisateur?.role === "admin" && (
                    <button className="btn btn-texte" onClick={purgerArchives} disabled={purge}>
                        {purge ? t("archives.purgeEnCours") : t("archives.purgerExpirees")}
                    </button>
                )}
            </div>

            {messagePurge && <p className="message message--succes">{messagePurge}</p>}

            <div className="archives-tabs">
                <button
                    className={onglet === "devis" ? "actif" : ""}
                    onClick={() => setOnglet("devis")}
                >
                    {t("archives.devisArchives")} ({devis.length})
                </button>
                <button
                    className={onglet === "factures" ? "actif" : ""}
                    onClick={() => setOnglet("factures")}
                >
                    {t("archives.facturesArchivees")} ({factures.length})
                </button>
            </div>

            {onglet === "devis" && (
                devis.length === 0 ? (
                    <p>{t("archives.aucunDevis")}</p>
                ) : (
                    <table className="table-archives">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t("commun.client")}</th>
                                <th>{t("commun.montant")}</th>
                                <th>{t("archives.archiveLe")}</th>
                                <th>{t("archives.suppressionPrevue")}</th>
                                <th>{t("commun.actions")}</th>
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
                                        <Link className="btn-lien" to={`/devis/${d.id}`}>{t("commun.voir")} →</Link>
                                        <button className="btn-lien" onClick={() => desarchiverDevis(d.id)}>
                                            {t("commun.desarchiver")}
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
                    <p>{t("archives.aucuneFacture")}</p>
                ) : (
                    <table className="table-archives">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t("commun.montant")}</th>
                                <th>{t("archives.archiveeLe")}</th>
                                <th>{t("archives.suppressionPrevue")}</th>
                                <th>{t("commun.actions")}</th>
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
                                        <Link className="btn-lien" to={`/factures/${f.id}`}>{t("commun.voir")} →</Link>
                                        <button className="btn-lien" onClick={() => desarchiverFacture(f.id)}>
                                            {t("commun.desarchiver")}
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
