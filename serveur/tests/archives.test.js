import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken, creerClient } from "./helpers.js";

async function creerDevis(token, clientId) {
    const res = await request(app)
        .post("/devis")
        .set("Authorization", `Bearer ${token}`)
        .send({
            client_id: clientId,
            titre: "Devis à archiver",
            statut: "accepte",
            montant: 100,
            lignes: [{ description: "Service", quantite: 1, prix: 100 }]
        });
    return res.body.devis_id;
}

describe("Archivage", () => {
    it("archive un devis puis le désarchive", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const devisId = await creerDevis(token, client.id);

        const archivage = await request(app)
            .patch(`/devis/${devisId}/archiver`)
            .set("Authorization", `Bearer ${token}`);
        expect(archivage.status).toBe(200);

        // n'apparaît plus dans la liste active
        const liste = await request(app).get("/devis").set("Authorization", `Bearer ${token}`);
        expect(liste.body.find(d => d.id === devisId)).toBeUndefined();

        // apparaît dans les archives
        const archives = await request(app).get("/devis/archives").set("Authorization", `Bearer ${token}`);
        expect(archives.body.devis.find(d => d.id === devisId)).toBeTruthy();
        expect(archives.body.dureeConservationAnnees).toBe(5);

        const desarchivage = await request(app)
            .patch(`/devis/${devisId}/desarchiver`)
            .set("Authorization", `Bearer ${token}`);
        expect(desarchivage.status).toBe(200);

        const listeApres = await request(app).get("/devis").set("Authorization", `Bearer ${token}`);
        expect(listeApres.body.find(d => d.id === devisId)).toBeTruthy();
    });

    it("archive une facture et l'exclut de la liste paginée active", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);

        const creation = await request(app)
            .post("/factures")
            .set("Authorization", `Bearer ${token}`)
            .send({ client_id: client.id, montant: 100, statut: "payee", lignes: [] });
        const factureId = creation.body.facture_id;

        await request(app).patch(`/factures/${factureId}/archiver`).set("Authorization", `Bearer ${token}`);

        const liste = await request(app).get("/factures?page=1&limit=10").set("Authorization", `Bearer ${token}`);
        expect(liste.body.factures.find(f => f.id === factureId)).toBeUndefined();

        const archives = await request(app).get("/factures/archives").set("Authorization", `Bearer ${token}`);
        expect(archives.body.factures.find(f => f.id === factureId)).toBeTruthy();
    });

    it("purge définitivement les archives expirées (> 5 ans) via l'action admin", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        const devisId = await creerDevis(token, client.id);

        await request(app).patch(`/devis/${devisId}/archiver`).set("Authorization", `Bearer ${token}`);

        // Simule une archive vieille de plus de 5 ans directement en base
        const pool = (await import("../config/base_de_donnees.js")).default;
        await pool.query(
            "UPDATE devis SET archive_le = DATE_SUB(NOW(), INTERVAL 6 YEAR) WHERE id = ?",
            [devisId]
        );

        const { token: adminToken } = await creerUtilisateurEtToken({ email: "admin-purge@test.com", role: "admin" });
        const purge = await request(app)
            .post("/admin/purger-archives")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(purge.status).toBe(200);
        expect(purge.body.devisSupprimes).toBeGreaterThanOrEqual(1);

        const detail = await request(app).get(`/devis/${devisId}`).set("Authorization", `Bearer ${token}`);
        expect(detail.status).toBe(404);
    });

    it("refuse la purge manuelle pour un utilisateur non-admin", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app).post("/admin/purger-archives").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
});
