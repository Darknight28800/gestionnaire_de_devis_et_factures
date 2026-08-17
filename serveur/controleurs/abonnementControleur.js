import { AbonnementModele } from "../modeles/abonnementModele.js";
import { OffreAbonnementModele } from "../modeles/offreAbonnementModele.js";
import { obtenirStripe, stripeConfigure } from "../config/stripe.js";
import { STATUTS_ABONNEMENT, DUREE_ESSAI_JOURS } from "../config/abonnement.js";
import { LogModele } from "../modeles/logModele.js";
import { envoyerEmailRappelEssai } from "../utils/email.js";

const APP_URL = () => process.env.APP_URL || "http://localhost:5173";

export const AbonnementControleur = {

    // 📌 Catalogue des offres (accessible même sans être connecté, pour la page de blocage)
    async offres(req, res, next) {
        try {
            const offres = await OffreAbonnementModele.tous();
            res.json({ offres, dureeEssaiJours: DUREE_ESSAI_JOURS, stripeConfigure: stripeConfigure() });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Statut courant de l'abonnement de l'installation
    async statut(req, res, next) {
        try {
            const abonnement = await AbonnementModele.obtenir();
            const offre = abonnement?.offre_id ? await OffreAbonnementModele.parId(abonnement.offre_id) : null;
            const autorise = stripeConfigure() ? await AbonnementModele.accesAutorise() : true;

            let joursRestants = null;
            if (abonnement?.statut === STATUTS_ABONNEMENT.ESSAI && abonnement.essai_fin) {
                const ms = new Date(abonnement.essai_fin).getTime() - Date.now();
                joursRestants = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
            }

            res.json({
                statut: abonnement?.statut || STATUTS_ABONNEMENT.ATTENTE_CARTE,
                essaiFin: abonnement?.essai_fin || null,
                joursRestants,
                offre,
                autorise,
                stripeConfigure: stripeConfigure()
            });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Créer une session Stripe Checkout pour démarrer l'essai (carte requise) — admin uniquement
    async creerSessionPaiement(req, res, next) {
        try {
            const stripe = obtenirStripe();
            if (!stripe) {
                return res.status(503).json({ message: "Le paiement n'est pas encore configuré (Stripe absent)." });
            }

            const { offreCode } = req.body;
            const offre = await OffreAbonnementModele.parCode(offreCode);
            if (!offre) return res.status(404).json({ message: "Offre introuvable" });
            if (!offre.stripe_price_id) {
                return res.status(400).json({ message: "Cette offre n'est pas encore reliée à Stripe (stripe_price_id manquant)." });
            }

            const abonnement = await AbonnementModele.obtenir();

            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                line_items: [{ price: offre.stripe_price_id, quantity: 1 }],
                subscription_data: {
                    trial_period_days: DUREE_ESSAI_JOURS,
                    trial_settings: {
                        end_behavior: { missing_payment_method: "cancel" }
                    }
                },
                payment_method_collection: "always",
                customer: abonnement?.stripe_customer_id || undefined,
                success_url: `${APP_URL()}/abonnement?paiement=succes`,
                cancel_url: `${APP_URL()}/abonnement?paiement=annule`
            });

            res.json({ url: session.url });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Ouvrir le portail de facturation Stripe (gérer la carte, changer d'offre, résilier) — admin
    async ouvrirPortail(req, res, next) {
        try {
            const stripe = obtenirStripe();
            if (!stripe) {
                return res.status(503).json({ message: "Le paiement n'est pas encore configuré (Stripe absent)." });
            }

            const abonnement = await AbonnementModele.obtenir();
            if (!abonnement?.stripe_customer_id) {
                return res.status(400).json({ message: "Aucun client Stripe associé pour le moment." });
            }

            const session = await stripe.billingPortal.sessions.create({
                customer: abonnement.stripe_customer_id,
                return_url: `${APP_URL()}/abonnement`
            });

            res.json({ url: session.url });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Webhook Stripe : source de vérité pour l'état réel de l'abonnement
    async webhook(req, res) {
        const stripe = obtenirStripe();
        if (!stripe) return res.status(503).end();

        let event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                req.headers["stripe-signature"],
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("Signature webhook Stripe invalide :", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object;
                    if (session.mode === "subscription" && session.subscription) {
                        const subscription = await stripe.subscriptions.retrieve(session.subscription);
                        const priceId = subscription.items.data[0]?.price?.id;
                        const offres = await OffreAbonnementModele.tous();
                        const offre = offres.find((o) => o.stripe_price_id === priceId);

                        await AbonnementModele.demarrerEssai({
                            offreId: offre?.id || null,
                            stripeCustomerId: subscription.customer,
                            stripeSubscriptionId: subscription.id,
                            essaiDebut: new Date(subscription.trial_start * 1000),
                            essaiFin: new Date(subscription.trial_end * 1000)
                        });
                        await LogModele.ajouter("Stripe", "Essai démarré (carte enregistrée)");
                    }
                    break;
                }

                case "customer.subscription.trial_will_end": {
                    const abonnement = await AbonnementModele.obtenir();
                    if (!abonnement?.rappel_envoye) {
                        await envoyerEmailRappelEssai();
                        await AbonnementModele.marquerRappelEnvoye();
                        await LogModele.ajouter("Stripe", "Rappel de fin d'essai envoyé");
                    }
                    break;
                }

                case "customer.subscription.updated": {
                    const subscription = event.data.object;
                    if (subscription.status === "active") {
                        await AbonnementModele.mettreAJourStatut(STATUTS_ABONNEMENT.ACTIF);
                    } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
                        await AbonnementModele.mettreAJourStatut(STATUTS_ABONNEMENT.IMPAYE);
                    } else if (subscription.status === "canceled") {
                        await AbonnementModele.mettreAJourStatut(STATUTS_ABONNEMENT.ANNULE);
                    }
                    break;
                }

                case "customer.subscription.deleted": {
                    await AbonnementModele.mettreAJourStatut(STATUTS_ABONNEMENT.ANNULE);
                    await LogModele.ajouter("Stripe", "Abonnement résilié");
                    break;
                }

                case "invoice.payment_failed": {
                    await AbonnementModele.mettreAJourStatut(STATUTS_ABONNEMENT.IMPAYE);
                    await LogModele.ajouter("Stripe", "Échec de paiement de l'abonnement");
                    break;
                }

                case "invoice.payment_succeeded": {
                    const invoice = event.data.object;
                    if (invoice.billing_reason !== "subscription_create") {
                        await AbonnementModele.mettreAJourStatut(STATUTS_ABONNEMENT.ACTIF);
                    }
                    break;
                }

                default:
                    break;
            }

            res.json({ received: true });
        } catch (e) {
            console.error("Erreur traitement webhook Stripe :", e);
            res.status(500).json({ message: "Erreur traitement webhook" });
        }
    }
};
