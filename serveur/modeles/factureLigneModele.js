import pool from "../config/base_de_donnees.js";

export class FactureLigneModele {

    static async parFacture(factureId) {
        const [rows] = await pool.query(
            "SELECT * FROM facture_lignes WHERE facture_id = ? ORDER BY id ASC",
            [factureId]
        );
        return rows;
    }

    static async creer(data) {
        const sql = `
            INSERT INTO facture_lignes (facture_id, description, quantite, prix_unitaire)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            data.facture_id,
            data.description,
            data.quantite,
            data.prix_unitaire
        ];
        const [result] = await pool.query(sql, params);
        return { id: result.insertId, ...data };
    }

    static async supprimerParFacture(factureId) {
        await pool.query("DELETE FROM facture_lignes WHERE facture_id = ?", [factureId]);
        return true;
    }
}
