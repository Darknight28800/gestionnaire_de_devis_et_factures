import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MARGE = 50;
const LARGEUR_PAGE = 595.28; // A4 portrait, en points

function cheminLogo(logoUrl) {
    if (!logoUrl || !logoUrl.startsWith("/uploads/")) return null;
    const chemin = path.join(__dirname, "..", "uploads", logoUrl.replace("/uploads/", ""));
    return fs.existsSync(chemin) ? chemin : null;
}

function formaterDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR");
}

function formaterMontant(valeur) {
    return `${Number(valeur || 0).toFixed(2).replace(".", ",")} €`;
}

function genererDocument({ type, document, client, lignes, parametres, res }) {
    const doc = new PDFDocument({ margin: MARGE, size: "A4" });
    const estFacture = type === "facture";
    const titre = estFacture ? "FACTURE" : "DEVIS";
    const prefixe = estFacture ? "FA" : "DE";
    const numero = `${prefixe}-${new Date(document.date_creation || Date.now()).getFullYear()}-${String(document.id).padStart(3, "0")}`;
    const couleur = parametres?.couleur_primaire || "#1d4ed8";
    const nomEntreprise = parametres?.nom_entreprise || "Mon Entreprise";

    const nomFichier = `${type}-${document.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nomFichier}"`);
    doc.pipe(res);

    /* ============================ EN-TÊTE ============================ */
    const logo = cheminLogo(parametres?.logo_url);
    let yEntete = MARGE;

    if (logo) {
        try {
            doc.image(logo, MARGE, yEntete, { height: 36 });
        } catch {
            // logo illisible : on ignore silencieusement, le nom suffit
        }
    }

    doc.fillColor("#101828")
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(nomEntreprise, MARGE + (logo ? 50 : 0), yEntete + (logo ? 10 : 0), { width: 280 });

    doc.font("Helvetica")
        .fontSize(9)
        .fillColor("#667085")
        .text("Gestion de devis & factures", MARGE + (logo ? 50 : 0), doc.y + 2);

    doc.font("Helvetica-Bold")
        .fontSize(26)
        .fillColor(couleur)
        .text(titre, MARGE, yEntete, { width: LARGEUR_PAGE - MARGE * 2, align: "right" });

    doc.font("Helvetica")
        .fontSize(9)
        .fillColor("#475467")
        .text(`N° ${numero}`, { align: "right" })
        .text(`Date d'émission : ${formaterDate(document.date_creation)}`, { align: "right" });

    if (estFacture) {
        const echeance = new Date(document.date_creation || Date.now());
        echeance.setDate(echeance.getDate() + (parametres?.delai_paiement_jours || 30));
        doc.text(`Date d'échéance : ${formaterDate(echeance)}`, { align: "right" });
    } else {
        const validite = new Date(document.date_creation || Date.now());
        validite.setDate(validite.getDate() + 30);
        doc.text(`Valable jusqu'au : ${formaterDate(validite)}`, { align: "right" });
    }

    doc.moveDown(2);
    const yRule = Math.max(doc.y, yEntete + 70);
    doc.moveTo(MARGE, yRule).lineTo(LARGEUR_PAGE - MARGE, yRule).lineWidth(2).strokeColor(couleur).stroke();
    doc.y = yRule + 20;

    /* ============================ ÉMETTEUR / FACTURÉ À ============================ */
    const yBlocs = doc.y;
    const largeurColonne = (LARGEUR_PAGE - MARGE * 2 - 30) / 2;

    const ecrireBloc = (x, titreBloc, lignesTexte) => {
        doc.font("Helvetica-Bold").fontSize(9).fillColor(couleur)
            .text(titreBloc.toUpperCase(), x, yBlocs, { width: largeurColonne, characterSpacing: 0.5 });
        doc.font("Helvetica").fontSize(10).fillColor("#101828");
        lignesTexte.filter(Boolean).forEach((ligneTexte) => {
            doc.text(ligneTexte, x, doc.y + 2, { width: largeurColonne });
        });
    };

    ecrireBloc(MARGE, "Émetteur", [
        nomEntreprise,
        parametres?.adresse,
        [parametres?.email, parametres?.telephone].filter(Boolean).join(" • "),
        parametres?.siret ? `SIRET : ${parametres.siret}` : null
    ]);

    ecrireBloc(MARGE + largeurColonne + 30, "Facturé à", [
        client?.nom || "Client",
        client?.adresse,
        [client?.code_postal, client?.ville].filter(Boolean).join(" "),
        client?.email
    ]);

    doc.moveDown(2);
    doc.y = Math.max(doc.y, yBlocs + 90);

    /* ============================ TABLEAU DES LIGNES ============================ */
    const colonnes = [
        { label: "Description", largeur: 250, align: "left" },
        { label: "Qté", largeur: 50, align: "right" },
        { label: "Prix unit. HT", largeur: 90, align: "right" },
        { label: "Total HT", largeur: 90, align: "right" }
    ];
    const largeurTableau = colonnes.reduce((total, c) => total + c.largeur, 0);
    const xTableau = MARGE;
    let y = doc.y + 10;

    // En-tête du tableau
    doc.rect(xTableau, y, largeurTableau, 26).fill(couleur);
    let x = xTableau;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
    colonnes.forEach((colonne) => {
        doc.text(colonne.label.toUpperCase(), x + 8, y + 8, { width: colonne.largeur - 16, align: colonne.align });
        x += colonne.largeur;
    });
    y += 26;

    // Lignes (zébrées)
    doc.font("Helvetica").fontSize(9.5);
    let totalHT = 0;

    lignes.forEach((ligne, index) => {
        const quantite = Number(ligne.quantite) || 0;
        const prix = Number(ligne.prix) || 0;
        const totalLigne = quantite * prix;
        totalHT += totalLigne;

        const hauteurLigne = 24;
        if (index % 2 === 1) {
            doc.rect(xTableau, y, largeurTableau, hauteurLigne).fill("#f1f4f9");
        }

        doc.fillColor("#101828");
        x = xTableau;
        doc.text(ligne.description || "", x + 8, y + 7, { width: colonnes[0].largeur - 16 });
        x += colonnes[0].largeur;
        doc.text(String(quantite), x + 8, y + 7, { width: colonnes[1].largeur - 16, align: "right" });
        x += colonnes[1].largeur;
        doc.text(formaterMontant(prix), x + 8, y + 7, { width: colonnes[2].largeur - 16, align: "right" });
        x += colonnes[2].largeur;
        doc.text(formaterMontant(totalLigne), x + 8, y + 7, { width: colonnes[3].largeur - 16, align: "right" });

        y += hauteurLigne;
    });

    doc.strokeColor("#e2e7f0").lineWidth(1).rect(xTableau, y - (lignes.length * 24) - 26, largeurTableau, (lignes.length * 24) + 26).stroke();
    doc.y = y + 20;

    /* ============================ TOTAUX ============================ */
    const tvaApplicable = !parametres?.mention_tva;
    const totalTVA = tvaApplicable ? totalHT * 0.2 : 0;
    const totalTTC = totalHT + totalTVA;

    const xTotaux = xTableau + largeurTableau - 220;
    const largeurTotaux = 220;

    const ligneTotal = (libelle, montant, gras = false) => {
        doc.font(gras ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor("#101828");
        doc.text(libelle, xTotaux, doc.y, { width: 120, continued: false });
        doc.text(montant, xTotaux + 120, doc.y - doc.currentLineHeight(), { width: 100, align: "right" });
        doc.moveDown(0.4);
    };

    ligneTotal("Total HT", formaterMontant(totalHT));
    ligneTotal(tvaApplicable ? "TVA (20 %)" : "TVA", tvaApplicable ? formaterMontant(totalTVA) : "Non applicable");

    doc.moveDown(0.2);
    const yBandeau = doc.y;
    doc.rect(xTotaux, yBandeau, largeurTotaux, 26).fill(couleur);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
    doc.text("TOTAL TTC", xTotaux + 10, yBandeau + 8, { width: 110 });
    doc.text(formaterMontant(totalTTC), xTotaux + 110, yBandeau + 8, { width: 100, align: "right" });
    doc.y = yBandeau + 26 + 25;

    /* ============================ MODALITÉS / VALIDITÉ ============================ */
    if (estFacture) {
        doc.font("Helvetica-Bold").fontSize(9).fillColor(couleur)
            .text("MODALITÉS DE RÈGLEMENT", MARGE, doc.y, { characterSpacing: 0.5 });
        doc.font("Helvetica").fontSize(9.5).fillColor("#101828").moveDown(0.4);
        doc.text(`Conditions : paiement à réception, sous ${parametres?.delai_paiement_jours || 30} jours.`);
        if (parametres?.iban) doc.text(`IBAN : ${parametres.iban}${parametres?.bic ? `   BIC : ${parametres.bic}` : ""}`);
        doc.moveDown(1);
    } else {
        doc.font("Helvetica").fontSize(9.5).fillColor("#475467")
            .text("Ce devis est valable 30 jours à compter de sa date d'émission. Bon pour accord, à retourner signé.");
        doc.moveDown(1);
    }

    /* ============================ PIED DE PAGE LÉGAL ============================ */
    const bas = 792 - MARGE - 40; // A4 = 842pt de haut, on ancre le pied de page en bas
    doc.font("Helvetica").fontSize(7.5).fillColor("#98a2b3");
    const mentions = [
        "En application de la loi, tout retard de paiement entraîne l'exigibilité d'une pénalité égale à 3 fois le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 €.",
        "Aucun escompte ne sera accordé pour paiement anticipé.",
        parametres?.mention_tva || null,
        [nomEntreprise, parametres?.email, parametres?.siret ? `SIRET : ${parametres.siret}` : null].filter(Boolean).join(" • ")
    ].filter(Boolean);

    doc.text(mentions.join("\n"), MARGE, bas, { width: LARGEUR_PAGE - MARGE * 2, align: "center" });

    doc.end();
}

export function genererPdfDevis({ devis, client, lignes, res }, parametres) {
    genererDocument({ type: "devis", document: devis, client, lignes, parametres, res });
}

export function genererPdfFacture({ facture, client, lignes, res }, parametres) {
    genererDocument({ type: "facture", document: facture, client, lignes, parametres, res });
}
