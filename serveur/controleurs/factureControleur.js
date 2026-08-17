import { FactureModele } from "../modeles/factureModele.js";
import { FactureLigneModele } from "../modeles/factureLigneModele.js";
import { DevisModele } from "../modeles/devisModele.js";
import { DevisLigneModele } from "../modeles/devisLigneModele.js";
import { HistoriqueModele } from "../modeles/historiqueModele.js";
import { ClientModele } from "../modeles/clientModele.js";
import { LogModele } from "../modeles/logModele.js";
import { envoyerEmailFacture } from "../utils/email.js";
import { genererPdfFacture } from "../utils/pdf.js";

const identiteUtilisateur = (req) => req.utilisateur.email || `utilisateur #${req.utilisateur.id}`;

export const FactureControleur = {

    // 📌 Route unique : pagination + recherche + tri
    async paginer(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || "id";
            const order = req.query.order || "DESC";
            const search = req.query.search || null;

            const resultat = await FactureModele.rechercherOuPaginer({
                search,
                page,
                limit,
                sort,
                order
            });

            res.json(resultat);
        } catch (e) {
            next(e);
        }
    },

    // 📌 Liste de toutes les factures (non paginée)
    async liste(req, res, next) {
        try {
            const factures = await FactureModele.tous();
            res.json(factures);
        } catch (e) {
            next(e);
        }
    },

    // 📌 Détail d'une facture + ses lignes
    async detail(req, res, next) {
        try {
            const facture = await FactureModele.parId(req.params.id);
            if (!facture) return res.status(404).json({ message: "Facture introuvable" });

            const lignes = await FactureLigneModele.parFacture(req.params.id);
            const historique = await HistoriqueModele.parElement("facture", req.params.id);
            const client = await ClientModele.trouverParId(facture.client_id);

            res.json({ ...facture, client, lignes, historique });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Créer une facture + lignes
    async creer(req, res, next) {
        try {
            const utilisateur_id = req.utilisateur.id;
            const facture = await FactureModele.creer({ ...req.body, utilisateur_id });

            if (req.body.lignes && Array.isArray(req.body.lignes)) {
                for (const ligne of req.body.lignes) {
                    await FactureLigneModele.creer({
                        ...ligne,
                        facture_id: facture.id
                    });
                }
            }

            await HistoriqueModele.ajouter("facture", facture.id, "Facture créée");
            await LogModele.ajouter(identiteUtilisateur(req), `Création de la facture #${facture.id}`);

            res.status(201).json({ message: "Facture créée", facture_id: facture.id });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Convertir un devis en facture
    async convertirDepuisDevis(req, res, next) {
        try {
            const devisId = req.params.devisId;

            const devis = await DevisModele.parId(devisId);
            if (!devis) {
                return res.status(404).json({ message: "Devis introuvable" });
            }

            const lignesDevis = await DevisLigneModele.parDevis(devisId);

            const factureCreee = await FactureModele.creer({
                devis_id: devisId,
                client_id: devis.client_id,
                utilisateur_id: devis.utilisateur_id,
                montant: devis.montant,
                date_facture: new Date(),
                statut: "non_payee"
            });
            const factureId = factureCreee.id;

            for (const ligne of lignesDevis) {
                await FactureLigneModele.creer({
                    facture_id: factureId,
                    description: ligne.description,
                    quantite: ligne.quantite,
                    prix: ligne.prix
                });
            }

            await HistoriqueModele.ajouter("facture", factureId, `Facture générée depuis le devis #${devisId}`);
            await HistoriqueModele.ajouter("devis", devisId, `Converti en facture #${factureId}`);
            await LogModele.ajouter(identiteUtilisateur(req), `Conversion du devis #${devisId} en facture #${factureId}`);

            const facture = await FactureModele.parId(factureId);
            const lignes = await FactureLigneModele.parFacture(factureId);

            res.json({
                message: "Facture créée depuis le devis",
                facture: { ...facture, lignes }
            });

        } catch (e) {
            next(e);
        }
    },

    // 📌 Modifier une facture + lignes
    async mettreAJour(req, res, next) {
        try {
            const facture = await FactureModele.mettreAJour(req.params.id, req.body);

            await FactureLigneModele.supprimerParFacture(req.params.id);

            if (req.body.lignes && Array.isArray(req.body.lignes)) {
                for (const ligne of req.body.lignes) {
                    await FactureLigneModele.creer({
                        ...ligne,
                        facture_id: req.params.id
                    });
                }
            }

            await HistoriqueModele.ajouter("facture", req.params.id, "Facture mise à jour");
            await LogModele.ajouter(identiteUtilisateur(req), `Modification de la facture #${req.params.id}`);

            res.json({ message: "Facture mise à jour", facture });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Marquer une facture comme payée
    async marquerCommePaye(req, res, next) {
        try {
            const factureId = req.params.id;

            const facture = await FactureModele.parId(factureId);
            if (!facture) {
                return res.status(404).json({ message: "Facture introuvable" });
            }

            await FactureModele.payer(factureId);
            await HistoriqueModele.ajouter("facture", factureId, "Facture marquée comme payée");
            await LogModele.ajouter(identiteUtilisateur(req), `Facture #${factureId} marquée comme payée`);

            res.json({
                message: "Facture marquée comme payée",
                facture_id: factureId
            });

        } catch (e) {
            next(e);
        }
    },

    // 📌 Envoyer une facture par e‑mail (avec destinataire personnalisé + template)
    async envoyerParEmail(req, res, next) {
        try {
            const factureId = req.params.id;

            const facture = await FactureModele.parId(factureId);
            if (!facture) {
                return res.status(404).json({ message: "Facture introuvable" });
            }

            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email du destinataire manquant" });
            }

            await envoyerEmailFacture({
                destinataire: email,
                sujet: `Votre facture n°${facture.id}`,
                templatePath: "facture-moderne.html",
                variables: {
                    numero_facture: facture.id,
                    montant: facture.montant,
                    lien_facture: `${process.env.APP_URL || "http://localhost:5173"}/factures/${facture.id}`,
                    annee: new Date().getFullYear().toString()
                }
            });

            await HistoriqueModele.ajouter("facture", factureId, `Facture envoyée par email à ${email}`);

            res.json({ message: "Facture envoyée par e‑mail" });

        } catch (e) {
            next(e);
        }
    },

    // 📌 Générer le PDF d'une facture
    async pdf(req, res, next) {
        try {
            const facture = await FactureModele.parId(req.params.id);
            if (!facture) return res.status(404).json({ message: "Facture introuvable" });

            const lignes = await FactureLigneModele.parFacture(req.params.id);
            const client = await ClientModele.trouverParId(facture.client_id);

            genererPdfFacture({ facture, client, lignes, res });
        } catch (e) {
            next(e);
        }
    },

    // 📌 Supprimer une facture + lignes
    async supprimer(req, res, next) {
        try {
            await FactureLigneModele.supprimerParFacture(req.params.id);
            await FactureModele.supprimer(req.params.id);

            await LogModele.ajouter(identiteUtilisateur(req), `Suppression de la facture #${req.params.id}`);

            res.status(200).json({ message: "Facture supprimée avec succès" });
        } catch (e) {
            next(e);
        }
    }
};
