import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../composants/modal";
import "../../styles/pages/_devis.scss";

export default function Devis() {
    const [devis, setDevis] = useState([]);
    const [clients, setClients] = useState([]);

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

    /* ============================
       CALCULS
    ============================ */
    const totalHT = form.lignes.reduce(
        (sum, l) => sum + l.quantite * l.prix,
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
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL PRO */}
            <Modal
                open={modalOpen}
                title={modeEdition ? "Modifier le devis" : "Nouveau devis"}
                onClose={() => setModalOpen(false)}
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

                    {form.lignes.map((ligne, index) => (
                        <div key={index} className="ligne-devis">
                            <input
                                placeholder="Description"
                                value={ligne.description}
                                onChange={(e) =>
                                    changerLigne(index, "description", e.target.value)
                                }
                            />

                            <input
                                type="number"
                                min="1"
                                value={ligne.quantite}
                                onChange={(e) =>
                                    changerLigne(index, "quantite", Number(e.target.value))
                                }
                            />

                            <input
                                type="number"
                                min="0"
                                value={ligne.prix}
                                onChange={(e) =>
                                    changerLigne(index, "prix", Number(e.target.value))
                                }
                            />

                            <button
                                type="button"
                                className="btn-texte btn-danger"
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
