import pool from "../config/base_de_donnees.js";

export const UtilisateurModele = {
    async trouverParEmail(email) {
        const [rows] = await pool.query(
        "SELECT * FROM utilisateurs WHERE email = ? LIMIT 1",
        [email],
        );
        return rows[0];
    },

    async trouverParId(id) {
        const [rows] = await pool.query(
        "SELECT * FROM utilisateurs WHERE id = ? LIMIT 1",
        [id],
        );
        return rows[0];
    },

    async creer({ nom = null, email, mot_de_passe, role = "utilisateur" }) {
        const [result] = await pool.query(
        `INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
        VALUES (?, ?, ?, ?)`,
        [nom, email, mot_de_passe, role],
        );
        
        return this.trouverParId(result.insertId);
    },
};
