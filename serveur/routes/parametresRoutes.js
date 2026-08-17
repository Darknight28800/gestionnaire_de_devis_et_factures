import express from "express";
import { ParametresModele } from "../modeles/parametresModele.js";
import { uploadLogo } from "../intergiciels/uploadLogo.js";
import verifyToken from "../intergiciels/verifyToken.js";
import adminMiddleware from "../intergiciels/admin.js";

const router = express.Router();

router.use(verifyToken);

// GET /parametres
router.get("/", async (req, res) => {
    try {
        const parametres = await ParametresModele.obtenir();
        res.json(parametres);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// PUT /parametres (admin uniquement)
router.put("/", adminMiddleware, uploadLogo.single("logo"), async (req, res) => {
    try {
        const parametres = await ParametresModele.mettreAJour(req.body, req.file);
        res.json(parametres);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres" });
    }
});

// POST /parametres/logo (admin uniquement) — upload du logo seul
router.post("/logo", adminMiddleware, uploadLogo.single("logo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier reçu" });
        }

        const logo_url = `/uploads/${req.file.filename}`;
        await ParametresModele.definirLogo(logo_url);

        res.json({ logo_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'upload du logo" });
    }
});

export default router;
