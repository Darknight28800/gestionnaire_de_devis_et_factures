import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import devisRoutes from "./routes/devisRoutes.js";
import emailsRoutes from "./routes/emailsRoutes.js"
import factureRoutes from "./routes/factureRoutes.js";
import tableauDeBordRoutes from "./routes/tableauDeBordRoutes.js";
import parametresRoutes from "./routes/parametresRoutes.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

app.use((req, res, next) => {
    console.log("🔥 Requête reçue AVANT routes :", req.method, req.url);
    next();
});

app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/devis", devisRoutes);
app.use("/factures", factureRoutes);
app.use("/tableau-de-bord", tableauDeBordRoutes);
app.use("/emails", emailsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/parametres", parametresRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur API lancé sur le port ${PORT}`);
});
