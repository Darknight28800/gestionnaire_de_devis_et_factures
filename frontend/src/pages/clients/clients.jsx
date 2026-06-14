import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/pages/_clients.scss";

export default function Clients() {
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

    // Charger les clients
    useEffect(() => {
        const charger = async () => {
            try {
                setLoading(true);
                const res = await api.get("/clients");
                setClients(res.data);
                setErreur(null);
            } catch (e) {
                console.error(e);
                setErreur("Impossible de charger les clients.");
            } finally {
                setLoading(false);
            }
        };

        charger();
    }, []);

    // Ouvrir modal création
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

    // Ouvrir modal édition
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

    // Gestion des champs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Soumission formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (modeEdition && clientActuel) {
                await api.put(`/clients/${clientActuel.id}`, form);
            } else {
                await api.post("/clients", form);
            }

            setModalOuvert(false);

            // Recharger la liste
            const res = await api.get("/clients");
            setClients(res.data);

        } catch (e) {
            console.error(e);
            alert("Erreur lors de l’enregistrement du client.");
        }
    };

    // Suppression
    const supprimerClient = async (client) => {
        if (!window.confirm(`Supprimer le client "${client.nom}" ?`)) return;

        try {
            await api.delete(`/clients/${client.id}`);

            const res = await api.get("/clients");
            setClients(res.data);

        } catch (e) {
            console.error(e);
            alert("Erreur lors de la suppression du client.");
        }
    };

    if (loading) return <p>Chargement des clients...</p>;

    return (
        <div className="page-clients">
            <div className="page-clients__header">
                <h1>Clients</h1>
                <button className="btn btn-primaire" onClick={ouvrirCreation}>
                    + Nouveau client
                </button>
            </div>

            {erreur && <p className="page-clients__erreur">{erreur}</p>}

            {clients.length === 0 ? (
                <p>Aucun client pour le moment.</p>
            ) : (
                <table className="table-clients">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Ville</th>
                            <th>Statut</th>
                            <th style={{ width: "140px" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(clients) && clients.length > 0 ? (
                            clients.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.nom}</td>
                                    <td>{c.email}</td>
                                    <td>{c.telephone}</td>
                                    <td>{c.ville}</td>
                                    <td>
                                        <span className={`statut statut--${c.statut}`}>
                                            {c.statut}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-texte"
                                            onClick={() => ouvrirEdition(c)}
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            className="btn-texte btn-danger"
                                            onClick={() => supprimerClient(c)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Aucun client trouvé</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* MODAL */}
            {modalOuvert && (
                <div className="modal">
                    <div className="modal__backdrop" onClick={() => setModalOuvert(false)} />
                    <div className="modal__contenu">
                        <h2>{modeEdition ? "Modifier le client" : "Nouveau client"}</h2>

                        <form onSubmit={handleSubmit} className="form-client">

                            <div className="form-ligne">
                                <label>Nom</label>
                                <input
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-ligne">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-ligne">
                                <label>Téléphone</label>
                                <input
                                    name="telephone"
                                    value={form.telephone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-ligne">
                                <label>Adresse</label>
                                <input
                                    name="adresse"
                                    value={form.adresse}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-ligne form-ligne--2">
                                <div>
                                    <label>Ville</label>
                                    <input
                                        name="ville"
                                        value={form.ville}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label>Code postal</label>
                                    <input
                                        name="code_postal"
                                        value={form.code_postal}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-ligne">
                                <label>Pays</label>
                                <input
                                    name="pays"
                                    value={form.pays}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-ligne">
                                <label>Statut</label>
                                <select
                                    name="statut"
                                    value={form.statut}
                                    onChange={handleChange}
                                >
                                    <option value="actif">Actif</option>
                                    <option value="inactif">Inactif</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-texte"
                                    onClick={() => setModalOuvert(false)}
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primaire">
                                    {modeEdition ? "Enregistrer" : "Créer"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
