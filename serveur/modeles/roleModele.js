import pool from "../config/base_de_donnees.js";

export const RoleModele = {
    async tous() {
        const [rows] = await pool.query("SELECT * FROM roles ORDER BY id DESC");
        return rows.map(formaterRole);
    },

    async trouverParId(id) {
        const [rows] = await pool.query("SELECT * FROM roles WHERE id = ?", [id]);
        return rows[0] ? formaterRole(rows[0]) : null;
    },

    async creer({ nom, permissions = [] }) {
        const [result] = await pool.query(
            "INSERT INTO roles (nom, permissions) VALUES (?, ?)",
            [nom, JSON.stringify(permissions)]
        );
        return this.trouverParId(result.insertId);
    },

    async mettreAJour(id, { nom, permissions = [] }) {
        await pool.query(
            "UPDATE roles SET nom = ?, permissions = ? WHERE id = ?",
            [nom, JSON.stringify(permissions), id]
        );
        return this.trouverParId(id);
    },

    async supprimer(id) {
        await pool.query("DELETE FROM roles WHERE id = ?", [id]);
        return true;
    }
};

function formaterRole(row) {
    let permissions = [];
    if (row.permissions) {
        try {
            permissions = typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions;
        } catch {
            permissions = [];
        }
    }
    return { ...row, permissions };
}
