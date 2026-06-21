import { ParametresModele } from "../modeles/parametresModele.js";

export const ParametresControleur = {

    async obtenir(req, res, next) {
        try {
            const parametres = await ParametresModele.obtenir();
            res.json(parametres);
        } catch (e) {
            next(e);
        }
    },

    async mettreAJour(req, res, next) {
        try {
            const parametres = await ParametresModele.mettreAJour(req.body, req.file);
            res.json({ message: "Paramètres mis à jour", parametres });
        } catch (e) {
            next(e);
        }
    }
};
