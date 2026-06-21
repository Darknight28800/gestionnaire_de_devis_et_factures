import nodemailer from "nodemailer";
import { DevisModele } from "../modeles/devisModele.js";
import { FactureModele } from "../modeles/factureModele.js";

export class EmailService {

    static async envoyerDevis(id) {
        const devis = await DevisModele.parId(id);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: devis.client.email,
            subject: `Votre devis #${id}`,
            html: `<p>Bonjour, voici votre devis.</p>`
        });
    }

    static async envoyerFacture(id) {
        const facture = await FactureModele.parId(id);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: facture.client.email,
            subject: `Votre facture #${id}`,
            html: `<p>Bonjour, voici votre facture.</p>`
        });
    }
}
