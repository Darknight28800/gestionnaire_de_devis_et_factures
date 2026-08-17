import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/base_de_donnees.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const creerTransporteur = () =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

export async function envoyerEmailFacture({ destinataire, sujet, templatePath, variables }) {
    // 1) Charger le HTML depuis le fichier
    const fichierTemplate = path.join(__dirname, "..", "emails", templatePath);
    let html = fs.readFileSync(fichierTemplate, "utf8");

    // 2) Remplacer les variables {{...}} dans le HTML
    Object.entries(variables).forEach(([cle, valeur]) => {
        html = html.replace(new RegExp(`{{${cle}}}`, "g"), valeur);
    });

    // 3) Envoyer l'e‑mail
    await creerTransporteur().sendMail({
        from: `"Gestionnaire Factures" <${process.env.EMAIL_USER}>`,
        to: destinataire,
        subject: sujet,
        html: html
    });
}

// 📌 Copie d'un ticket de support envoyée à l'adresse mail pro de l'exploitant de l'app
export async function envoyerEmailTicketSupport({ nom, email, sujet, message }) {
    const destinataire = process.env.SUPPORT_ADMIN_EMAIL;
    if (!destinataire) return;

    await creerTransporteur().sendMail({
        from: `"Support FacturePro" <${process.env.EMAIL_USER}>`,
        to: destinataire,
        replyTo: email,
        subject: `[Ticket support] ${sujet}`,
        html: `
            <p>Nouveau ticket de support créé par ${nom || "un utilisateur"} (${email}).</p>
            <p><strong>Sujet :</strong> ${sujet}</p>
            <p><strong>Message :</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
        `
    });
}

// 📌 Rappel de fin d'essai gratuit, envoyé à tous les administrateurs
export async function envoyerEmailRappelEssai() {
    const [admins] = await pool.query(
        "SELECT email, nom FROM utilisateurs WHERE role = 'admin'"
    );
    if (!admins.length) return;

    const transporteur = creerTransporteur();

    for (const admin of admins) {
        await transporteur.sendMail({
            from: `"Gestionnaire Factures" <${process.env.EMAIL_USER}>`,
            to: admin.email,
            subject: "Votre période d'essai se termine bientôt",
            html: `
                <p>Bonjour ${admin.nom || ""},</p>
                <p>Votre période d'essai gratuite de l'application se termine dans quelques jours.</p>
                <p>Votre carte enregistrée sera automatiquement débitée à la fin de l'essai pour poursuivre votre abonnement.
                Vous pouvez à tout moment gérer votre abonnement depuis la page <strong>Abonnement</strong> de l'application.</p>
            `
        });
    }
}
