import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function envoyerEmailFacture({ destinataire, sujet, templatePath, variables }) {
    // 1) Charger le HTML depuis le fichier
    const fichierTemplate = path.join(__dirname, "..", "emails", templatePath);
    let html = fs.readFileSync(fichierTemplate, "utf8");

    // 2) Remplacer les variables {{...}} dans le HTML
    Object.entries(variables).forEach(([cle, valeur]) => {
        html = html.replace(new RegExp(`{{${cle}}}`, "g"), valeur);
    });

    // 3) Configurer le transporteur Nodemailer
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // 4) Envoyer l’e‑mail
    await transporter.sendMail({
        from: `"Gestionnaire Factures" <${process.env.EMAIL_USER}>`,
        to: destinataire,
        subject: sujet,
        html: html
    });
}
