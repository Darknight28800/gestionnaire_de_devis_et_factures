import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import db from "../config/base_de_donnees.js";
import verifyToken from "../intergiciels/verifyToken.js";
import adminMiddleware from "../intergiciels/admin.js";
import { RoleModele } from "../modeles/roleModele.js";
import { LogModele } from "../modeles/logModele.js";
import { DevisModele } from "../modeles/devisModele.js";
import { FactureModele } from "../modeles/factureModele.js";
import { DUREE_CONSERVATION_ANNEES } from "../config/archivage.js";

const router = express.Router();

router.use(verifyToken, adminMiddleware);

const identiteAdmin = (req) => req.utilisateur.email || `utilisateur #${req.utilisateur.id}`;

/* ============================================================
   UTILISATEURS
============================================================ */

router.get("/utilisateurs", async (req, res) => {
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

router.post("/utilisateurs", async (req, res) => {
    const { nom, email, role } = req.body;

    try {
        const motDePasseTemporaire = crypto.randomBytes(9).toString("base64url");
        const hash = await bcrypt.hash(motDePasseTemporaire, 10);

        const [result] = await db.query(
            "INSERT INTO utilisateurs (nom, email, role, mot_de_passe) VALUES (?, ?, ?, ?)",
            [nom, email, role, hash]
        );

        await LogModele.ajouter(identiteAdmin(req), `Création de l'utilisateur ${email}`);

        res.json({
            message: "Utilisateur créé",
            utilisateur: { id: result.insertId, nom, email, role },
            motDePasseTemporaire
        });
    } catch (err) {
        console.error("Erreur POST utilisateur :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.put("/utilisateurs/:id", async (req, res) => {
    const { nom, email, role } = req.body;

    try {
        await db.query(
            "UPDATE utilisateurs SET nom = ?, email = ?, role = ? WHERE id = ?",
            [nom, email, role, req.params.id]
        );

        await LogModele.ajouter(identiteAdmin(req), `Modification de l'utilisateur #${req.params.id}`);

        res.json({ message: "Utilisateur mis à jour" });
    } catch (err) {
        console.error("Erreur PUT utilisateur :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.delete("/utilisateurs/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM utilisateurs WHERE id = ?", [req.params.id]);

        await LogModele.ajouter(identiteAdmin(req), `Suppression de l'utilisateur #${req.params.id}`);

        res.json({ message: "Utilisateur supprimé" });
    } catch (err) {
        console.error("Erreur DELETE utilisateur :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* ============================================================
   RÔLES
============================================================ */

router.get("/roles", async (req, res) => {
    try {
        const roles = await RoleModele.tous();
        res.json(roles);
    } catch (err) {
        console.error("Erreur GET roles :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.post("/roles", async (req, res) => {
    try {
        const { nom, permissions } = req.body;
        const role = await RoleModele.creer({ nom, permissions });

        await LogModele.ajouter(identiteAdmin(req), `Création du rôle "${nom}"`);

        res.status(201).json({ message: "Rôle créé", role });
    } catch (err) {
        console.error("Erreur POST role :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.put("/roles/:id", async (req, res) => {
    try {
        const { nom, permissions } = req.body;
        const role = await RoleModele.mettreAJour(req.params.id, { nom, permissions });

        await LogModele.ajouter(identiteAdmin(req), `Modification du rôle #${req.params.id}`);

        res.json({ message: "Rôle mis à jour", role });
    } catch (err) {
        console.error("Erreur PUT role :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.delete("/roles/:id", async (req, res) => {
    try {
        await RoleModele.supprimer(req.params.id);

        await LogModele.ajouter(identiteAdmin(req), `Suppression du rôle #${req.params.id}`);

        res.json({ message: "Rôle supprimé" });
    } catch (err) {
        console.error("Erreur DELETE role :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* ============================================================
   LOGS
============================================================ */

router.get("/logs", async (req, res) => {
    try {
        const { page, utilisateur, action, date } = req.query;

        const resultat = await LogModele.paginer({
            page: parseInt(page) || 1,
            limit: 20,
            utilisateur: utilisateur || null,
            action: action || null,
            date: date || null
        });

        res.json(resultat);
    } catch (err) {
        console.error("Erreur GET logs :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* ============================================================
   ARCHIVES
============================================================ */

// 📌 Purger manuellement les devis/factures archivés depuis plus de N années
router.post("/purger-archives", async (req, res) => {
    try {
        const devisSupprimes = await DevisModele.purgerExpires();
        const facturesSupprimees = await FactureModele.purgerExpires();

        await LogModele.ajouter(
            identiteAdmin(req),
            `Purge des archives (${devisSupprimes} devis, ${facturesSupprimees} factures supprimés définitivement)`
        );

        res.json({
            message: "Purge effectuée",
            devisSupprimes,
            facturesSupprimees,
            dureeConservationAnnees: DUREE_CONSERVATION_ANNEES
        });
    } catch (err) {
        console.error("Erreur purge archives :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

export default router;
