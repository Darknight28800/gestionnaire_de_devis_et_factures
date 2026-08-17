import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import Modal from "../../composants/modal";
import useAuth from "../../hooks/useAuth";
import "../../styles/pages/_factures.scss";

const LIGNE_VIDE = { description: "", quantite: 1, prix: 0 };

export default function Factures() {
    const { utilisateur } = useAuth();
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
            alert("Erreur lors de l'enregistrement de la facture.");
        }
    };

    const supprimerFacture = async (f) => {
        if (!window.confirm(`Supprimer la facture #${f.id} ?`)) return;

        try {
            await api.delete(`/factures/${f.id}`);
            charger();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression de la facture.");
        }
    };

    return (
        <div className="factures-page">

            <div className="factures-header">
                <h1>Factures</h1>

                <div className="factures-header__actions">
                    <input
                        type="text"
                        className="input-search"
                        placeholder="Rechercher une facture..."
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                    />
                    <button className="btn btn-primaire" onClick={ouvrirCreation}>
                        + Nouvelle facture
                    </button>
                </div>
            </div>

            <table className="table-factures">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
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
                                    {f.statut}
                                </span>
                            </td>

                            <td className="actions-cellule">
                                <Link className="btn-lien" to={`/factures/${f.id}`}>
                                    Voir →
                                </Link>
                                <button className="btn-lien" onClick={() => ouvrirEdition(f)}>
                                    Modifier
                                </button>
                                {utilisateur?.role === "admin" && (
                                    <button className="btn-texte btn-danger" onClick={() => supprimerFacture(f)}>
                                        Supprimer
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
                    ← Précédent
                </button>

                <span className="pagination__info">
                    Page {page} / {totalPages}
                </span>

                <button
                    className="btn-texte"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Suivant →
                </button>
            </div>

            <Modal
                open={modalOpen}
                title={modeEdition ? "Modifier la facture" : "Nouvelle facture"}
                onClose={() => setModalOpen(false)}
                taille="large"
            >
                <form onSubmit={envoyer} className="form-devis">

                    <div className="form-ligne">
                        <label>Client</label>
                        <select
                            value={form.client_id}
                            onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })}
                            required
                        >
                            <option value="">Sélectionner un client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-ligne">
                        <label>Statut</label>
                        <select
                            value={form.statut}
                            onChange={(e) => setForm({ ...form, statut: e.target.value })}
                        >
                            <option value="non_payee">Non payée</option>
                            <option value="payee">Payée</option>
                        </select>
                    </div>

                    <h3>Lignes de la facture</h3>

                    <div className="ligne-devis ligne-devis--entete">
                        <span>Description</span>
                        <span>Quantité</span>
                        <span>Prix unitaire (€)</span>
                        <span></span>
                    </div>

                    {form.lignes.map((ligne, index) => (
                        <div key={index} className="ligne-devis">
                            <input
                                placeholder="Ex : Prestation, produit..."
                                aria-label="Description de la ligne"
                                value={ligne.description}
                                onChange={(e) => changerLigne(index, "description", e.target.value)}
                            />
                            <input
                                type="number"
                                min="1"
                                aria-label="Quantité"
                                title="Quantité"
                                value={ligne.quantite}
                                onFocus={() => viderChamp(index, "quantite")}
                                onBlur={() => remplirSiVide(index, "quantite", 1)}
                                onChange={(e) => changerLigne(index, "quantite", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                aria-label="Prix unitaire en euros"
                                title="Prix unitaire (€)"
                                value={ligne.prix}
                                onFocus={() => viderChamp(index, "prix")}
                                onBlur={() => remplirSiVide(index, "prix", 0)}
                                onChange={(e) => changerLigne(index, "prix", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                            <button
                                type="button"
                                className="btn-icone"
                                aria-label="Supprimer cette ligne"
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
                        + Ajouter une ligne
                    </button>

                    <div className="totaux">
                        <p>Total HT : <strong>{totalHT.toFixed(2)} €</strong></p>
                        <p>TVA (20%) : <strong>{totalTVA.toFixed(2)} €</strong></p>
                        <p>Total TTC : <strong>{totalTTC.toFixed(2)} €</strong></p>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-texte" onClick={() => setModalOpen(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primaire">
                            {modeEdition ? "Enregistrer" : "Créer la facture"}
                        </button>
                    </div>

                </form>
            </Modal>

        </div>
    );
}
