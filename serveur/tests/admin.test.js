import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { creerUtilisateurEtToken } from "./helpers.js";

describe("Administration", () => {
    it("refuse l'accès aux routes admin pour un utilisateur normal", async () => {
        const { token } = await creerUtilisateurEtToken();
        const res = await request(app).get("/admin/utilisateurs").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it("liste les utilisateurs pour un admin", async () => {
        const { token } = await creerUtilisateurEtToken({ email: "admin1@test.com", role: "admin" });
        const res = await request(app).get("/admin/utilisateurs").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.some(u => u.email === "admin1@test.com")).toBe(true);
    });

    it("crée un utilisateur avec un mot de passe temporaire", async () => {
        const { token } = await creerUtilisateurEtToken({ email: "admin2@test.com", role: "admin" });
        const res = await request(app)
            .post("/admin/utilisateurs")
            .set("Authorization", `Bearer ${token}`)
            .send({ nom: "Nouveau", email: "nouveau@test.com", role: "user" });

        expect(res.status).toBe(200);
        expect(res.body.utilisateur.email).toBe("nouveau@test.com");
        expect(res.body.motDePasseTemporaire).toBeTruthy();
    });

    it("crée, liste et supprime un rôle", async () => {
        const { token } = await creerUtilisateurEtToken({ email: "admin3@test.com", role: "admin" });

        const creation = await request(app)
            .post("/admin/roles")
            .set("Authorization", `Bearer ${token}`)
            .send({ nom: "Comptable", permissions: ["voir_factures"] });
        expect(creation.status).toBe(201);

        const liste = await request(app).get("/admin/roles").set("Authorization", `Bearer ${token}`);
        expect(liste.body).toHaveLength(1);
        expect(liste.body[0].permissions).toEqual(["voir_factures"]);

        const suppression = await request(app)
            .delete(`/admin/roles/${creation.body.role.id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(suppression.status).toBe(200);
    });

    it("enregistre et pagine les logs d'audit", async () => {
        const { token } = await creerUtilisateurEtToken({ email: "admin4@test.com", role: "admin" });

        await request(app)
            .post("/admin/roles")
            .set("Authorization", `Bearer ${token}`)
            .send({ nom: "Support", permissions: [] });

        const res = await request(app).get("/admin/logs?page=1").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.logs.length).toBeGreaterThan(0);
    });
});
