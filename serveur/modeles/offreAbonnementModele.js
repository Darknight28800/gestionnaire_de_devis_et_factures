import pool from "../config/base_de_donnees.js";

export const OffreAbonnementModele = {
    async tous() {
        const [rows] = await pool.query("SELECT * FROM offres_abonnement ORDER BY ordre ASC");
        return rows;
    },

    async parId(id) {
        const [rows] = await pool.query("SELECT * FROM offres_abonnement WHERE id = ?", [id]);
        return rows[0] || null;
    },

    async parCode(code) {
        const [rows] = await pool.query("SELECT * FROM offres_abonnement WHERE code = ?", [code]);
        return rows[0] || null;
    }
};
