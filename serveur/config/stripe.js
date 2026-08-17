import Stripe from "stripe";

// Client Stripe paresseux : reste `null` tant que STRIPE_SECRET_KEY n'est pas défini,
// pour ne jamais bloquer le développement local ou les tests si Stripe n'est pas configuré.
let stripe = null;

export function obtenirStripe() {
    if (stripe) return stripe;
    if (!process.env.STRIPE_SECRET_KEY) return null;

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripe;
}

export function stripeConfigure() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
}
