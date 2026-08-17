import { Router } from "express";
import { DevisControleur } from "../controleurs/devisControleur.js";
import verifyToken from "../intergiciels/verifyToken.js";
import isAdmin from "../intergiciels/admin.js";

const router = Router();

// 📌 Récupérer tous les devis (utilisateur connecté)
router.get("/", verifyToken, DevisControleur.liste);

// 📌 Récupérer les devis archivés (avant /:id pour éviter le conflit de route)
router.get("/archives", verifyToken, DevisControleur.archives);

// 📌 Récupérer un devis + ses lignes
router.get("/:id", verifyToken, DevisControleur.detail);

// 📌 Générer le PDF d'un devis
router.get("/:id/pdf", verifyToken, DevisControleur.pdf);

// 📌 Créer un devis + lignes (utilisateur connecté)
router.post("/", verifyToken, DevisControleur.creer);

// 📌 Modifier un devis + lignes (utilisateur connecté)
router.put("/:id", verifyToken, DevisControleur.mettreAJour);

// 📌 Archiver / désarchiver un devis
router.patch("/:id/archiver", verifyToken, DevisControleur.archiver);
router.patch("/:id/desarchiver", verifyToken, DevisControleur.desarchiver);

// 📌 Supprimer un devis (ADMIN uniquement)
router.delete("/:id", verifyToken, isAdmin, DevisControleur.supprimer);

export default router;
