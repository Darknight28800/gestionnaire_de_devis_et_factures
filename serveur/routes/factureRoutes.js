import { Router } from "express";
import { FactureControleur } from "../controleurs/factureControleur.js";
import verifyToken from "../intergiciels/verifyToken.js";
import isAdmin from "../intergiciels/admin.js";

const router = Router();

/* ------------------------- ROUTES SANS PARAMÈTRES ------------------------- */

// 📌 Route unique : pagination + recherche + tri
router.get("/", verifyToken, FactureControleur.paginer);

// 📌 Récupérer les factures archivées (avant /:id pour éviter le conflit de route)
router.get("/archives", verifyToken, FactureControleur.archives);

// 📌 Créer une facture + lignes
router.post("/", verifyToken, FactureControleur.creer);

// 📌 Convertir un devis en facture
router.post("/convertir/:devisId", verifyToken, FactureControleur.convertirDepuisDevis);


/* ------------------------- ROUTES AVEC PARAMÈTRES ------------------------- */

// 📌 Récupérer une facture + ses lignes
router.get("/:id", verifyToken, FactureControleur.detail);

// 📌 Générer le PDF d'une facture
router.get("/:id/pdf", verifyToken, FactureControleur.pdf);

// 📌 Modifier une facture + lignes
router.put("/:id", verifyToken, FactureControleur.mettreAJour);

// 📌 Envoyer une facture par e‑mail
router.post("/:id/envoyer-email", verifyToken, FactureControleur.envoyerParEmail);

// 📌 Marquer une facture comme payée
router.patch("/:id/payer", verifyToken, FactureControleur.marquerCommePaye);

// 📌 Archiver / désarchiver une facture
router.patch("/:id/archiver", verifyToken, FactureControleur.archiver);
router.patch("/:id/desarchiver", verifyToken, FactureControleur.desarchiver);

// 📌 Supprimer une facture (ADMIN uniquement)
router.delete("/:id", verifyToken, isAdmin, FactureControleur.supprimer);

export default router;
