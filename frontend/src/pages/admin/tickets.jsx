import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import "../../styles/pages/_logs.scss";

export default function Tickets() {
    const { t, i18n } = useTranslation();
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

    if (loading) return <p>{t("commun.chargement")}</p>;

    return (
        <div className="page-logs">
            <motion.div className="header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>{t("admin.ticketsSupport")}</h1>
                <p>{t("admin.ticketsSupportListeTexte")}</p>
            </motion.div>

            {tickets.length === 0 ? (
                <p>{t("admin.aucunTicket")}</p>
            ) : (
                <motion.table className="table-logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <thead>
                        <tr>
                            <th>{t("commun.utilisateur")}</th>
                            <th>{t("admin.sujet")}</th>
                            <th>{t("admin.message")}</th>
                            <th>{t("commun.statut")}</th>
                            <th>{t("commun.date")}</th>
                            <th>{t("commun.actions")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tickets.map((tk) => (
                            <tr key={tk.id}>
                                <td>{tk.utilisateur_nom || tk.utilisateur_email}</td>
                                <td>{tk.sujet}</td>
                                <td>{tk.message}</td>
                                <td>
                                    <span className={`statut statut--${tk.statut}`}>
                                        {tk.statut === "resolu" ? t("admin.statutResolu") : t("admin.statutOuvert")}
                                    </span>
                                </td>
                                <td>{new Date(tk.date_creation).toLocaleString(i18n.language)}</td>
                                <td>
                                    {tk.statut !== "resolu" && (
                                        <button className="btn-primary" onClick={() => resoudre(tk.id)}>
                                            {t("admin.marquerResolu")}
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
