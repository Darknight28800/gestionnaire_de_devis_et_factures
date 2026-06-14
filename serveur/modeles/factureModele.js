import pool from "../config/base_de_donnees.js";

export class FactureModele {

    // 📌 Récupérer toutes les factures
    static async tous() {
        const [rows] = await pool.query("SELECT * FROM factures ORDER BY id DESC");
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
            INSERT INTO factures (devis_id, utilisateur_id, montant, date_facture, statut)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            data.devis_id,
            data.utilisateur_id,
            data.montant,
            data.date_facture,
            data.statut || "non_payee"
        ];
        const [result] = await pool.query(sql, params);
        return { id: result.insertId, ...data };
    }

    // 📌 Mettre à jour une facture
    static async mettreAJour(id, data) {
        const sql = `
            UPDATE factures
            SET devis_id = ?, utilisateur_id = ?, montant = ?, date_facture = ?, statut = ?
            WHERE id = ?
        `;
        const params = [
            data.devis_id,
            data.utilisateur_id,
            data.montant,
            data.date_facture,
            data.statut,
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

    // 📌 Route fusionnée : pagination + recherche + tri
    static async rechercherOuPaginer({ search = null, page = 1, limit = 10, sort = "id", order = "DESC" }) {
        const offset = (page - 1) * limit;

        // Colonnes autorisées pour éviter l'injection SQL
        const colonnesAutorisees = ["id", "montant", "date_facture", "statut", "date_creation"];
        if (!colonnesAutorisees.includes(sort)) sort = "id";

        // Ordre autorisé
        order = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        let sqlWhere = "";
        let params = [];

        // Recherche activée ?
        if (search) {
            const like = `%${search}%`;
            sqlWhere = `
                WHERE id LIKE ? 
                OR montant LIKE ?
                OR statut LIKE ?
                OR date_facture LIKE ?
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
