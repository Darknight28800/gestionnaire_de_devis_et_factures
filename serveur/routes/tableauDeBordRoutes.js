import express from "express";
import { TableauDeBordControleur } from "../controleurs/tableauDeBordControleur.js";
import verifyToken from "../intergiciels/verifyToken.js";

const router = express.Router();

router.get("/statistiques", verifyToken, TableauDeBordControleur.statistiques);

export default router;
