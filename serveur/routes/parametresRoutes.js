import express from "express";
import db from "../config/base_de_donnees.js";
import { uploadLogo } from "../intergiciels/uploadLogo.js";

const router = express.Router();

// GET /parametres
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM parametres WHERE id = 1");
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// PUT /parametres
router.put("/", uploadLogo.single("logo"), async (req, res) => {
    try {
        const {
            nom_entreprise,
            email,
            telephone,
            adresse,
            couleur_primaire,
            couleur_secondaire,
            couleur_fond,
            couleur_texte
        } = req.body;

        let logo_url = null;

        if (req.file) {
            logo_url = `/uploads/${req.file.filename}`;
        } else {
            const [rows] = await db.query("SELECT logo_url FROM parametres WHERE id = 1");
            logo_url = rows[0]?.logo_url || null;
        }

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
        res.json(updated[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres" });
    }
});

export default router;
