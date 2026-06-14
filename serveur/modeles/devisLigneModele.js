import pool from "../config/base_de_donnees.js";

export class DevisLigneModele {

    static async parDevis(devisId) {
        const [rows] = await pool.query(
            "SELECT * FROM devis_lignes WHERE devis_id = ? ORDER BY id ASC",
            [devisId]
        );
        return rows;
    }

    static async creer(data) {
        const sql = `
            INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            data.devis_id,
            data.description,
            data.quantite,
            data.prix_unitaire
        ];
        const [result] = await pool.query(sql, params);
        return { id: result.insertId, ...data };
    }

    static async supprimerParDevis(devisId) {
        await pool.query("DELETE FROM devis_lignes WHERE devis_id = ?", [devisId]);
        return true;
    }
}
