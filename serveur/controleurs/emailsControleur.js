import { HistoriqueModele } from "../modeles/historiqueModele.js";
import { EmailService } from "../services/emailService.js";

export const EmailsControleur = {
    async envoyerDevis(req, res, next) {
        try {
            const devisId = req.params.id;

            await EmailService.envoyerDevis(devisId);

            await HistoriqueModele.ajouter({
                type: "devis",
                element_id: devisId,
                message: "Devis envoyé par email"
            });

            res.json({ message: "Email envoyé" });
        } catch (e) {
            next(e);
        }
    },

    async envoyerFacture(req, res, next) {
        try {
            const factureId = req.params.id;

            await EmailService.envoyerFacture(factureId);

            await HistoriqueModele.ajouter({
                type: "facture",
                element_id: factureId,
                message: "Facture envoyée par email"
            });

            res.json({ message: "Email envoyé" });
        } catch (e) {
            next(e);
        }
    }
};
