import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import Modal from "../../composants/modal";
import useAuth from "../../hooks/useAuth";
import { useDialog } from "../../contexte/dialogProvider";
import "../../styles/pages/_factures.scss";

const LIGNE_VIDE = { description: "", quantite: 1, prix: 0 };

export default function Factures() {
    const { t } = useTranslation();
    const { utilisateur } = useAuth();
    const { confirmer, alerter } = useDialog();
    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [modeEdition, setModeEdition] = useState(false);
    const [factureActuelle, setFactureActuelle] = useState(null);

    const [form, setForm] = useState({
        client_id: "",
        statut: "non_payee",
        lignes: [{ ...LIGNE_VIDE }]
    });

    const charger = async () => {
        try {
            const res = await api.get(
                `/factures?search=${search}&page=${page}&limit=5&sort=date_facture&order=desc`
            );
            setFactures(res.data.factures);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Erreur lors du chargement des factures :", err);
        }
    };

    const chargerClients = async () => {
        const res = await api.get("/clients");
        setClients(res.data);
    };

    useEffect(() => {
        charger();
    }, [search, page]);

    useEffect(() => {
        chargerClients();
    }, []);

    const ouvrirCreation = () => {
        setModeEdition(false);
        setFactureActuelle(null);
        setForm({ client_id: "", statut: "non_payee", lignes: [{ ...LIGNE_VIDE }] });
        setModalOpen(true);
    };

    const ouvrirEdition = async (facture) => {
        try {
            const res = await api.get(`/factures/${facture.id}`);
            const data = res.data;
            setModeEdition(true);
            setFactureActuelle(data);
            setForm({
                client_id: data.client_id,
                statut: data.statut,
                lignes: data.lignes.length ? data.lignes : [{ ...LIGNE_VIDE }]
            });
            setModalOpen(true);
        } catch (err) {
            console.error("Erreur chargement facture :", err);
        }
    };

    const ajouterLigne = () => {
        setForm((prev) => ({ ...prev, lignes: [...prev.lignes, { ...LIGNE_VIDE }] }));
    };

    const supprimerLigne = (index) => {
        setForm((prev) => ({ ...prev, lignes: prev.lignes.filter((_, i) => i !== index) }));
    };

    const changerLigne = (index, field, value) => {
        const lignes = [...form.lignes];
        lignes[index][field] = value;
        setForm({ ...form, lignes });
    };

    /* Vide le champ dès qu'on clique dedans, pour que l'utilisateur n'ait jamais
       à effacer manuellement une valeur existante avant de taper la sienne. */
    const viderChamp = (index, field) => {
        changerLigne(index, field, "");
    };

    /* Si l'utilisateur quitte le champ sans rien saisir, on remet une valeur par défaut
       valide pour ne pas casser le calcul ni l'enregistrement. */
    const remplirSiVide = (index, field, valeurDefaut) => {
        if (form.lignes[index][field] === "") {
            changerLigne(index, field, valeurDefaut);
        }
    };

    const totalHT = form.lignes.reduce(
        (sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix) || 0),
        0
    );
    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    const envoyer = async (e) => {
        e.preventDefault();

        const data = {
            ...form,
            lignes: form.lignes.map((l) => ({
                ...l,
                quantite: Number(l.quantite) || 0,
                prix: Number(l.prix) || 0
            })),
            montant: totalHT
        };

        try {
            if (modeEdition && factureActuelle) {
                await api.put(`/factures/${factureActuelle.id}`, data);
            } else {
                await api.post("/factures", data);
            }

            setModalOpen(false);
            charger();
        } catch (err) {
            console.error(err.response?.data);
            await alerter(t("factures.erreurEnregistrement"));
        }
    };

    const supprimerFacture = async (f) => {
        const ok = await confirmer(t("factures.confirmerSuppression", { id: f.id }), { variante: "danger", texteConfirmer: t("commun.supprimer") });
        if (!ok) return;

        try {
            await api.delete(`/factures/${f.id}`);
            charger();
        } catch (err) {
            console.error(err);
            await alerter(t("factures.erreurSuppression"));
        }
    };

    return (
        <div className="factures-page">

            <div className="factures-header">
                <h1>{t("nav.factures")}</h1>

                <div className="factures-header__actions">
                    <input
                        type="text"
                        className="input-search"
                        placeholder={t("factures.rechercher")}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                    />
                    <button className="btn btn-primaire" onClick={ouvrirCreation} data-tour="factures-nouvelle">
                        + {t("factures.nouvelleFacture")}
                    </button>
                </div>
            </div>

            <table className="table-factures" data-tour="factures-tableau">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>{t("commun.montant")}</th>
                        <th>{t("commun.date")}</th>
                        <th>{t("commun.statut")}</th>
                        <th>{t("commun.actions")}</th>
                    </tr>
                </thead>

                <tbody>
                    {factures.map((f) => (
                        <tr key={f.id}>
                            <td>#{f.id}</td>
                            <td>{f.montant} €</td>
                            <td>{new Date(f.date_facture).toLocaleDateString()}</td>

                            <td>
                                <span className={`statut statut--${f.statut}`}>
                                    {t(`statuts.facture.${f.statut}`, f.statut)}
                                </span>
                            </td>

                            <td className="actions-cellule">
                                <Link className="btn-lien" to={`/factures/${f.id}`}>
                                    {t("commun.voir")} →
                                </Link>
                                <button className="btn-lien" onClick={() => ouvrirEdition(f)}>
                                    {t("commun.modifier")}
                                </button>
                                {utilisateur?.role === "admin" && (
                                    <button className="btn-texte btn-danger" onClick={() => supprimerFacture(f)}>
                                        {t("commun.supprimer")}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    className="btn-texte"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    ← {t("commun.precedent")}
                </button>

                <span className="pagination__info">
                    {t("commun.page")} {page} / {totalPages}
                </span>

                <button
                    className="btn-texte"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    {t("commun.suivant")} →
                </button>
            </div>

            <Modal
                open={modalOpen}
                title={modeEdition ? t("factures.modifierFacture") : t("factures.nouvelleFacture")}
                onClose={() => setModalOpen(false)}
                taille="large"
            >
                <form onSubmit={envoyer} className="form-devis">

                    <div className="form-ligne">
                        <label>{t("commun.client")}</label>
                        <select
                            value={form.client_id}
                            onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })}
                            required
                        >
                            <option value="">{t("devis.selectionnerClient")}</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-ligne">
                        <label>{t("commun.statut")}</label>
                        <select
                            value={form.statut}
                            onChange={(e) => setForm({ ...form, statut: e.target.value })}
                        >
                            <option value="non_payee">{t("statuts.facture.non_payee")}</option>
                            <option value="payee">{t("statuts.facture.payee")}</option>
                        </select>
                    </div>

                    <h3>{t("factures.lignesFacture")}</h3>

                    <div className="ligne-devis ligne-devis--entete">
                        <span>{t("commun.description")}</span>
                        <span>{t("devis.quantite")}</span>
                        <span>{t("devis.prixUnitaire")}</span>
                        <span></span>
                    </div>

                    {form.lignes.map((ligne, index) => (
                        <div key={index} className="ligne-devis">
                            <input
                                placeholder={t("devis.placeholderDescription")}
                                aria-label={t("devis.descriptionLigne")}
                                value={ligne.description}
                                onChange={(e) => changerLigne(index, "description", e.target.value)}
                            />
                            <input
                                type="number"
                                min="1"
                                aria-label={t("devis.quantite")}
                                title={t("devis.quantite")}
                                value={ligne.quantite}
                                onFocus={() => viderChamp(index, "quantite")}
                                onBlur={() => remplirSiVide(index, "quantite", 1)}
                                onChange={(e) => changerLigne(index, "quantite", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                aria-label={t("devis.prixUnitaireEuros")}
                                title={t("devis.prixUnitaire")}
                                value={ligne.prix}
                                onFocus={() => viderChamp(index, "prix")}
                                onBlur={() => remplirSiVide(index, "prix", 0)}
                                onChange={(e) => changerLigne(index, "prix", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <button
                                type="button"
                                className="btn-icone"
                                aria-label={t("devis.supprimerLigne")}
                                onClick={() => supprimerLigne(index)}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn-primaire btn-ajout-ligne"
                        onClick={ajouterLigne}
                    >
                        + {t("devis.ajouterLigne")}
                    </button>

                    <div className="totaux">
                        <p>{t("devis.totalHT")} : <strong>{totalHT.toFixed(2)} €</strong></p>
                        <p>{t("devis.tva")} : <strong>{totalTVA.toFixed(2)} €</strong></p>
                        <p>{t("devis.totalTTC")} : <strong>{totalTTC.toFixed(2)} €</strong></p>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-texte" onClick={() => setModalOpen(false)}>
                            {t("commun.annuler")}
                        </button>
                        <button type="submit" className="btn-primaire">
                            {modeEdition ? t("commun.enregistrer") : t("factures.creerFacture")}
                        </button>
                    </div>

                </form>
            </Modal>

        </div>
    );
}
