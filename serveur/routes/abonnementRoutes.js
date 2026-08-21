import express from "express";
import { AbonnementControleur } from "../controleurs/abonnementControleur.js";
import verifyToken from "../intergiciels/verifyToken.js";
import adminMiddleware from "../intergiciels/admin.js";

const router = express.Router();

// 📌 Le webhook Stripe est monté séparément dans app.js (corps brut requis pour la signature)

router.get("/offres", AbonnementControleur.offres);
router.get("/statut", verifyToken, AbonnementControleur.statut);
router.post("/creer-session-paiement", verifyToken, adminMiddleware, AbonnementControleur.creerSessionPaiement);
router.post("/portail", verifyToken, adminMiddleware, AbonnementControleur.ouvrirPortail);

export default router;
