import pool from "../config/base_de_donnees.js";

export class DevisModele {

    static async tous() {
        const [rows] = await pool.query("SELECT * FROM devis ORDER BY id DESC");
        return rows;
    }

    static async parId(id) {
        const [rows] = await pool.query("SELECT * FROM devis WHERE id = ?", [id]);
        return rows[0] || null;
    }

    static async creer(data) {
        const sql = `
            INSERT INTO devis (utilisateur_id, montant, titre, description, date_creation)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const params = [
            data.utilisateur_id,
            data.montant,
            data.titre,
            data.description
        ];
        const [result] = await pool.query(sql, params);
        return { id: result.insertId, ...data };
    }

    static async mettreAJour(id, data) {
        const sql = `
            UPDATE devis
            SET utilisateur_id = ?, montant = ?, titre = ?, description = ?
            WHERE id = ?
        `;
        const params = [
            data.utilisateur_id,
            data.montant,
            data.titre,
            data.description,
            id
        ];
        await pool.query(sql, params);
        return { id, ...data };
    }

    static async supprimer(id) {
        await pool.query("DELETE FROM devis WHERE id = ?", [id]);
        return true;
    }
}
