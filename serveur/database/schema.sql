-- ============================================================
-- Schéma SQL — Gestionnaire de Devis & Factures
-- ============================================================
-- Reconstruit à partir des requêtes SQL présentes dans serveur/modeles/*.js
-- (le dépôt d'origine ne contenait aucun script de création de base).
--
-- Utilisation :
--   mysql -u root -p < schema.sql
-- ou depuis un client MySQL déjà connecté :
--   SOURCE schema.sql;
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_devis_factures
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_devis_factures;

-- ------------------------------------------------------------
-- Utilisateurs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(150) NULL,
    email          VARCHAR(255) NOT NULL,
    mot_de_passe   VARCHAR(255) NOT NULL,
    role           VARCHAR(50)  NOT NULL DEFAULT 'user',
    date_creation  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_utilisateurs_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Clients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(150) NOT NULL,
    email          VARCHAR(255) NULL,
    telephone      VARCHAR(50)  NULL,
    adresse        VARCHAR(255) NULL,
    ville          VARCHAR(100) NULL,
    code_postal    VARCHAR(20)  NULL,
    pays           VARCHAR(100) NULL,
    date_creation  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_clients_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Devis
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devis (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    client_id      INT NOT NULL,
    utilisateur_id INT NULL,
    montant        DECIMAL(12,2) NOT NULL DEFAULT 0,
    titre          VARCHAR(255) NULL,
    description    TEXT NULL,
    statut         VARCHAR(50) NOT NULL DEFAULT 'brouillon',
    date_creation  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_devis_client
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_devis_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    KEY idx_devis_client (client_id),
    KEY idx_devis_utilisateur (utilisateur_id),
    KEY idx_devis_statut (statut)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS devis_lignes (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    devis_id       INT NOT NULL,
    description    VARCHAR(255) NOT NULL,
    quantite       DECIMAL(10,2) NOT NULL DEFAULT 1,
    prix           DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_devis_lignes_devis
        FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE,
    KEY idx_devis_lignes_devis (devis_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Factures
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS factures (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    devis_id       INT NULL,
    client_id      INT NOT NULL,
    utilisateur_id INT NULL,
    montant        DECIMAL(12,2) NOT NULL DEFAULT 0,
    date_facture   DATE NULL,
    date_paiement  DATE NULL,
    statut         VARCHAR(50) NOT NULL DEFAULT 'non_payee',
    date_creation  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_factures_devis
        FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE SET NULL,
    CONSTRAINT fk_factures_client
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_factures_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    KEY idx_factures_devis (devis_id),
    KEY idx_factures_client (client_id),
    KEY idx_factures_utilisateur (utilisateur_id),
    KEY idx_factures_statut_date (statut, date_facture)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS facture_lignes (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    facture_id     INT NOT NULL,
    description    VARCHAR(255) NOT NULL,
    quantite       DECIMAL(10,2) NOT NULL DEFAULT 1,
    prix           DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_facture_lignes_facture
        FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE,
    KEY idx_facture_lignes_facture (facture_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Historique (journal d'événements par devis/facture)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    type           VARCHAR(50) NOT NULL,
    reference_id   INT NOT NULL,
    message        VARCHAR(255) NOT NULL,
    date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_historique_type_reference (type, reference_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Paramètres de l'entreprise (ligne unique id = 1)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parametres (
    id                  INT PRIMARY KEY,
    nom_entreprise      VARCHAR(150) NULL,
    email               VARCHAR(255) NULL,
    telephone           VARCHAR(50)  NULL,
    adresse             VARCHAR(255) NULL,
    couleur_primaire    VARCHAR(20)  NULL,
    couleur_secondaire  VARCHAR(20)  NULL,
    couleur_fond        VARCHAR(20)  NULL,
    couleur_texte       VARCHAR(20)  NULL,
    logo_url            VARCHAR(255) NULL
) ENGINE=InnoDB;

-- Ligne de paramètres vierge : l'entreprise renseigne ses propres informations
-- depuis la page Paramètres au premier lancement. Seules des couleurs de thème
-- neutres par défaut sont pré-remplies.
INSERT INTO parametres (id, nom_entreprise, email, telephone, adresse, couleur_primaire, couleur_secondaire, couleur_fond, couleur_texte, logo_url)
VALUES (1, NULL, NULL, NULL, NULL, '#2563eb', '#1e293b', '#ffffff', '#0f172a', NULL)
ON DUPLICATE KEY UPDATE id = id;

-- ------------------------------------------------------------
-- Tickets de support
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets_support (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    sujet          VARCHAR(255) NOT NULL,
    message        TEXT NOT NULL,
    statut         VARCHAR(50) NOT NULL DEFAULT 'ouvert',
    date_creation  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    KEY idx_tickets_utilisateur (utilisateur_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Rôles (catalogue de rôles/permissions géré depuis /admin/roles)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(100) NOT NULL,
    permissions    JSON NULL,
    date_creation  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_roles_nom (nom)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Logs d'activité admin (piste d'audit consultée depuis /admin/logs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur    VARCHAR(255) NULL,
    action         VARCHAR(255) NOT NULL,
    date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_logs_utilisateur_date (utilisateur, date),
    KEY idx_logs_action (action)
) ENGINE=InnoDB;
