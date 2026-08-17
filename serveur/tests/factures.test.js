import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken, creerClient } from "./helpers.js";

async function creerDevisAccepte(token, clientId) {
    const res = await request(app)
        .post("/devis")
        .set("Authorization", `Bearer ${token}`)
        .send({
            client_id: clientId,
            titre: "Devis à convertir",
            statut: "accepte",
            montant: 240,
            lignes: [{ description: "Prestation", quantite: 2, prix: 120 }]
        });
    return res.body.devis_id;
}

describe("Factures", () => {
    it("crée une facture directement avec ses lignes", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);

        const res = await request(app)
            .post("/factures")
            .set("Authorization", `Bearer ${token}`)
            .send({
                client_id: client.id,
                statut: "non_payee",
                montant: 150,
                lignes: [{ description: "Service", quantite: 1, prix: 150 }]
            });

        expect(res.status).toBe(201);
        expect(res.body.facture_id).toBeTruthy();
    });

    it("convertit un devis accepté en facture avec les mêmes lignes", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const devisId = await creerDevisAccepte(token, client.id);

        const res = await request(app)
            .post(`/factures/convertir/${devisId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.facture.devis_id).toBe(devisId);
        expect(res.body.facture.lignes).toHaveLength(1);

        const devisDetail = await request(app)
            .get(`/devis/${devisId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(devisDetail.body.historique.some(h => h.message.includes("Converti en facture"))).toBe(true);
    });

    it("marque une facture comme payée", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const devisId = await creerDevisAccepte(token, client.id);
        const conversion = await request(app)
            .post(`/factures/convertir/${devisId}`)
            .set("Authorization", `Bearer ${token}`);
        const factureId = conversion.body.facture.id;

        const res = await request(app)
            .patch(`/factures/${factureId}/payer`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);

        const detail = await request(app)
            .get(`/factures/${factureId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(detail.body.statut).toBe("payee");
    });

    it("pagine, recherche et trie les factures", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);

        for (let i = 0; i < 3; i++) {
            await request(app)
                .post("/factures")
                .set("Authorization", `Bearer ${token}`)
                .send({ client_id: client.id, montant: 100 + i, lignes: [] });
        }

        const res = await request(app)
            .get("/factures?page=1&limit=2&sort=montant&order=asc")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.factures).toHaveLength(2);
        expect(res.body.total).toBe(3);
        expect(res.body.totalPages).toBe(2);
    });

    it("refuse la suppression d'une facture par un utilisateur non-admin", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const creation = await request(app)
            .post("/factures")
            .set("Authorization", `Bearer ${token}`)
            .send({ client_id: client.id, montant: 100, lignes: [] });

        const res = await request(app)
            .delete(`/factures/${creation.body.facture_id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
});
