import express from "express";
import { EmailService } from "../services/emailService.js";
import pool from "../config/base_de_donnees.js";

const router = express.Router();

router.post("/envoyer-devis/:id", async (req, res) => {
    try {
        const devisId = req.params.id;

        // Envoi email via ta classe
        await EmailService.envoyerDevis(devisId);

        // Historique
        await pool.query(
            "INSERT INTO historique (type, reference_id, message, date) VALUES ('devis', ?, 'Devis envoyé par e-mail', NOW())",
            [devisId]
        );

        res.json({ message: "Devis envoyé par e-mail" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'envoi" });
    }
});

router.post("/envoyer-facture/:id", async (req, res) => {
    try {
        const factureId = req.params.id;

        // Envoi email via ta classe
        await EmailService.envoyerFacture(factureId);

        // Historique
        await pool.query(
            "INSERT INTO historique (type, reference_id, message, date) VALUES ('facture', ?, 'Facture envoyée par e-mail', NOW())",
            [factureId]
        );

        res.json({ message: "Facture envoyée par e-mail" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'envoi" });
    }
});

export default router;
