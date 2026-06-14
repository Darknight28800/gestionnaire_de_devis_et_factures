import { Router } from "express";
import { tableauDeBordControleur } from "../controleurs/tableauDeBordControleur.js";
import { authMiddleware } from "../intergiciels/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/statistiques", tableauDeBordControleur.statistiques);

export default router;
