import pool from "../config/base_de_donnees.js";
import { DUREE_CONSERVATION_ANNEES } from "../config/archivage.js";

export class FactureModele {

    // 📌 Récupérer toutes les factures (non archivées)
    static async tous() {
        const [rows] = await pool.query("SELECT * FROM factures WHERE archive_le IS NULL ORDER BY id DESC");
        return rows;
    }

    // 📌 Récupérer les factures archivées
    static async archives() {
        await this.purgerExpires();

        const [rows] = await pool.query(
            "SELECT * FROM factures WHERE archive_le IS NOT NULL ORDER BY archive_le DESC"
        );
        return rows;
    }

    // 📌 Récupérer une facture par ID
    static async parId(id) {
        const [rows] = await pool.query(
            "SELECT * FROM factures WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    // 📌 Créer une facture
    static async creer(data) {
        const sql = `
            INSERT INTO factures (devis_id, client_id, utilisateur_id, montant, date_facture, statut)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.devis_id || null,
            data.client_id,
            data.utilisateur_id,
            data.montant,
            data.date_facture || new Date(),
            data.statut || "non_payee"
        ];
        const [result] = await pool.query(sql, params);
        return { id: result.insertId, ...data };
    }

    // 📌 Mettre à jour une facture
    static async mettreAJour(id, data) {
        const sql = `
            UPDATE factures
            SET client_id = ?, montant = ?, statut = ?
            WHERE id = ?
        `;
        const params = [
            data.client_id,
            data.montant,
            data.statut || "non_payee",
            id
        ];
        await pool.query(sql, params);
        return { id, ...data };
    }

    // 📌 Supprimer une facture
    static async supprimer(id) {
        await pool.query("DELETE FROM factures WHERE id = ?", [id]);
        return true;
    }

    // 📌 Marquer comme payée
    static async payer(id) {
        await pool.query(
            "UPDATE factures SET statut = 'payee', date_paiement = CURDATE() WHERE id = ?",
            [id]
        );
        return true;
    }

    // 📌 Archiver / désarchiver
    static async archiver(id) {
        await pool.query("UPDATE factures SET archive_le = NOW() WHERE id = ?", [id]);
        return true;
    }

    static async desarchiver(id) {
        await pool.query("UPDATE factures SET archive_le = NULL WHERE id = ?", [id]);
        return true;
    }

    // 📌 Purge définitive des factures archivées depuis plus de N années (conservation légale)
    static async purgerExpires() {
        const [result] = await pool.query(
            `DELETE FROM factures
             WHERE archive_le IS NOT NULL
               AND archive_le < DATE_SUB(NOW(), INTERVAL ? YEAR)`,
            [DUREE_CONSERVATION_ANNEES]
        );
        return result.affectedRows;
    }

    // 📌 Route fusionnée : pagination + recherche + tri (factures non archivées uniquement)
    static async rechercherOuPaginer({ search = null, page = 1, limit = 10, sort = "id", order = "DESC" }) {
        const offset = (page - 1) * limit;

        // Colonnes autorisées pour éviter l'injection SQL
        const colonnesAutorisees = ["id", "montant", "date_facture", "statut", "date_creation"];
        if (!colonnesAutorisees.includes(sort)) sort = "date_creation"; // Valeur par défaut

        // Ordre autorisé
        order = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        let sqlWhere = "WHERE archive_le IS NULL";
        let params = [];

        // Recherche activée ?
        if (search) {
            const like = `%${search}%`;
            sqlWhere += `
                AND (id LIKE ?
                OR montant LIKE ?
                OR statut LIKE ?
                OR date_facture LIKE ?)
            `;
            params.push(like, like, like, like);
        }

        // 1) Récupérer les factures filtrées + triées
        const [factures] = await pool.query(
            `SELECT * FROM factures
                ${sqlWhere}
            ORDER BY ${sort} ${order}
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // 2) Compter le total filtré
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM factures
            ${sqlWhere}`,
            params
        );

        return {
            factures,
            total,
            page,
            limit,
            sort,
            order,
            search,
            totalPages: Math.ceil(total / limit)
        };
    }
}
