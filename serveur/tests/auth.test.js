import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Authentification", () => {
    it("inscrit un nouvel utilisateur sans exposer le mot de passe", async () => {
        const res = await request(app)
            .post("/auth/inscription")
            .send({ nom: "Alice", email: "alice@test.com", password: "Passw0rd!" });

        expect(res.status).toBe(201);
        expect(res.body.email).toBe("alice@test.com");
        expect(res.body.mot_de_passe).toBeUndefined();
    });

    it("refuse une inscription sans email ni mot de passe", async () => {
        const res = await request(app).post("/auth/inscription").send({ nom: "Alice" });
        expect(res.status).toBe(400);
    });

    it("refuse une inscription en doublon (même email)", async () => {
        await request(app).post("/auth/inscription").send({ email: "bob@test.com", password: "Passw0rd!" });
        const res = await request(app).post("/auth/inscription").send({ email: "bob@test.com", password: "Autre1!" });
        expect(res.status).toBe(409);
    });

    it("connecte un utilisateur avec les bons identifiants et renvoie un token", async () => {
        await request(app).post("/auth/inscription").send({ email: "carol@test.com", password: "Passw0rd!" });
        const res = await request(app).post("/auth/connexion").send({ email: "carol@test.com", password: "Passw0rd!" });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeTruthy();
        expect(res.body.utilisateur.email).toBe("carol@test.com");
    });

    it("refuse une connexion avec un mauvais mot de passe", async () => {
        await request(app).post("/auth/inscription").send({ email: "dave@test.com", password: "Passw0rd!" });
        const res = await request(app).post("/auth/connexion").send({ email: "dave@test.com", password: "mauvais" });
        expect(res.status).toBe(400);
    });

    it("refuse l'accès à /auth/me sans token", async () => {
        const res = await request(app).get("/auth/me");
        expect(res.status).toBe(401);
    });

    it("attribue automatiquement le rôle admin au tout premier compte créé", async () => {
        const premier = await request(app)
            .post("/auth/inscription")
            .send({ email: "premier@test.com", password: "Passw0rd!" });
        expect(premier.body.role).toBe("admin");

        const second = await request(app)
            .post("/auth/inscription")
            .send({ email: "second@test.com", password: "Passw0rd!" });
        expect(second.body.role).toBe("user");
    });

    it("renvoie l'utilisateur connecté sur /auth/me avec un token valide", async () => {
        await request(app).post("/auth/inscription").send({ nom: "Eve", email: "eve@test.com", password: "Passw0rd!" });
        const login = await request(app).post("/auth/connexion").send({ email: "eve@test.com", password: "Passw0rd!" });

        const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${login.body.token}`);
        expect(res.status).toBe(200);
        expect(res.body.utilisateur.email).toBe("eve@test.com");
    });
});
