import pool from "../config/base_de_donnees.js";

export const TableauDeBordControleur = {
    async statistiques(req, res, next) {
        try {
            const [[{ total_clients }]] = await pool.query(
                "SELECT COUNT(*) AS total_clients FROM clients"
            );

            const [[{ total_devis }]] = await pool.query(
                "SELECT COUNT(*) AS total_devis FROM devis"
            );

            const [[{ total_factures }]] = await pool.query(
                "SELECT COUNT(*) AS total_factures FROM factures"
            );

            const [[{ factures_payees }]] = await pool.query(
                "SELECT COUNT(*) AS factures_payees FROM factures WHERE statut = 'payee'"
            );

            const [[{ factures_non_payees }]] = await pool.query(
                "SELECT COUNT(*) AS factures_non_payees FROM factures WHERE statut = 'non_payee'"
            );

            const [[{ montant_total }]] = await pool.query(
                "SELECT SUM(montant) AS montant_total FROM factures"
            );

            const [[{ montant_paye }]] = await pool.query(
                "SELECT SUM(montant) AS montant_paye FROM factures WHERE statut = 'payee'"
            );

            const [[{ montant_attente }]] = await pool.query(
                "SELECT SUM(montant) AS montant_attente FROM factures WHERE statut = 'non_payee'"
            );

            const [recent_devis] = await pool.query(
                "SELECT * FROM devis ORDER BY id DESC LIMIT 5"
            );

            const [recent_factures] = await pool.query(
                "SELECT * FROM factures ORDER BY id DESC LIMIT 5"
            );

            res.json({
                stats: {
                    total_clients,
                    total_devis,
                    total_factures,
                    factures_payees,
                    factures_non_payees,
                    montant_total: montant_total || 0,
                    montant_paye: montant_paye || 0,
                    montant_attente: montant_attente || 0
                },
                recent_devis,
                recent_factures
            });
        } catch (e) {
            next(e);
        }
    }
};
