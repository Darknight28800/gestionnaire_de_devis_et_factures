/**
 * Peuple une base FRAÎCHE (schema.sql déjà exécuté) avec des données de démonstration
 * entièrement fictives, pour une instance publique (portfolio, démo en ligne...).
 *
 * Ne JAMAIS lancer ce script sur une base contenant de vraies données —
 * il est prévu pour une base de démo isolée, séparée de tout usage réel.
 *
 * Usage : node database/seedDemo.js
 */
import bcrypt from "bcrypt";
import pool from "../config/base_de_donnees.js";

const EMAIL_DEMO = "demo@facturepro.app";
const MOT_DE_PASSE_DEMO = "Demo1234!";

async function seed() {
    const [existant] = await pool.query("SELECT id FROM utilisateurs WHERE email = ?", [EMAIL_DEMO]);
    if (existant.length) {
        console.log("⚠️  Le compte démo existe déjà — rien à faire. Supprimez-le d'abord si vous voulez re-seeder.");
        process.exit(0);
    }

    const hash = await bcrypt.hash(MOT_DE_PASSE_DEMO, 10);
    const [utilisateur] = await pool.query(
        "INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES (?, ?, ?, 'admin')",
        ["Compte Démo", EMAIL_DEMO, hash]
    );
    const utilisateurId = utilisateur.insertId;

    await pool.query(
        `UPDATE parametres SET
            nom_entreprise = 'Studio Démo',
            email = 'contact@studio-demo.fr',
            telephone = '01 23 45 67 89',
            adresse = '12 rue de la Démonstration, 75000 Paris',
            siret = '12345678900012',
            forme_juridique = 'SASU au capital de 1000 €',
            delai_paiement_jours = 30
         WHERE id = 1`
    );

    const [client] = await pool.query(
        `INSERT INTO clients (nom, email, telephone, adresse, ville, code_postal, pays, statut)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'actif')`,
        ["Client Démo SARL", "contact@client-demo.fr", "06 12 34 56 78", "5 avenue des Tests", "Lyon", "69000", "France"]
    );
    const clientId = client.insertId;

    const [devis] = await pool.query(
        `INSERT INTO devis (client_id, utilisateur_id, montant, titre, description, statut)
         VALUES (?, ?, ?, ?, ?, 'accepte')`,
        [clientId, utilisateurId, 1450, "Refonte du site vitrine", "Exemple de devis généré pour la démonstration."]
    );
    const devisId = devis.insertId;

    await pool.query(
        `INSERT INTO devis_lignes (devis_id, description, quantite, prix) VALUES
         (?, 'Conception UI/UX', 1, 600),
         (?, 'Intégration développement', 5, 150),
         (?, 'Mise en ligne & tests', 1, 100)`,
        [devisId, devisId, devisId]
    );

    const [facture] = await pool.query(
        `INSERT INTO factures (devis_id, client_id, utilisateur_id, montant, date_facture, statut)
         VALUES (?, ?, ?, ?, CURDATE(), 'non_payee')`,
        [devisId, clientId, utilisateurId, 1450]
    );
    const factureId = facture.insertId;

    await pool.query(
        `INSERT INTO facture_lignes (facture_id, description, quantite, prix) VALUES
         (?, 'Conception UI/UX', 1, 600),
         (?, 'Intégration développement', 5, 150),
         (?, 'Mise en ligne & tests', 1, 100)`,
        [factureId, factureId, factureId]
    );

    console.log("✅ Données de démo créées.");
    console.log(`   Connexion démo : ${EMAIL_DEMO} / ${MOT_DE_PASSE_DEMO}`);
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Erreur seed démo :", err);
    process.exit(1);
});
