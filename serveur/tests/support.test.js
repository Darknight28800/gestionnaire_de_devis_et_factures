import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken } from "./helpers.js";

describe("Support", () => {
    it("crée un ticket de support pour un utilisateur connecté", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app)
            .post("/support/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({ sujet: "Problème", message: "Ça ne marche pas" });

        expect(res.status).toBe(201);
    });

    it("refuse la création d'un ticket sans sujet", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app)
            .post("/support/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({ message: "Ça ne marche pas" });

        expect(res.status).toBe(400);
    });

    it("refuse la liste des tickets pour un utilisateur non-admin", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app).get("/support/tickets").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it("permet à un admin de marquer un ticket comme résolu", async () => {
        const { token } = await creerUtilisateurEtToken({ email: "user2@test.com" });
        const creation = await request(app)
            .post("/support/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({ sujet: "Problème", message: "Ça ne marche pas" });

        const { token: adminToken } = await creerUtilisateurEtToken({ email: "admin6@test.com", role: "admin" });
        const liste = await request(app).get("/support/tickets").set("Authorization", `Bearer ${adminToken}`);
        const ticketId = liste.body[0].id;

        const res = await request(app)
            .patch(`/support/tickets/${ticketId}/resoudre`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);

        const relecture = await request(app).get("/support/tickets").set("Authorization", `Bearer ${adminToken}`);
        expect(relecture.body[0].statut).toBe("resolu");
    });

    it("liste les tickets pour un admin avec le nom de l'utilisateur", async () => {
        const { token } = await creerUtilisateurEtToken({ email: "user1@test.com" });
        await request(app)
            .post("/support/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({ sujet: "Problème", message: "Ça ne marche pas" });

        const { token: adminToken } = await creerUtilisateurEtToken({ email: "admin5@test.com", role: "admin" });
        const res = await request(app).get("/support/tickets").set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body[0].utilisateur_email).toBe("user1@test.com");
    });
});
