import express from "express";
import db from "../config/db.js";
import adminMiddleware from "../intergiciels/admin.js";

const router = express.Router();

/* GET — Liste des utilisateurs */
router.get("/utilisateurs", adminMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
        "SELECT id, nom, email, role FROM utilisateurs ORDER BY id DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error("Erreur GET utilisateurs :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
    });

    /* POST — Créer un utilisateur */
    router.post("/utilisateurs", adminMiddleware, async (req, res) => {
    const { nom, email, role } = req.body;

    try {
        const [result] = await db.query(
        "INSERT INTO utilisateurs (nom, email, role) VALUES (?, ?, ?)",
        [nom, email, role]
        );

        res.json({
        message: "Utilisateur créé",
        utilisateur: {
            id: result.insertId,
            nom,
            email,
            role
        }
        });
    } catch (err) {
        console.error("Erreur POST utilisateur :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
    });

    /* PUT — Modifier un utilisateur */
    router.put("/utilisateurs/:id", adminMiddleware, async (req, res) => {
    const { nom, email, role } = req.body;

    try {
        await db.query(
        "UPDATE utilisateurs SET nom = ?, email = ?, role = ? WHERE id = ?",
        [nom, email, role, req.params.id]
        );

        res.json({ message: "Utilisateur mis à jour" });
    } catch (err) {
        console.error("Erreur PUT utilisateur :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
    });

    /* DELETE — Supprimer un utilisateur */
    router.delete("/utilisateurs/:id", adminMiddleware, async (req, res) => {
    try {
        await db.query("DELETE FROM utilisateurs WHERE id = ?", [
        req.params.id
        ]);

        res.json({ message: "Utilisateur supprimé" });
    } catch (err) {
        console.error("Erreur DELETE utilisateur :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

export default router;
