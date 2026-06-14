import { Router } from 'express';
import { ClientControleur } from '../controleurs/clientControleur.js';
import { authMiddleware } from '../intergiciels/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ClientControleur.liste);
router.get('/:id', ClientControleur.detail);
router.post('/', ClientControleur.creer);
router.put('/:id', ClientControleur.mettreAJour);
router.delete('/:id', ClientControleur.supprimer);

export default router;
