import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken, creerClient } from "./helpers.js";

describe("Clients", () => {
    it("refuse l'accès sans authentification", async () => {
        const res = await request(app).get("/clients");
        expect(res.status).toBe(401);
    });

    it("crée puis liste un client", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);
        expect(client.id).toBeTruthy();

        const res = await request(app).get("/clients").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].nom).toBe("Client Test");
    });

    it("modifie un client", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);

        const res = await request(app)
            .put(`/clients/${client.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...client, nom: "Client Modifié" });

        expect(res.status).toBe(200);
        expect(res.body.nom).toBe("Client Modifié");
    });

    it("supprime un client", async () => {
        const { token } = await creerUtilisateurEtToken();
        const client = await creerClient(token);

        const res = await request(app).delete(`/clients/${client.id}`).set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(204);

        const liste = await request(app).get("/clients").set("Authorization", `Bearer ${token}`);
        expect(liste.body).toHaveLength(0);
    });
});
