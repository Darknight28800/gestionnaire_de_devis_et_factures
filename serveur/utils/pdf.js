import PDFDocument from "pdfkit";

function genererDocument({ type, id, client, lignes, statut, date, res }) {
    const doc = new PDFDocument({ margin: 50 });
    const nomFichier = `${type === "devis" ? "devis" : "facture"}-${id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nomFichier}"`);
    doc.pipe(res);

    const titre = type === "devis" ? "DEVIS" : "FACTURE";
    doc.fontSize(22).text(`${titre} #${id}`, { align: "right" });
    doc.moveDown();

    doc.fontSize(11).fillColor("#555").text(`Date : ${new Date(date).toLocaleDateString("fr-FR")}`, { align: "right" });
    doc.text(`Statut : ${statut}`, { align: "right" });
    doc.moveDown(2);

    doc.fillColor("#000").fontSize(13).text("Client", { underline: true });
    doc.fontSize(11);
    doc.text(client?.nom || "—");
    if (client?.email) doc.text(client.email);
    if (client?.telephone) doc.text(client.telephone);
    if (client?.adresse) doc.text(client.adresse);
    doc.moveDown(2);

    doc.fontSize(13).text("Lignes", { underline: true });
    doc.moveDown(0.5);

    const colX = { description: 50, quantite: 300, prix: 370, total: 450 };
    doc.fontSize(10).fillColor("#555");
    doc.text("Description", colX.description, doc.y, { continued: false });
    doc.text("Qté", colX.quantite, doc.y - doc.currentLineHeight());
    doc.text("Prix", colX.prix, doc.y - doc.currentLineHeight());
    doc.text("Total", colX.total, doc.y - doc.currentLineHeight());
    doc.moveDown(0.5);
    doc.strokeColor("#ccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fillColor("#000").fontSize(10);
    let totalHT = 0;
    for (const ligne of lignes) {
        const quantite = Number(ligne.quantite) || 0;
        const prix = Number(ligne.prix) || 0;
        const totalLigne = quantite * prix;
        totalHT += totalLigne;

        const y = doc.y;
        doc.text(ligne.description || "", colX.description, y, { width: 240 });
        doc.text(String(quantite), colX.quantite, y);
        doc.text(`${prix.toFixed(2)} €`, colX.prix, y);
        doc.text(`${totalLigne.toFixed(2)} €`, colX.total, y);
        doc.moveDown(0.8);
    }

    const totalTVA = totalHT * 0.2;
    const totalTTC = totalHT + totalTVA;

    doc.moveDown(1);
    doc.strokeColor("#ccc").moveTo(300, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Total HT : ${totalHT.toFixed(2)} €`, 300, doc.y, { align: "right" });
    doc.text(`TVA (20%) : ${totalTVA.toFixed(2)} €`, 300, doc.y, { align: "right" });
    doc.fontSize(13).text(`Total TTC : ${totalTTC.toFixed(2)} €`, 300, doc.y, { align: "right" });

    doc.end();
}

export function genererPdfDevis({ devis, client, lignes, res }) {
    genererDocument({
        type: "devis",
        id: devis.id,
        client,
        lignes,
        statut: devis.statut,
        date: devis.date_creation,
        res
    });
}

export function genererPdfFacture({ facture, client, lignes, res }) {
    genererDocument({
        type: "facture",
        id: facture.id,
        client,
        lignes,
        statut: facture.statut,
        date: facture.date_creation,
        res
    });
}
