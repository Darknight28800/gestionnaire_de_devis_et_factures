import { DevisModele } from '../modeles/devisModele.js';
import { DevisLigneModele } from '../modeles/devisLigneModele.js';
import { HistoriqueModele } from "../modeles/historiqueModele.js";
import { ClientModele } from "../modeles/clientModele.js";
import { LogModele } from "../modeles/logModele.js";
import { ParametresModele } from "../modeles/parametresModele.js";
import { genererPdfDevis } from "../utils/pdf.js";
import { DUREE_CONSERVATION_ANNEES } from "../config/archivage.js";

const identiteUtilisateur = (req) => req.utilisateur.email || `utilisateur #${req.utilisateur.id}`;

export const DevisControleur = {
    async liste(req, res, next) {
        try {
            const devis = await DevisModele.tous();
            res.json(devis);
        } catch (e) {
            next(e);
        }
    },

    async archives(req, res, next) {
        try {
            const devis = await DevisModele.archives();
            res.json({ devis, dureeConservationAnnees: DUREE_CONSERVATION_ANNEES });
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
            const client = await ClientModele.trouverParId(devis.client_id);

            res.json({ ...devis, client, lignes, historique });
        } catch (e) {
            next(e);
        }
    },

    async creer(req, res, next) {
        try {
            const utilisateur_id = req.utilisateur.id;

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

            await HistoriqueModele.ajouter("devis", devis.id, "Devis créé");
            await LogModele.ajouter(identiteUtilisateur(req), `Création du devis #${devis.id}`);

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

            await HistoriqueModele.ajouter("devis", req.params.id, "Devis mis à jour");
            await LogModele.ajouter(identiteUtilisateur(req), `Modification du devis #${req.params.id}`);

            res.json({ message: "Devis mis à jour", devis });
        } catch (e) {
            next(e);
        }
    },

    async pdf(req, res, next) {
        try {
            const devis = await DevisModele.parId(req.params.id);
            if (!devis) return res.status(404).json({ message: "Devis introuvable" });

            const lignes = await DevisLigneModele.parDevis(req.params.id);
            const client = await ClientModele.trouverParId(devis.client_id);
            const parametres = await ParametresModele.obtenir();

            genererPdfDevis({ devis, client, lignes, res }, parametres);
        } catch (e) {
            next(e);
        }
    },

    async archiver(req, res, next) {
        try {
            const devis = await DevisModele.parId(req.params.id);
            if (!devis) return res.status(404).json({ message: "Devis introuvable" });

            await DevisModele.archiver(req.params.id);
            await HistoriqueModele.ajouter("devis", req.params.id, "Devis archivé");
            await LogModele.ajouter(identiteUtilisateur(req), `Archivage du devis #${req.params.id}`);

            res.json({ message: "Devis archivé" });
        } catch (e) {
            next(e);
        }
    },

    async desarchiver(req, res, next) {
        try {
            const devis = await DevisModele.parId(req.params.id);
            if (!devis) return res.status(404).json({ message: "Devis introuvable" });

            await DevisModele.desarchiver(req.params.id);
            await HistoriqueModele.ajouter("devis", req.params.id, "Devis désarchivé");
            await LogModele.ajouter(identiteUtilisateur(req), `Désarchivage du devis #${req.params.id}`);

            res.json({ message: "Devis désarchivé" });
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

            await LogModele.ajouter(identiteUtilisateur(req), `Suppression du devis #${req.params.id}`);

            res.status(200).json({ message: "Devis supprimé avec succès" });
        } catch (e) {
            next(e);
        }
    }
};
