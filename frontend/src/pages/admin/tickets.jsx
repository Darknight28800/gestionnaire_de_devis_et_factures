import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import "../../styles/pages/_logs.scss";

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const charger = async () => {
        try {
            const res = await api.get("/support/tickets");
            setTickets(res.data);
        } catch (err) {
            console.error("Erreur chargement tickets :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const resoudre = async (id) => {
        try {
            await api.patch(`/support/tickets/${id}/resoudre`);
            setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, statut: "resolu" } : t)));
        } catch (err) {
            console.error("Erreur résolution ticket :", err);
        }
    };

    if (loading) return <p>Chargement…</p>;

    return (
        <div className="page-logs">
            <motion.div className="header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>Tickets de support</h1>
                <p>Consultez et traitez les demandes envoyées par les utilisateurs.</p>
            </motion.div>

            {tickets.length === 0 ? (
                <p>Aucun ticket pour le moment.</p>
            ) : (
                <motion.table className="table-logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Sujet</th>
                            <th>Message</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tickets.map((t) => (
                            <tr key={t.id}>
                                <td>{t.utilisateur_nom || t.utilisateur_email}</td>
                                <td>{t.sujet}</td>
                                <td>{t.message}</td>
                                <td>
                                    <span className={`statut statut--${t.statut}`}>{t.statut}</span>
                                </td>
                                <td>{new Date(t.date_creation).toLocaleString()}</td>
                                <td>
                                    {t.statut !== "resolu" && (
                                        <button className="btn-primary" onClick={() => resoudre(t.id)}>
                                            Marquer résolu
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </motion.table>
            )}
        </div>
    );
}
