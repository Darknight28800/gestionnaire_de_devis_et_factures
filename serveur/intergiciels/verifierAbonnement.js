import { AbonnementModele } from "../modeles/abonnementModele.js";
import { stripeConfigure } from "../config/stripe.js";

// Bloque l'accès à l'application si l'essai est terminé et qu'aucun abonnement actif n'est en cours.
// N'a aucun effet tant que Stripe n'est pas configuré (STRIPE_SECRET_KEY absent) : utile en
// développement local et pour les tests automatisés.
export default async function verifierAbonnement(req, res, next) {
    if (!stripeConfigure()) return next();

    try {
        const autorise = await AbonnementModele.accesAutorise();
        if (autorise) return next();

        const abonnement = await AbonnementModele.obtenir();
        return res.status(402).json({
            message: "Accès bloqué : votre période d'essai est terminée ou votre abonnement n'est plus actif.",
            statut: abonnement?.statut || "inconnu"
        });
    } catch (e) {
        next(e);
    }
}
