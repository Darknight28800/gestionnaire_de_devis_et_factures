import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import Modal from "../../composants/modal";
import useAuth from "../../hooks/useAuth";
import "../../styles/pages/_devis.scss";

export default function Devis() {
    const { t } = useTranslation();
    const { utilisateur } = useAuth();
    const navigate = useNavigate();
    const [devis, setDevis] = useState([]);
    const [clients, setClients] = useState([]);
    const [conversionEnCours, setConversionEnCours] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modeEdition, setModeEdition] = useState(false);
    const [devisActuel, setDevisActuel] = useState(null);

    const [form, setForm] = useState({
        client_id: "",
        titre: "",
        description: "",
        statut: "brouillon",
        lignes: [{ description: "", quantite: 1, prix: 0 }]
    });

    /* ============================
       CHARGER LES DONNÉES
    ============================ */
    const rechargerDevis = async () => {
        const res = await api.get("/devis");
        setDevis(res.data);
    };

    const chargerClients = async () => {
        const res = await api.get("/clients");
        setClients(res.data);
    };

    useEffect(() => {
        const fetchData = async () => {
            await rechargerDevis();
            await chargerClients();
        };
        fetchData();
    }, []);

    /* ============================
       OUVERTURE MODAL CREATION
    ============================ */
    const ouvrirCreationDevis = () => {
        setModeEdition(false);
        setDevisActuel(null);
        setForm({
            client_id: "",
            titre: "",
            description: "",
            statut: "brouillon",
            lignes: [{ description: "", quantite: 1, prix: 0 }]
        });
        setModalOpen(true);
    };

    const ouvrirEditionDevis = async (d) => {
        try {
            const res = await api.get(`/devis/${d.id}`);
            const data = res.data;
            setModeEdition(true);
            setDevisActuel(data);
            setForm({
                client_id: data.client_id,
                titre: data.titre || "",
                description: data.description || "",
                statut: data.statut,
                lignes: data.lignes.length
                    ? data.lignes
                    : [{ description: "", quantite: 1, prix: 0 }]
            });
            setModalOpen(true);
        } catch (err) {
            console.error("Erreur chargement devis :", err);
        }
    };

    /* ============================
       GESTION DES LIGNES
    ============================ */
    const ajouterLigne = () => {
        setForm((prev) => ({
            ...prev,
            lignes: [...prev.lignes, { description: "", quantite: 1, prix: 0 }]
        }));
    };

    const supprimerLigne = (index) => {
        setForm((prev) => ({
            ...prev,
            lignes: prev.lignes.filter((_, i) => i !== index)
        }));
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

    /* ============================
       CALCULS
    ============================ */
    const totalHT = form.lignes.reduce(
        (sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix) || 0),
        0
    );

    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    /* ============================
       ENVOI FORMULAIRE
    ============================ */
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
            if (modeEdition && devisActuel) {
                await api.put(`/devis/${devisActuel.id}`, data);
            } else {
                await api.post("/devis", data);
            }

            setModalOpen(false);
            rechargerDevis();

        } catch (err) {
            console.error(err.response?.data);
            alert(t("devis.erreurEnregistrement"));
        }
    };

    /* ============================
       CONVERSION EN FACTURE (1 clic)
    ============================ */
    const convertirEnFacture = async (d) => {
        setConversionEnCours(d.id);
        try {
            const res = await api.post(`/factures/convertir/${d.id}`);
            navigate(`/factures/${res.data.facture.id}`);
        } catch (err) {
            console.error(err);
            alert(t("devis.erreurConversion"));
        } finally {
            setConversionEnCours(null);
        }
    };

    /* ============================
       SUPPRESSION
    ============================ */
    const supprimerDevis = async (d) => {
        if (!window.confirm(t("devis.confirmerSuppression", { id: d.id }))) return;

        try {
            await api.delete(`/devis/${d.id}`);
            rechargerDevis();
        } catch (err) {
            console.error(err);
            alert(t("devis.erreurSuppression"));
        }
    };

    return (
        <div className="devis-page">

            {/* HEADER */}
            <div className="devis-header">
                <h1>{t("nav.devis")}</h1>
                <button className="btn btn-primaire" onClick={ouvrirCreationDevis} data-tour="devis-nouveau">
                    + {t("devis.nouveauDevis")}
                </button>
            </div>

            {/* TABLEAU */}
            <table className="table-devis" data-tour="devis-tableau">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>{t("commun.client")}</th>
                        <th>{t("commun.montant")}</th>
                        <th>{t("commun.statut")}</th>
                        <th>{t("commun.date")}</th>
                        <th>{t("commun.actions")}</th>
                    </tr>
                </thead>

                <tbody>
                    {devis.map((d) => (
                        <tr key={d.id}>
                            <td>#{d.id}</td>
                            <td>{d.client_nom}</td>
                            <td>{d.montant_total} €</td>
                            <td>
                                <span className={`statut statut--${d.statut}`}>
                                    {t(`statuts.devis.${d.statut}`, d.statut)}
                                </span>
                            </td>
                            <td>{new Date(d.date_creation).toLocaleDateString()}</td>
                            <td className="actions-cellule">
                                <Link className="btn-lien" to={`/devis/${d.id}`}>
                                    {t("commun.voir")} →
                                </Link>
                                <button className="btn-lien" onClick={() => ouvrirEditionDevis(d)}>
                                    {t("commun.modifier")}
                                </button>
                                {d.statut === "accepte" && !d.archive_le && (
                                    <button
                                        className="btn-primaire btn-primaire--compact"
                                        onClick={() => convertirEnFacture(d)}
                                        disabled={conversionEnCours === d.id}
                                        title={t("devis.convertirTitre")}
                                    >
                                        {conversionEnCours === d.id ? t("devis.conversionEnCours") : `🧾 ${t("devis.convertir")}`}
                                    </button>
                                )}
                                {utilisateur?.role === "admin" && (
                                    <button className="btn-texte btn-danger" onClick={() => supprimerDevis(d)}>
                                        {t("commun.supprimer")}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL PRO */}
            <Modal
                open={modalOpen}
                title={modeEdition ? t("devis.modifierDevis") : t("devis.nouveauDevis")}
                onClose={() => setModalOpen(false)}
                taille="large"
            >
                <form onSubmit={envoyer} className="form-devis">

                    {/* CLIENT */}
                    <div className="form-ligne">
                        <label>{t("commun.client")}</label>
                        <select
                            value={form.client_id}
                            onChange={(e) =>
                                setForm({ ...form, client_id: Number(e.target.value) })
                            }
                            required
                        >
                            <option value="">{t("devis.selectionnerClient")}</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TITRE */}
                    <div className="form-ligne">
                        <label>{t("devis.titreDevis")}</label>
                        <input
                            value={form.titre}
                            onChange={(e) =>
                                setForm({ ...form, titre: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-ligne">
                        <label>{t("commun.description")}</label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                    </div>

                    {/* STATUT */}
                    <div className="form-ligne">
                        <label>{t("commun.statut")}</label>
                        <select
                            value={form.statut}
                            onChange={(e) =>
                                setForm({ ...form, statut: e.target.value })
                            }
                        >
                            <option value="brouillon">{t("statuts.devis.brouillon")}</option>
                            <option value="envoye">{t("statuts.devis.envoye")}</option>
                            <option value="accepte">{t("statuts.devis.accepte")}</option>
                            <option value="refuse">{t("statuts.devis.refuse")}</option>
                        </select>
                    </div>

                    <h3>{t("devis.lignesDevis")}</h3>

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
                                onChange={(e) =>
                                    changerLigne(index, "description", e.target.value)
                                }
                            />

                            <input
                                type="number"
                                min="1"
                                aria-label={t("devis.quantite")}
                                title={t("devis.quantite")}
                                value={ligne.quantite}
                                onFocus={() => viderChamp(index, "quantite")}
                                onBlur={() => remplirSiVide(index, "quantite", 1)}
                                onChange={(e) =>
                                    changerLigne(index, "quantite", e.target.value === "" ? "" : Number(e.target.value))
                                }
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
                                onChange={(e) =>
                                    changerLigne(index, "prix", e.target.value === "" ? "" : Number(e.target.value))
                                }
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
                        <button
                            type="button"
                            className="btn-texte"
                            onClick={() => setModalOpen(false)}
                        >
                            {t("commun.annuler")}
                        </button>
                        <button type="submit" className="btn-primaire">
                            {modeEdition ? t("commun.enregistrer") : t("devis.creerDevis")}
                        </button>
                    </div>

                </form>
            </Modal>

        </div>
    );
}
