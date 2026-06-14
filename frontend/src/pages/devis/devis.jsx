import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/pages/_devis.scss";

export default function Devis() {
    const [devis, setDevis] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        client_id: "",
        statut: "brouillon",
        lignes: [{ description: "", quantite: 1, prix: 0 }]
    });

    const rechargerDevis = async () => {
        try {
            const res = await api.get("/devis");
            setDevis(res.data);
        } catch (err) {
            console.error("Erreur lors du chargement :", err);
        }
    };

    useEffect(() => {
        const run = () => {
            rechargerDevis();
        };
        run();
    }, []);

    const ajouterLigne = () => {
        setForm({
            ...form,
            lignes: [...form.lignes, { description: "", quantite: 1, prix: 0 }]
        });
    };

    const supprimerLigne = (index) => {
        setForm({
            ...form,
            lignes: form.lignes.filter((_, i) => i !== index)
        });
    };

    const changerLigne = (index, field, value) => {
        const lignes = [...form.lignes];
        lignes[index][field] = value;
        setForm({ ...form, lignes });
    };

    const totalHT = form.lignes.reduce(
        (sum, l) => sum + l.quantite * l.prix,
        0
    );

    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    const envoyer = async (e) => {
        e.preventDefault();
        await api.post("/devis", form);
        setModalOpen(false);
        rechargerDevis();
    };

    return (
        <div className="devis-page">

            <div className="devis-header">
                <h1>Devis</h1>
                <button className="btn-primaire" onClick={() => setModalOpen(true)}>
                    + Nouveau devis
                </button>
            </div>

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

            {modalOpen && (
                <div className="modal">
                    <div className="modal__backdrop" onClick={() => setModalOpen(false)} />
                    <div className="modal__content">
                        <h2>Nouveau devis</h2>

                        <form onSubmit={envoyer} className="form-devis">

                            <div className="form-ligne">
                                <label>Client</label>
                                <input
                                    type="number"
                                    value={form.client_id}
                                    onChange={(e) =>
                                        setForm({ ...form, client_id: e.target.value })
                                    }
                                    required
                                />
                            </div>

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
                                <button type="button" className="btn-texte" onClick={() => setModalOpen(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primaire">
                                    Créer le devis
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
