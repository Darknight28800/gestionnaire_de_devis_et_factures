import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../composants/modal";
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
                setErreur("Impossible de charger les clients.");
            } finally {
                setLoading(false);
            }
        };

        charger();
    }, []);

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
            alert("Erreur lors de l’enregistrement du client.");
        }
    };

    /* ============================
       SUPPRESSION CLIENT
    ============================ */
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
        <div className="clients-page">

            {/* HEADER */}
            <div className="clients-header">
                <h1>Clients</h1>

                <div className="actions">
                    <button className="btn btn-primaire" onClick={ouvrirCreation}>
                        + Nouveau client
                    </button>
                </div>
            </div>

            {erreur && <p className="page-clients__erreur">{erreur}</p>}

            {/* TABLEAU */}
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
                        {clients.map((c) => (
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
                        ))}
                    </tbody>
                </table>
            )}

            {/* MODAL */}
            <Modal
                open={modalOuvert}
                title={modeEdition ? "Modifier le client" : "Nouveau client"}
                onClose={() => setModalOuvert(false)}
            >
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
            </Modal>

        </div>
    );
}
