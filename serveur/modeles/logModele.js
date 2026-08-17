import pool from "../config/base_de_donnees.js";

export const LogModele = {
    async ajouter(utilisateur, action) {
        await pool.query(
            "INSERT INTO logs (utilisateur, action, date) VALUES (?, ?, NOW())",
            [utilisateur, action]
        );
    },

    async paginer({ page = 1, limit = 20, utilisateur = null, action = null, date = null }) {
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        if (utilisateur) {
            conditions.push("utilisateur LIKE ?");
            params.push(`%${utilisateur}%`);
        }
        if (action) {
            conditions.push("action LIKE ?");
            params.push(`%${action}%`);
        }
        if (date) {
            conditions.push("DATE(date) = ?");
            params.push(date);
        }

        const sqlWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const [logs] = await pool.query(
            `SELECT * FROM logs ${sqlWhere} ORDER BY date DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM logs ${sqlWhere}`,
            params
        );

        return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
