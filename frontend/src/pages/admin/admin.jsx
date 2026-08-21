import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../../styles/pages/_admin.scss";

export default function Admin() {
    const { t } = useTranslation();
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
            <h1>{t("nav.administration")}</h1>
            <p>{t("admin.sousTitre")}</p>
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
                <h3>{t("admin.gestionUtilisateurs")}</h3>
                <p>{t("admin.gestionUtilisateursTexte")}</p>
            </Link>
            </motion.div>

            {/* CARTE 2 */}
            <motion.div variants={card}>
            <Link to="/admin/roles" className="admin-card">
                <div className="icon">🛡️</div>
                <h3>{t("admin.gestionRoles")}</h3>
                <p>{t("admin.gestionRolesTexte")}</p>
            </Link>
            </motion.div>

            {/* CARTE 3 */}
            <motion.div variants={card}>
            <Link to="/admin/logs" className="admin-card">
                <div className="icon">📜</div>
                <h3>{t("admin.systemeJournaux")}</h3>
                <p>{t("admin.systemeJournauxTexte")}</p>
            </Link>
            </motion.div>

            {/* CARTE 4 */}
            <motion.div variants={card}>
            <Link to="/admin/tickets" className="admin-card">
                <div className="icon">🎫</div>
                <h3>{t("admin.ticketsSupport")}</h3>
                <p>{t("admin.ticketsSupportTexte")}</p>
            </Link>
            </motion.div>
        </motion.div>
        </motion.div>
    );
}
