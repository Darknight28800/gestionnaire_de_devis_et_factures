import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Modal from "../../composants/modal";
import useAuth from "../../hooks/useAuth";
import "../../styles/pages/_devis.scss";

export default function Devis() {
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
            alert("Erreur lors de l’enregistrement du devis.");
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
            alert("Erreur lors de la conversion en facture.");
        } finally {
            setConversionEnCours(null);
        }
    };

    /* ============================
       SUPPRESSION
    ============================ */
    const supprimerDevis = async (d) => {
        if (!window.confirm(`Supprimer le devis #${d.id} ?`)) return;

        try {
            await api.delete(`/devis/${d.id}`);
            rechargerDevis();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression du devis.");
        }
    };

    return (
        <div className="devis-page">

            {/* HEADER */}
            <div className="devis-header">
                <h1>Devis</h1>
                <button className="btn btn-primaire" onClick={ouvrirCreationDevis}>
                    + Nouveau devis
                </button>
            </div>

            {/* TABLEAU */}
            <table className="table-devis">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
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
                                    {d.statut}
                                </span>
                            </td>
                            <td>{new Date(d.date_creation).toLocaleDateString()}</td>
                            <td className="actions-cellule">
                                <Link className="btn-lien" to={`/devis/${d.id}`}>
                                    Voir →
                                </Link>
                                <button className="btn-lien" onClick={() => ouvrirEditionDevis(d)}>
                                    Modifier
                                </button>
                                {d.statut === "accepte" && !d.archive_le && (
                                    <button
                                        className="btn-primaire btn-primaire--compact"
                                        onClick={() => convertirEnFacture(d)}
                                        disabled={conversionEnCours === d.id}
                                        title="Convertir ce devis accepté en facture"
                                    >
                                        {conversionEnCours === d.id ? "Conversion..." : "🧾 Convertir"}
                                    </button>
                                )}
                                {utilisateur?.role === "admin" && (
                                    <button className="btn-texte btn-danger" onClick={() => supprimerDevis(d)}>
                                        Supprimer
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
                title={modeEdition ? "Modifier le devis" : "Nouveau devis"}
                onClose={() => setModalOpen(false)}
                taille="large"
            >
                <form onSubmit={envoyer} className="form-devis">

                    {/* CLIENT */}
                    <div className="form-ligne">
                        <label>Client</label>
                        <select
                            value={form.client_id}
                            onChange={(e) =>
                                setForm({ ...form, client_id: Number(e.target.value) })
                            }
                            required
                        >
                            <option value="">Sélectionner un client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TITRE */}
                    <div className="form-ligne">
                        <label>Titre du devis</label>
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
                        <label>Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                    </div>

                    {/* STATUT */}
                    <div className="form-ligne">
                        <label>Statut</label>
                        <select
                            value={form.statut}
                            onChange={(e) =>
                                setForm({ ...form, statut: e.target.value })
                            }
                        >
                            <option value="brouillon">Brouillon</option>
                            <option value="envoye">Envoyé</option>
                            <option value="accepte">Accepté</option>
                            <option value="refuse">Refusé</option>
                        </select>
                    </div>

                    <h3>Lignes du devis</h3>

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
                                onChange={(e) =>
                                    changerLigne(index, "description", e.target.value)
                                }
                            />

                            <input
                                type="number"
                                min="1"
                                aria-label="Quantité"
                                title="Quantité"
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
                                aria-label="Prix unitaire en euros"
                                title="Prix unitaire (€)"
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
                        <button
                            type="button"
                            className="btn-texte"
                            onClick={() => setModalOpen(false)}
                        >
                            Annuler
                        </button>
                        <button type="submit" className="btn-primaire">
                            {modeEdition ? "Enregistrer" : "Créer le devis"}
                        </button>
                    </div>

                </form>
            </Modal>

        </div>
    );
}
