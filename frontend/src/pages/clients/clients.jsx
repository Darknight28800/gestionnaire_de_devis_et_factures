import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import Modal from "../../composants/modal";
import { useDialog } from "../../contexte/dialogProvider";
import "../../styles/pages/_clients.scss";

export default function Clients() {
    const { t } = useTranslation();
    const { confirmer, alerter } = useDialog();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);

    const [modalOuvert, setModalOuvert] = useState(false);
    const [modeEdition, setModeEdition] = useState(false);
    const [clientActuel, setClientActuel] = useState(null);

    const [form, setForm] = useState({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        ville: "",
        code_postal: "",
        pays: "",
        statut: "actif"
    });

    /* ============================
       CHARGER LES CLIENTS
    ============================ */
    useEffect(() => {
        const charger = async () => {
            try {
                setLoading(true);
                const res = await api.get("/clients");
                setClients(res.data);
                setErreur(null);
            } catch (e) {
                console.error(e);
                setErreur(t("clients.erreurChargement"));
            } finally {
                setLoading(false);
            }
        };

        charger();
    }, [t]);

    /* ============================
       OUVERTURE MODAL CREATION
    ============================ */
    const ouvrirCreation = () => {
        setModeEdition(false);
        setClientActuel(null);
        setForm({
            nom: "",
            email: "",
            telephone: "",
            adresse: "",
            ville: "",
            code_postal: "",
            pays: "",
            statut: "actif"
        });
        setModalOuvert(true);
    };

    /* ============================
       OUVERTURE MODAL EDITION
    ============================ */
    const ouvrirEdition = (client) => {
        setModeEdition(true);
        setClientActuel(client);
        setForm({
            nom: client.nom || "",
            email: client.email || "",
            telephone: client.telephone || "",
            adresse: client.adresse || "",
            ville: client.ville || "",
            code_postal: client.code_postal || "",
            pays: client.pays || "",
            statut: client.statut || "actif"
        });
        setModalOuvert(true);
    };

    /* ============================
       GESTION DES CHAMPS
    ============================ */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /* ============================
       SOUMISSION FORMULAIRE
    ============================ */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (modeEdition && clientActuel) {
                await api.put(`/clients/${clientActuel.id}`, form);
            } else {
                await api.post("/clients", form);
            }

            setModalOuvert(false);

            const res = await api.get("/clients");
            setClients(res.data);

        } catch (e) {
            console.error(e);
            await alerter(t("clients.erreurEnregistrement"));
        }
    };

    /* ============================
       SUPPRESSION CLIENT
    ============================ */
    const supprimerClient = async (client) => {
        const ok = await confirmer(t("clients.confirmerSuppression", { nom: client.nom }), { variante: "danger", texteConfirmer: t("commun.supprimer") });
        if (!ok) return;

        try {
            await api.delete(`/clients/${client.id}`);

            const res = await api.get("/clients");
            setClients(res.data);

        } catch (e) {
            console.error(e);
            await alerter(e.response?.data?.message || t("clients.erreurSuppression"));
        }
    };

    if (loading) return <p>{t("clients.chargementClients")}</p>;

    return (
        <div className="clients-page">

            {/* HEADER */}
            <div className="clients-header">
                <h1>{t("nav.clients")}</h1>

                <div className="actions" data-tour="clients-nouveau">
                    <button className="btn btn-primaire" onClick={ouvrirCreation}>
                        + {t("clients.nouveauClient")}
                    </button>
                </div>
            </div>

            {erreur && <p className="page-clients__erreur">{erreur}</p>}

            {/* TABLEAU */}
            {clients.length === 0 ? (
                <p>{t("clients.aucunClient")}</p>
            ) : (
                <table className="table-clients" data-tour="clients-tableau">
                    <thead>
                        <tr>
                            <th>{t("commun.nom")}</th>
                            <th>{t("commun.email")}</th>
                            <th>{t("commun.telephone")}</th>
                            <th>{t("commun.ville")}</th>
                            <th>{t("commun.statut")}</th>
                            <th style={{ width: "140px" }}>{t("commun.actions")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {clients.map((c) => (
                            <tr key={c.id}>
                                <td>{c.nom}</td>
                                <td>{c.email}</td>
                                <td>{c.telephone}</td>
                                <td>{c.ville}</td>
                                <td>
                                    <span className={`statut statut--${c.statut}`}>
                                        {t(`statuts.client.${c.statut}`, c.statut)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-texte"
                                        onClick={() => ouvrirEdition(c)}
                                    >
                                        {t("commun.modifier")}
                                    </button>

                                    <button
                                        className="btn-texte btn-danger"
                                        onClick={() => supprimerClient(c)}
                                    >
                                        {t("commun.supprimer")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* MODAL */}
            <Modal
                open={modalOuvert}
                title={modeEdition ? t("clients.modifierClient") : t("clients.nouveauClient")}
                onClose={() => setModalOuvert(false)}
            >
                <form onSubmit={handleSubmit} className="form-client">

                    <div className="form-ligne">
                        <label>{t("commun.nom")}</label>
                        <input
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-ligne">
                        <label>{t("commun.email")}</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-ligne">
                        <label>{t("commun.telephone")}</label>
                        <input
                            name="telephone"
                            value={form.telephone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-ligne">
                        <label>{t("commun.adresse")}</label>
                        <input
                            name="adresse"
                            value={form.adresse}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-ligne form-ligne--2">
                        <div>
                            <label>{t("commun.ville")}</label>
                            <input
                                name="ville"
                                value={form.ville}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label>{t("commun.codePostal")}</label>
                            <input
                                name="code_postal"
                                value={form.code_postal}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-ligne">
                        <label>{t("commun.pays")}</label>
                        <input
                            name="pays"
                            value={form.pays}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-ligne">
                        <label>{t("commun.statut")}</label>
                        <select
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                        >
                            <option value="actif">{t("commun.actif")}</option>
                            <option value="inactif">{t("commun.inactif")}</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-texte"
                            onClick={() => setModalOuvert(false)}
                        >
                            {t("commun.annuler")}
                        </button>
                        <button type="submit" className="btn btn-primaire">
                            {modeEdition ? t("commun.enregistrer") : t("commun.creer")}
                        </button>
                    </div>

                </form>
            </Modal>

        </div>
    );
}
