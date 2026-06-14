import { Router } from "express";
import { DevisControleur } from "../controleurs/devisControleur.js";
import verifyToken from "../intergiciels/verifyToken.js";
import isAdmin from "../intergiciels/admin.js";

const router = Router();

// 📌 Récupérer tous les devis (utilisateur connecté)
router.get("/", verifyToken, DevisControleur.liste);

// 📌 Récupérer un devis + ses lignes
router.get("/:id", verifyToken, DevisControleur.detail);

// 📌 Créer un devis + lignes (utilisateur connecté)
router.post("/", verifyToken, DevisControleur.creer);

// 📌 Modifier un devis + lignes (utilisateur connecté)
router.put("/:id", verifyToken, DevisControleur.mettreAJour);

// 📌 Supprimer un devis (ADMIN uniquement)
router.delete("/:id", verifyToken, isAdmin, DevisControleur.supprimer);

export default router;
