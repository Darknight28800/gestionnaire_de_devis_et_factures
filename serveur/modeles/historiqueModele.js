import pool from "../config/base_de_donnees.js";

export class HistoriqueModele {
    static async ajouter(type, reference_id, message) {
        const sql = `
            INSERT INTO historique (type, reference_id, message, date)
            VALUES (?, ?, ?, NOW())
        `;
        await pool.query(sql, [type, reference_id, message]);
    }

    static async parElement(type, reference_id) {
        const [rows] = await pool.query(
            "SELECT * FROM historique WHERE type = ? AND reference_id = ? ORDER BY date DESC",
            [type, reference_id]
        );
        return rows;
    }
}
