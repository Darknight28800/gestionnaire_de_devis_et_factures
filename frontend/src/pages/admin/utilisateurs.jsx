import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import "../../styles/pages/_utilisateurs.scss";

export default function Utilisateurs() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        nom: "",
        email: "",
        role: "user"
    });

    /* Charger les utilisateurs */
    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/admin/utilisateurs");
                setUsers(res.data);
            } catch (err) {
                console.error("Erreur chargement utilisateurs :", err);
            } finally {
                setLoading(false);
            }
        };

        charger();
    }, []);

    /* Ouvrir modale création */
    const openCreate = () => {
        setEditingUser(null);
        setForm({ nom: "", email: "", role: "user" });
        setModalOpen(true);
    };

    /* Ouvrir modale édition */
    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
            nom: user.nom,
            email: user.email,
            role: user.role
        });
        setModalOpen(true);
    };

    /* Soumission */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingUser) {
                await api.put(`/admin/utilisateurs/${editingUser.id}`, form);
            } else {
                await api.post("/admin/utilisateurs", form);
            }

            window.location.reload();
        } catch (err) {
            console.error("Erreur sauvegarde :", err);
        }
    };

    /* Suppression */
    const supprimer = async (id) => {
        if (!confirm("Supprimer cet utilisateur ?")) return;

        try {
            await api.delete(`/admin/utilisateurs/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error("Erreur suppression :", err);
        }
    };

    if (loading) return <p>Chargement…</p>;

    return (
        <div className="page-utilisateurs">

            <div className="header">
                <h1>Gestion des utilisateurs</h1>
                <button className="btn-primary" onClick={openCreate}>
                    + Ajouter un utilisateur
                </button>
            </div>

            {/* TABLE */}
            <table className="table-users">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.nom}</td>
                            <td>{u.email}</td>
                            <td>
                                <span className={`badge badge-${u.role}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td>
                                <button className="btn-edit" onClick={() => openEdit(u)}>Modifier</button>
                                <button className="btn-delete" onClick={() => supprimer(u.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODALE */}
            {modalOpen && (
                <motion.div 
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div 
                        className="modal"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <h2>{editingUser ? "Modifier l’utilisateur" : "Créer un utilisateur"}</h2>

                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text"
                                placeholder="Nom"
                                value={form.nom}
                                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                            />

                            <input 
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />

                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="user">Utilisateur</option>
                                <option value="admin">Administrateur</option>
                            </select>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Enregistrer</button>
                                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

        </div>
    );
}
