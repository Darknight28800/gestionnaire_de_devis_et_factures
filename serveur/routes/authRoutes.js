import { Router } from "express";
import { AuthControleur } from "../controleurs/authControleur.js";
import verifyToken from "../intergiciels/verifyToken.js";
import db from "../config/base_de_donnees.js";

const router = Router();

    /* ------------------------------
    Authentification
    --------------------------------*/
    router.post("/inscription", AuthControleur.inscription);
    router.post("/connexion", AuthControleur.connexion);

    /* ------------------------------
    Profil via contrôleur
    --------------------------------*/
    router.get("/profil", verifyToken, AuthControleur.profil);

    /* ------------------------------
    GET /auth/me — retourne l'utilisateur connecté
    --------------------------------*/
    router.get("/me", verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
        "SELECT id, nom, email, role FROM utilisateurs WHERE id = ?",
        [req.utilisateur.id]
        );

        if (!rows) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({ utilisateur: rows });
    } catch (err) {
        console.error("Erreur /auth/me :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

export default router;
