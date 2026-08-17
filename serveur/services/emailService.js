import nodemailer from "nodemailer";
import { DevisModele } from "../modeles/devisModele.js";
import { FactureModele } from "../modeles/factureModele.js";
import { ClientModele } from "../modeles/clientModele.js";

const creerTransporteur = () =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

export class EmailService {

    static async envoyerDevis(id) {
        const devis = await DevisModele.parId(id);
        if (!devis) throw new Error("Devis introuvable");

        const client = await ClientModele.trouverParId(devis.client_id);
        if (!client || !client.email) throw new Error("Client introuvable ou sans email");

        await creerTransporteur().sendMail({
            from: process.env.EMAIL_USER,
            to: client.email,
            subject: `Votre devis #${id}`,
            html: `<p>Bonjour ${client.nom || ""}, voici votre devis n°${id}.</p>`
        });
    }

    static async envoyerFacture(id) {
        const facture = await FactureModele.parId(id);
        if (!facture) throw new Error("Facture introuvable");

        const client = await ClientModele.trouverParId(facture.client_id);
        if (!client || !client.email) throw new Error("Client introuvable ou sans email");

        await creerTransporteur().sendMail({
            from: process.env.EMAIL_USER,
            to: client.email,
            subject: `Votre facture #${id}`,
            html: `<p>Bonjour ${client.nom || ""}, voici votre facture n°${id}.</p>`
        });
    }
}
