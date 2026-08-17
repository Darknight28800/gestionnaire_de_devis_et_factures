import pool from "../config/base_de_donnees.js";
import { STATUTS_ABONNEMENT, STATUTS_AUTORISES } from "../config/abonnement.js";

export const AbonnementModele = {
    async obtenir() {
        const [rows] = await pool.query("SELECT * FROM abonnement WHERE id = 1");
        return rows[0] || null;
    },

    async definirClientStripe(stripeCustomerId) {
        await pool.query("UPDATE abonnement SET stripe_customer_id = ? WHERE id = 1", [stripeCustomerId]);
    },

    // 📌 Appelé quand l'abonnement Stripe (avec essai) est confirmé (carte enregistrée)
    async demarrerEssai({ offreId, stripeCustomerId, stripeSubscriptionId, essaiDebut, essaiFin }) {
        await pool.query(
            `UPDATE abonnement
             SET offre_id = ?, statut = ?, essai_debut = ?, essai_fin = ?,
                 stripe_customer_id = ?, stripe_subscription_id = ?, rappel_envoye = 0
             WHERE id = 1`,
            [offreId, STATUTS_ABONNEMENT.ESSAI, essaiDebut, essaiFin, stripeCustomerId, stripeSubscriptionId]
        );
    },

    async mettreAJourStatut(statut) {
        await pool.query("UPDATE abonnement SET statut = ? WHERE id = 1", [statut]);
    },

    async mettreAJourOffre(offreId) {
        await pool.query("UPDATE abonnement SET offre_id = ? WHERE id = 1", [offreId]);
    },

    async marquerRappelEnvoye() {
        await pool.query("UPDATE abonnement SET rappel_envoye = 1 WHERE id = 1");
    },

    // 📌 Est-ce que l'installation a actuellement accès à l'application ?
    async accesAutorise() {
        const abonnement = await this.obtenir();
        if (!abonnement) return false;

        if (abonnement.statut === STATUTS_ABONNEMENT.ESSAI) {
            return new Date(abonnement.essai_fin) > new Date();
        }

        return STATUTS_AUTORISES.includes(abonnement.statut);
    }
};
