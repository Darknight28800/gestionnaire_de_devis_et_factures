import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../../styles/pages/_admin.scss";

export default function Admin() {
    const container = {
        hidden: { opacity: 0 },
        show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
        }
    };

    const card = {
        hidden: { opacity: 0, y: 20 },
        show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <motion.div
        className="page-admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        >
        {/* HEADER */}
        <motion.div
            className="admin-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1>Administration</h1>
            <p>Gérez les utilisateurs, les rôles et les journaux du système.</p>
        </motion.div>

        {/* GRILLE */}
        <motion.div
            className="admin-grid"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* CARTE 1 */}
            <motion.div variants={card}>
            <Link to="/admin/utilisateurs" className="admin-card">
                <div className="icon">👤</div>
                <h3>Gestion des utilisateurs</h3>
                <p>Créer, modifier et gérer les comptes utilisateurs.</p>
            </Link>
            </motion.div>

            {/* CARTE 2 */}
            <motion.div variants={card}>
            <Link to="/admin/roles" className="admin-card">
                <div className="icon">🛡️</div>
                <h3>Gestion des rôles</h3>
                <p>Définir les permissions et niveaux d’accès.</p>
            </Link>
            </motion.div>

            {/* CARTE 3 */}
            <motion.div variants={card}>
            <Link to="/admin/logs" className="admin-card">
                <div className="icon">📜</div>
                <h3>Système de journaux</h3>
                <p>Consulter l’historique des actions du système.</p>
            </Link>
            </motion.div>
        </motion.div>
        </motion.div>
    );
}
