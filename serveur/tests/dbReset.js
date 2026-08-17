import pool from "../config/base_de_donnees.js";

const TABLES = [
    "logs",
    "historique",
    "tickets_support",
    "facture_lignes",
    "factures",
    "devis_lignes",
    "devis",
    "clients",
    "roles",
    "utilisateurs"
];

export async function truncateAll() {
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of TABLES) {
        await pool.query(`TRUNCATE TABLE ${table}`);
    }
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    await pool.query(
        `INSERT INTO parametres (id, couleur_primaire, couleur_secondaire, couleur_fond, couleur_texte)
         VALUES (1, '#2563eb', '#1e293b', '#ffffff', '#0f172a')
         ON DUPLICATE KEY UPDATE id = id`
    );
}
