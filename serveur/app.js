import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import devisRoutes from "./routes/devisRoutes.js";
import emailsRoutes from "./routes/emailsRoutes.js";
import factureRoutes from "./routes/factureRoutes.js";
import tableauDeBordRoutes from "./routes/tableauDeBordRoutes.js";
import parametresRoutes from "./routes/parametresRoutes.js";
import adminRoutes from "./routes/admin.js";
import supportRoutes from "./routes/support.js";
import abonnementRoutes from "./routes/abonnementRoutes.js";
import { AbonnementControleur } from "./controleurs/abonnementControleur.js";
import verifierAbonnement from "./intergiciels/verifierAbonnement.js";
import { erreurMiddleware } from "./intergiciels/erreurMiddleware.js";

dotenv.config();

const app = express();

// .trim() : une variable d'environnement copiée-collée depuis un dashboard (Railway, etc.)
// embarque parfois un espace ou un retour à la ligne invisible en fin de valeur, ce qui fait
// planter le module cors avec "Invalid character in header content" au moment d'écrire l'en-tête.
app.use(
    cors({
        origin: process.env.APP_URL?.trim() || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// 📌 Le webhook Stripe a besoin du corps brut (non-JSON) pour vérifier la signature —
// il doit donc être monté AVANT express.json().
app.post(
    "/abonnement/webhook",
    express.raw({ type: "application/json" }),
    AbonnementControleur.webhook
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/abonnement", abonnementRoutes);

// 📌 Routes métier : bloquées si la période d'essai est terminée sans abonnement actif
app.use("/clients", verifierAbonnement, clientRoutes);
app.use("/devis", verifierAbonnement, devisRoutes);
app.use("/factures", verifierAbonnement, factureRoutes);
app.use("/tableau-de-bord", verifierAbonnement, tableauDeBordRoutes);
app.use("/emails", verifierAbonnement, emailsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/parametres", verifierAbonnement, parametresRoutes);
app.use("/admin", verifierAbonnement, adminRoutes);
app.use("/support", verifierAbonnement, supportRoutes);

app.use(erreurMiddleware);

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Serveur API lancé sur le port ${PORT}`);
    });
}

export default app;
