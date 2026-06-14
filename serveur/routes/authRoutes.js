import { Router } from 'express';
import { AuthControleur } from '../controleurs/authControleur.js';
import verifyToken from "../intergiciels/verifyToken.js";

const router = Router();

router.post('/inscription', AuthControleur.inscription);
router.post('/connexion', AuthControleur.connexion);
router.get('/profil', verifyToken, AuthControleur.profil);

export default router;
