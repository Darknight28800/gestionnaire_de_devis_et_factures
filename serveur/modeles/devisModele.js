import pool from "../config/base_de_donnees.js";
import { DUREE_CONSERVATION_ANNEES } from "../config/archivage.js";

export class DevisModele {

    static async tous() {
        const [rows] = await pool.query(`
            SELECT devis.*, clients.nom AS client_nom, devis.montant AS montant_total
            FROM devis
            JOIN clients ON clients.id = devis.client_id
            WHERE devis.archive_le IS NULL
            ORDER BY devis.id DESC
        `);
        return rows;
    }

    static async archives() {
        await this.purgerExpires();

        const [rows] = await pool.query(`
            SELECT devis.*, clients.nom AS client_nom, devis.montant AS montant_total
            FROM devis
            JOIN clients ON clients.id = devis.client_id
            WHERE devis.archive_le IS NOT NULL
            ORDER BY devis.archive_le DESC
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

    static async archiver(id) {
        await pool.query("UPDATE devis SET archive_le = NOW() WHERE id = ?", [id]);
        return true;
    }

    static async desarchiver(id) {
        await pool.query("UPDATE devis SET archive_le = NULL WHERE id = ?", [id]);
        return true;
    }

    // 📌 Purge définitivement les devis archivés depuis plus de N années (conservation légale)
    static async purgerExpires() {
        const [result] = await pool.query(
            `DELETE FROM devis
             WHERE archive_le IS NOT NULL
               AND archive_le < DATE_SUB(NOW(), INTERVAL ? YEAR)`,
            [DUREE_CONSERVATION_ANNEES]
        );
        return result.affectedRows;
    }
}
