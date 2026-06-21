import { DevisModele } from '../modeles/devisModele.js';
import { DevisLigneModele } from '../modeles/devisLigneModele.js';
import { HistoriqueModele } from "../modeles/historiqueModele.js";

export const DevisControleur = {
    async liste(req, res, next) {
        try {
            const devis = await DevisModele.tous();
            res.json(devis);
        } catch (e) {
            next(e);
        }
    },

    async detail(req, res, next) {
        try {
            const devis = await DevisModele.parId(req.params.id);
            if (!devis) return res.status(404).json({ message: "Devis introuvable" });

            const lignes = await DevisLigneModele.parDevis(req.params.id);
            const historique = await HistoriqueModele.parElement("devis", req.params.id);

            res.json({ ...devis, lignes, historique });
        } catch (e) {
            next(e);
        }
    },

    async creer(req, res, next) {
    try {
        const utilisateur_id = req.user.id;

        const data = {
            ...req.body,
            utilisateur_id
        };

        const devis = await DevisModele.creer(data);


            if (req.body.lignes && Array.isArray(req.body.lignes)) {
                for (const ligne of req.body.lignes) {
                    await DevisLigneModele.creer({
                        ...ligne,
                        devis_id: devis.id
                    });
                }
            }

            res.status(201).json({ message: "Devis créé", devis_id: devis.id });
        } catch (e) {
            next(e);
        }
    },

    async mettreAJour(req, res, next) {
        try {
            // 1) Mise à jour du devis
            const devis = await DevisModele.mettreAJour(req.params.id, req.body);

            // 2) Suppression des anciennes lignes
            await DevisLigneModele.supprimerParDevis(req.params.id);

            // 3) Ajout des nouvelles lignes
            if (req.body.lignes && Array.isArray(req.body.lignes)) {
                for (const ligne of req.body.lignes) {
                    await DevisLigneModele.creer({
                        ...ligne,
                        devis_id: req.params.id
                    });
                }
            }

            res.json({ message: "Devis mis à jour", devis });
        } catch (e) {
            next(e);
        }
    },

    async supprimer(req, res, next) {
        try {
            // 1) Supprimer les lignes associées
            await DevisLigneModele.supprimerParDevis(req.params.id);

            // 2) Supprimer le devis
            await DevisModele.supprimer(req.params.id);

            res.status(200).json({ message: "Devis supprimé avec succès" });
        } catch (e) {
            next(e);
        }
    }
};
