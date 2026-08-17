import pool from "../config/base_de_donnees.js";

export class DevisModele {

    static async tous() {
        const [rows] = await pool.query(`
            SELECT devis.*, clients.nom AS client_nom, devis.montant AS montant_total
            FROM devis
            JOIN clients ON clients.id = devis.client_id
            ORDER BY devis.id DESC
        `);
        return rows;
    }

    static async parId(id) {
        const [rows] = await pool.query("SELECT * FROM devis WHERE id = ?", [id]);
        return rows[0] || null;
    }

    static async creer(data) {
        const sql = `
            INSERT INTO devis (client_id, utilisateur_id, montant, titre, description, statut, date_creation)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const params = [
            data.client_id,
            data.utilisateur_id,
            data.montant,
            data.titre,
            data.description,
            data.statut || "brouillon"
        ];
        const [result] = await pool.query(sql, params);
        return { id: result.insertId, ...data };
    }


    static async mettreAJour(id, data) {
        const sql = `
            UPDATE devis
            SET client_id = ?, montant = ?, titre = ?, description = ?, statut = ?
            WHERE id = ?
        `;
        const params = [
            data.client_id,
            data.montant,
            data.titre,
            data.description,
            data.statut || "brouillon",
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
