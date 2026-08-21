/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import { useDialog } from "../../contexte/dialogProvider";
import "../../styles/pages/_utilisateurs.scss";

export default function Utilisateurs() {
    const { t } = useTranslation();
    const { confirmer, alerter } = useDialog();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        nom: "",
        email: "",
        role: "user"
    });

    // Charger les utilisateurs
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

    // Ouvrir modale création
    const openCreate = () => {
        setEditingUser(null);
        setForm({ nom: "", email: "", role: "user" });
        setModalOpen(true);
    };

    // Ouvrir modale édition
    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
        nom: user.nom,
        email: user.email,
        role: user.role
        });
        setModalOpen(true);
    };

    // Soumission formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        if (editingUser) {
            const res = await api.put(`/admin/utilisateurs/${editingUser.id}`, form);

            // Mise à jour locale
            setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? { ...u, ...form } : u))
            );
        } else {
            const res = await api.post("/admin/utilisateurs", form);

            // Ajout local
            setUsers((prev) => [...prev, res.data.utilisateur]);

            if (res.data.motDePasseTemporaire) {
                await alerter(t("admin.utilisateurCreeMessage", { motDePasse: res.data.motDePasseTemporaire }));
            }
        }

        setModalOpen(false);
        } catch (err) {
        console.error("Erreur sauvegarde :", err);
        }
    };

    // Suppression
    const supprimer = async (id) => {
        const ok = await confirmer(t("admin.confirmerSuppressionUtilisateur"), { variante: "danger", texteConfirmer: t("commun.supprimer") });
        if (!ok) return;

        try {
        await api.delete(`/admin/utilisateurs/${id}`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
        console.error("Erreur suppression :", err);
        }
    };

    if (loading) return <p>{t("commun.chargement")}</p>;

    return (
        <div className="page-utilisateurs">
        <div className="header">
            <h1>{t("admin.gestionUtilisateurs")}</h1>
            <button className="btn-primary" onClick={openCreate}>
            + {t("admin.ajouterUtilisateur")}
            </button>
        </div>

        {/* TABLE */}
        <table className="table-users">
            <thead>
            <tr>
                <th>{t("commun.nom")}</th>
                <th>{t("commun.email")}</th>
                <th>{t("admin.role")}</th>
                <th>{t("commun.actions")}</th>
            </tr>
            </thead>

            <tbody>
            {users.map((u) => (
                <tr key={u.id}>
                <td>{u.nom}</td>
                <td>{u.email}</td>
                <td>
                    <span className={`badge badge-${u.role}`}>{u.role === "admin" ? t("profil.administrateur") : t("profil.utilisateur")}</span>
                </td>
                <td>
                    <button className="btn-edit" onClick={() => openEdit(u)}>
                    {t("commun.modifier")}
                    </button>
                    <button className="btn-delete" onClick={() => supprimer(u.id)}>
                    {t("commun.supprimer")}
                    </button>
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
                <h2>{editingUser ? t("admin.modifierUtilisateur") : t("admin.creerUtilisateur")}</h2>

                <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder={t("commun.nom")}
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                />

                <input
                    type="email"
                    placeholder={t("commun.email")}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />

                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                    <option value="user">{t("profil.utilisateur")}</option>
                    <option value="admin">{t("profil.administrateur")}</option>
                </select>

                <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                    {t("commun.enregistrer")}
                    </button>
                    <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModalOpen(false)}
                    >
                    {t("commun.annuler")}
                    </button>
                </div>
                </form>
            </motion.div>
            </motion.div>
        )}
        </div>
    );
}
