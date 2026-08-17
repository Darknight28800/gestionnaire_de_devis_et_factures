import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken } from "./helpers.js";

const activerStripeFactice = () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_factice_pour_les_tests";
};
const desactiverStripe = () => {
    delete process.env.STRIPE_SECRET_KEY;
};

async function definirAbonnement({ statut, essai_fin = null, offre_id = null }) {
    const pool = (await import("../config/base_de_donnees.js")).default;
    await pool.query(
        "UPDATE abonnement SET statut = ?, essai_fin = ?, offre_id = ? WHERE id = 1",
        [statut, essai_fin, offre_id]
    );
}

describe("Abonnement", () => {
    afterEach(() => {
        desactiverStripe();
    });

    it("liste les 3 offres disponibles", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app).get("/abonnement/offres").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.offres).toHaveLength(3);
        expect(res.body.offres.map(o => o.code)).toEqual(["independant", "pme", "grande_entreprise"]);
        expect(res.body.dureeEssaiJours).toBe(7);
    });

    it("renvoie le statut de l'abonnement (attente_carte par défaut)", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app).get("/abonnement/statut").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.statut).toBe("attente_carte");
    });

    it("n'applique aucun blocage tant que Stripe n'est pas configuré", async () => {
        const { token } = await creerUtilisateurEtToken();
        await definirAbonnement({ statut: "attente_carte" });

        const res = await request(app).get("/clients").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    it("bloque l'accès aux routes métier si l'essai est expiré (Stripe configuré)", async () => {
        const { token } = await creerUtilisateurEtToken();
        activerStripeFactice();

        const hier = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await definirAbonnement({ statut: "essai", essai_fin: hier });

        const res = await request(app).get("/clients").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(402);
        expect(res.body.statut).toBe("essai");
    });

    it("autorise l'accès pendant un essai encore valide (Stripe configuré)", async () => {
        const { token } = await creerUtilisateurEtToken();
        activerStripeFactice();

        const dansTroisJours = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await definirAbonnement({ statut: "essai", essai_fin: dansTroisJours });

        const res = await request(app).get("/clients").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    it("autorise l'accès avec un abonnement actif (Stripe configuré)", async () => {
        const { token } = await creerUtilisateurEtToken();
        activerStripeFactice();
        await definirAbonnement({ statut: "actif" });

        const res = await request(app).get("/devis").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    it("bloque l'accès en cas d'impayé (Stripe configuré)", async () => {
        const { token } = await creerUtilisateurEtToken();
        activerStripeFactice();
        await definirAbonnement({ statut: "impaye" });

        const res = await request(app).get("/factures").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(402);
    });

    it("laisse toujours l'authentification accessible même bloqué", async () => {
        activerStripeFactice();
        await definirAbonnement({ statut: "impaye" });

        const res = await request(app)
            .post("/auth/inscription")
            .send({ email: "nouveau-pendant-blocage@test.com", password: "Passw0rd!" });
        expect(res.status).toBe(201);
    });

    it("renvoie une erreur claire si on tente de payer sans configuration Stripe", async () => {
        const { token } = await creerUtilisateurEtToken({ role: "admin" });
        const res = await request(app)
            .post("/abonnement/creer-session-paiement")
            .set("Authorization", `Bearer ${token}`)
            .send({ offreCode: "pme" });

        expect(res.status).toBe(503);
    });

    it("refuse la création de session de paiement pour un non-admin", async () => {
        activerStripeFactice();
        const { token } = await creerUtilisateurEtToken({ role: "user" });
        const res = await request(app)
            .post("/abonnement/creer-session-paiement")
            .set("Authorization", `Bearer ${token}`)
            .send({ offreCode: "pme" });

        expect(res.status).toBe(403);
    });
});
