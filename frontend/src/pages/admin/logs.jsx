import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import "../../styles/pages/_logs.scss";

export default function Logs() {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({
        utilisateur: "",
        action: "",
        date: ""
    });

/* Charger les logs */
    const chargerLogs = async () => {
        try {
            const res = await api.get("/admin/logs", {
                params: {
                    page,
                    utilisateur: filters.utilisateur,
                    action: filters.action,
                    date: filters.date
                }
            });

            setLogs(res.data.logs);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Erreur chargement logs :", err);
        } finally {
            setLoading(false);
        }
    };

    /* useEffect propre et sans erreur ESLint */
    useEffect(() => {
        const fetchLogs = () => {
            chargerLogs();
        };

        fetchLogs();
    }, [page]);



    /* Appliquer les filtres */
    const appliquerFiltres = () => {
        setPage(1);
        chargerLogs();
    };

    if (loading) return <p>Chargement…</p>;

    return (
        <div className="page-logs">

            {/* HEADER */}
            <motion.div 
                className="header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>Historique des actions</h1>
                <p>Consultez toutes les actions effectuées dans le système.</p>
            </motion.div>

            {/* FILTRES */}
            <div className="filters">
                <input 
                    type="text"
                    placeholder="Utilisateur"
                    value={filters.utilisateur}
                    onChange={(e) => setFilters({ ...filters, utilisateur: e.target.value })}
                />

                <input 
                    type="text"
                    placeholder="Action"
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                />

                <input 
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />

                <button className="btn-primary" onClick={appliquerFiltres}>
                    Filtrer
                </button>
            </div>

            {/* TABLE */}
            <motion.table 
                className="table-logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <thead>
                    <tr>
                        <th>Utilisateur</th>
                        <th>Action</th>
                        <th>Détails</th>
                        <th>Date</th>
                    </tr>
                </thead>

                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{log.utilisateur}</td>
                            <td>{log.action}</td>
                            <td>{log.details}</td>
                            <td>{log.date}</td>
                        </tr>
                    ))}
                </tbody>
            </motion.table>

            {/* PAGINATION */}
            <div className="pagination">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    ← Précédent
                </button>

                <span>Page {page} / {totalPages}</span>

                <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Suivant →
                </button>
            </div>

        </div>
    );
}
