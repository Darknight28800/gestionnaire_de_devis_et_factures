import db from "../config/base_de_donnees.js";

export class ParametresModele {

    static async obtenir() {
        const [rows] = await db.query("SELECT * FROM parametres WHERE id = 1");
        return rows[0] || null;
    }

    static async mettreAJour(data, fichierLogo) {
        let logo_url = null;

        if (fichierLogo) {
            logo_url = `/uploads/${fichierLogo.filename}`;
        } else {
            const [rows] = await db.query("SELECT logo_url FROM parametres WHERE id = 1");
            logo_url = rows[0]?.logo_url || null;
        }

        const {
            nom_entreprise,
            email,
            telephone,
            adresse,
            couleur_primaire,
            couleur_secondaire,
            couleur_fond,
            couleur_texte
        } = data;

        await db.query(
            `UPDATE parametres
             SET nom_entreprise=?, email=?, telephone=?, adresse=?,
                 couleur_primaire=?, couleur_secondaire=?, couleur_fond=?, couleur_texte=?,
                 logo_url=?
             WHERE id=1`,
            [
                nom_entreprise,
                email,
                telephone,
                adresse,
                couleur_primaire,
                couleur_secondaire,
                couleur_fond,
                couleur_texte,
                logo_url
            ]
        );

        const [updated] = await db.query("SELECT * FROM parametres WHERE id = 1");
        return updated[0];
    }
}
