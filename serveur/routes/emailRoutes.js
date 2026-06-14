import express from "express";
import { envoyerEmail } from "../services/emailService.js";
import db from "../db.js";
import path from "path";

const router = express.Router();

router.post("/envoyer-devis/:id", async (req, res) => {
    try {
        const devisId = req.params.id;

        const devis = await db.query(
            "SELECT d.*, c.email, c.nom FROM devis d JOIN clients c ON d.client_id = c.id WHERE d.id = ?",
            [devisId]
        );

        if (!devis[0]) return res.status(404).json({ message: "Devis introuvable" });

        const templatePath = path.join("emails", "templates", "devis.html");

        await envoyerEmail(
            devis[0].email,
            `Votre devis #${devisId}`,
            templatePath,
            {
                nom: devis[0].nom,
                montant: devis[0].montant_total,
                numero: devisId
            }
        );

        await db.query(
            "INSERT INTO historique (type, reference_id, message) VALUES ('devis', ?, 'Devis envoyé par e-mail')",
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

        const facture = await db.query(
            "SELECT f.*, c.email, c.nom FROM factures f JOIN clients c ON f.client_id = c.id WHERE f.id = ?",
            [factureId]
        );

        if (!facture[0]) return res.status(404).json({ message: "Facture introuvable" });

        const templatePath = path.join("emails", "templates", "facture.html");

        await envoyerEmail(
            facture[0].email,
            `Votre facture #${factureId}`,
            templatePath,
            {
                nom: facture[0].nom,
                montant: facture[0].montant,
                numero: factureId
            }
        );

        await db.query(
            "INSERT INTO historique (type, reference_id, message) VALUES ('facture', ?, 'Facture envoyée par e-mail')",
            [factureId]
        );

        res.json({ message: "Facture envoyée par e-mail" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'envoi" });
    }
});


export default router;
