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
import { erreurMiddleware } from "./intergiciels/erreurMiddleware.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.APP_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/devis", devisRoutes);
app.use("/factures", factureRoutes);
app.use("/tableau-de-bord", tableauDeBordRoutes);
app.use("/emails", emailsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/parametres", parametresRoutes);
app.use("/admin", adminRoutes);
app.use("/support", supportRoutes);

app.use(erreurMiddleware);

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Serveur API lancé sur le port ${PORT}`);
    });
}

export default app;
