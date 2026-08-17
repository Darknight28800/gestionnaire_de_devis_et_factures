import pool from "../config/base_de_donnees.js";

export const ClientModele = {
    async tous() {
        const [rows] = await pool.query("SELECT * FROM clients ORDER BY id DESC");
        return rows;
    },

    async trouverParId(id) {
        const [[row]] = await pool.query("SELECT * FROM clients WHERE id = ?", [id]);
        return row;
    },

    async creer(data) {
        const { nom, email, telephone, adresse, ville, code_postal, pays, statut } = data;

        const [result] = await pool.query(
            `INSERT INTO clients (nom, email, telephone, adresse, ville, code_postal, pays, statut)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nom, email, telephone, adresse, ville, code_postal, pays, statut || "actif"]
        );

        return this.trouverParId(result.insertId);
    },

    async mettreAJour(id, data) {
        const { nom, email, telephone, adresse, ville, code_postal, pays, statut } = data;

        await pool.query(
            `UPDATE clients
                SET nom = ?, email = ?, telephone = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?, statut = ?
                WHERE id = ?`,
            [nom, email, telephone, adresse, ville, code_postal, pays, statut || "actif", id]
        );

        return this.trouverParId(id);
    },

    async supprimer(id) {
        await pool.query("DELETE FROM clients WHERE id = ?", [id]);
        return true;
    }
};
