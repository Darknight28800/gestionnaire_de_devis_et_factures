import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken, creerClient } from "./helpers.js";

async function creerDevis(token, clientId, overrides = {}) {
    return request(app)
        .post("/devis")
        .set("Authorization", `Bearer ${token}`)
        .send({
            client_id: clientId,
            titre: "Devis Test",
            description: "Un devis de test",
            statut: "brouillon",
            montant: 240,
            lignes: [
                { description: "Prestation A", quantite: 2, prix: 100 },
                { description: "Prestation B", quantite: 1, prix: 40 }
            ],
            ...overrides
        });
}

describe("Devis", () => {
    it("crée un devis avec ses lignes et récupère le détail complet", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);

        const creation = await creerDevis(token, client.id);
        expect(creation.status).toBe(201);
        expect(creation.body.devis_id).toBeTruthy();

        const detail = await request(app)
            .get(`/devis/${creation.body.devis_id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(detail.status).toBe(200);
        expect(detail.body.client.nom).toBe("Client Test");
        expect(detail.body.lignes).toHaveLength(2);
        expect(detail.body.historique.length).toBeGreaterThanOrEqual(1);
    });

    it("liste les devis avec le nom du client et le montant", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        await creerDevis(token, client.id);

        const res = await request(app).get("/devis").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body[0].client_nom).toBe("Client Test");
        expect(Number(res.body[0].montant_total)).toBe(240);
    });

    it("met à jour un devis et remplace ses lignes", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const creation = await creerDevis(token, client.id);

        const res = await request(app)
            .put(`/devis/${creation.body.devis_id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                client_id: client.id,
                titre: "Devis modifié",
                description: "Maj",
                statut: "envoye",
                montant: 100,
                lignes: [{ description: "Nouvelle ligne", quantite: 1, prix: 100 }]
            });

        expect(res.status).toBe(200);

        const detail = await request(app)
            .get(`/devis/${creation.body.devis_id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(detail.body.titre).toBe("Devis modifié");
        expect(detail.body.statut).toBe("envoye");
        expect(detail.body.lignes).toHaveLength(1);
    });

    it("supprime un devis (admin uniquement)", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const creation = await creerDevis(token, client.id);

        const { token: adminToken } = await creerUtilisateurEtToken({ email: "admin-devis@test.com", role: "admin" });

        const refus = await request(app)
            .delete(`/devis/${creation.body.devis_id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(refus.status).toBe(403);

        const res = await request(app)
            .delete(`/devis/${creation.body.devis_id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);

        const detail = await request(app)
            .get(`/devis/${creation.body.devis_id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(detail.status).toBe(404);
    });

    it("génère un PDF pour un devis", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const creation = await creerDevis(token, client.id);

        const res = await request(app)
            .get(`/devis/${creation.body.devis_id}/pdf`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toBe("application/pdf");
    });
});
