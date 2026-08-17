import request from "supertest";
import app from "../app.js";

export async function creerUtilisateurEtToken({ email = "user@test.com", password = "Passw0rd!", role = "user" } = {}) {
    await request(app).post("/auth/inscription").send({ nom: "Test", email, password });

    // Le premier compte créé après une remise à zéro de la base devient admin automatiquement
    // (voir authControleur.inscription) : on force explicitement le rôle demandé pour des tests déterministes.
    const pool = (await import("../config/base_de_donnees.js")).default;
    await pool.query("UPDATE utilisateurs SET role = ? WHERE email = ?", [role, email]);

    const res = await request(app).post("/auth/connexion").send({ email, password });
    return { token: res.body.token, utilisateur: res.body.utilisateur };
}

export async function creerClient(token, overrides = {}) {
    const res = await request(app)
        .post("/clients")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nom: "Client Test",
            email: "client@test.com",
            telephone: "0600000000",
            adresse: "1 rue Test",
            ville: "Paris",
            code_postal: "75000",
            pays: "France",
            ...overrides
        });
    return res.body;
}
