import express from "express";
import db from "../config/base_de_donnees.js";
import verifyToken from "../intergiciels/verifyToken.js";
import adminMiddleware from "../intergiciels/admin.js";

const router = express.Router();

// 📌 Créer un ticket de support (utilisateur connecté)
router.post("/tickets", verifyToken, async (req, res) => {
    try {
        const { sujet, message } = req.body;
        if (!sujet || !message) {
            return res.status(400).json({ message: "Sujet et message requis" });
        }

        await db.query(
            "INSERT INTO tickets_support (utilisateur_id, sujet, message) VALUES (?, ?, ?)",
            [req.utilisateur.id, sujet, message]
        );

        res.status(201).json({ message: "Ticket créé" });
    } catch (err) {
        console.error("Erreur création ticket :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 📌 Lister les tickets de support (admin uniquement)
router.get("/tickets", verifyToken, adminMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT tickets_support.*, utilisateurs.nom AS utilisateur_nom, utilisateurs.email AS utilisateur_email
            FROM tickets_support
            JOIN utilisateurs ON utilisateurs.id = tickets_support.utilisateur_id
            ORDER BY tickets_support.date_creation DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Erreur GET tickets :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

export default router;
