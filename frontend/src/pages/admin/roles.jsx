import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import "../../styles/pages/_roles.scss";

export default function Roles() {
    const { t } = useTranslation();

    const PERMISSIONS = [
        { id: "voir_utilisateurs", label: t("admin.permissions.voirUtilisateurs") },
        { id: "creer_utilisateur", label: t("admin.permissions.creerUtilisateur") },
        { id: "modifier_utilisateur", label: t("admin.permissions.modifierUtilisateur") },
        { id: "supprimer_utilisateur", label: t("admin.permissions.supprimerUtilisateur") },

        { id: "voir_roles", label: t("admin.permissions.voirRoles") },
        { id: "gerer_roles", label: t("admin.permissions.gererRoles") },

        { id: "voir_logs", label: t("admin.permissions.voirLogs") }
    ];

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const [form, setForm] = useState({
        nom: "",
        permissions: []
    });

    /* Charger les rôles */
    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/admin/roles");
                setRoles(res.data);
            } catch (err) {
                console.error("Erreur chargement rôles :", err);
            } finally {
                setLoading(false);
            }
        };

        charger();
    }, []);

    /* Ouvrir modale création */
    const openCreate = () => {
        setEditingRole(null);
        setForm({ nom: "", permissions: [] });
        setModalOpen(true);
    };

    /* Ouvrir modale édition */
    const openEdit = (role) => {
        setEditingRole(role);
        setForm({
            nom: role.nom,
            permissions: role.permissions
        });
        setModalOpen(true);
    };

    /* Toggle permission */
    const togglePermission = (perm) => {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter((p) => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    /* Soumission */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingRole) {
                await api.put(`/admin/roles/${editingRole.id}`, form);
            } else {
                await api.post("/admin/roles", form);
            }

            window.location.reload();
        } catch (err) {
            console.error("Erreur sauvegarde :", err);
        }
    };

    /* Suppression */
    const supprimer = async (id) => {
        if (!confirm(t("admin.confirmerSuppressionRole"))) return;

        try {
            await api.delete(`/admin/roles/${id}`);
            setRoles(roles.filter(r => r.id !== id));
        } catch (err) {
            console.error("Erreur suppression :", err);
        }
    };

    if (loading) return <p>{t("commun.chargement")}</p>;

    return (
        <div className="page-roles">

            <div className="header">
                <h1>{t("admin.gestionRoles")}</h1>
                <button className="btn-primary" onClick={openCreate}>
                    + {t("admin.ajouterRole")}
                </button>
            </div>

            {/* TABLE */}
            <table className="table-roles">
                <thead>
                    <tr>
                        <th>{t("commun.nom")}</th>
                        <th>{t("admin.permissionsLabel")}</th>
                        <th>{t("commun.actions")}</th>
                    </tr>
                </thead>

                <tbody>
                    {roles.map((r) => (
                        <tr key={r.id}>
                            <td>{r.nom}</td>
                            <td>
                                {r.permissions.map((p) => (
                                    <span key={p} className="badge-perm">{p}</span>
                                ))}
                            </td>
                            <td>
                                <button className="btn-edit" onClick={() => openEdit(r)}>{t("commun.modifier")}</button>
                                <button className="btn-delete" onClick={() => supprimer(r.id)}>{t("commun.supprimer")}</button>
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
                        <h2>{editingRole ? t("admin.modifierRole") : t("admin.creerRole")}</h2>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder={t("admin.nomDuRole")}
                                value={form.nom}
                                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                            />

                            <div className="permissions-list">
                                {PERMISSIONS.map((perm) => (
                                    <label key={perm.id} className="perm-item">
                                        <input
                                            type="checkbox"
                                            checked={form.permissions.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                        />
                                        {perm.label}
                                    </label>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">{t("commun.enregistrer")}</button>
                                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>{t("commun.annuler")}</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

        </div>
    );
}
