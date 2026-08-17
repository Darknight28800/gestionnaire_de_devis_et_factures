# Gestionnaire de Devis & Factures

Application complète de gestion commerciale : clients, devis, factures, conversion devis → facture, suivi des paiements, tableau de bord, administration (utilisateurs, rôles, logs), support.

## Stack technique

- **Backend** : Node.js, Express 4, MySQL (`mysql2`), JWT, bcrypt, Nodemailer, PDFKit
- **Frontend** : React 19, Vite, React Router v7, Axios, Chart.js, Sass
- **Base de données** : MySQL 8

## Prérequis

- Node.js 18+
- MySQL 8 (local ou distant)

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-depot>
cd Gestionnaire_de_Devis_et_Factures

cd serveur
npm install

cd ../frontend
npm install
```

### 2. Configurer la base de données

Créez le schéma (tables, index, clés étrangères) :

```bash
mysql -u root -p < serveur/database/schema.sql
```

Cela crée la base `gestion_devis_factures` avec toutes les tables nécessaires.

### 3. Configurer les variables d'environnement

Copiez `serveur/.env.example` vers `serveur/.env` et renseignez vos propres valeurs :

```bash
cp serveur/.env.example serveur/.env
```

| Variable | Description |
|---|---|
| `PORT` | Port du serveur backend (défaut : 4000) |
| `APP_URL` | URL du frontend, utilisée pour CORS et les liens dans les emails (défaut : `http://localhost:5173`) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | Connexion MySQL |
| `JWT_SECRET` | Secret de signature des tokens JWT — **à changer en production**, utilisez une valeur longue et aléatoire |
| `EMAIL_USER`, `EMAIL_PASS` | Compte Gmail utilisé pour l'envoi d'emails (utilisez un [mot de passe d'application](https://myaccount.google.com/apppasswords), jamais votre mot de passe principal) |

⚠️ **Ne committez jamais le fichier `.env` réel** — il est ignoré par `.gitignore`.

### 4. Lancer l'application

Dans deux terminaux séparés :

```bash
# Terminal 1 — backend (port 4000)
cd serveur
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

Ouvrez `http://localhost:5173`.

### 5. Créer un compte administrateur

1. Inscrivez-vous via la page de connexion (un lien "créer un compte" ou l'endpoint `POST /auth/inscription`).
2. Passez ce compte en admin directement en base :

```sql
UPDATE utilisateurs SET role = 'admin' WHERE email = 'votre@email.com';
```

## Structure du projet

```
serveur/
  app.js                 Point d'entrée Express
  config/                Connexion MySQL
  controleurs/            Logique métier par ressource
  intergiciels/            Middlewares (auth, admin, upload, erreurs)
  modeles/                Accès aux données (SQL brut)
  routes/                 Définition des routes Express
  services/, utils/       Email, génération PDF
  database/schema.sql     Schéma SQL complet (tables, index, FK)

frontend/
  src/pages/              Une page par fonctionnalité
  src/composants/         Composants réutilisables (Modal, Layout...)
  src/contexte/           Contexte d'authentification
  src/api/axios.js        Client HTTP centralisé
```

## Tests

```bash
cd serveur
npm test
```

## Déploiement

Le déploiement (backend sur Render/Railway, base sur PlanetScale/Neon-compatible MySQL, frontend sur Vercel/Netlify) n'est pas automatisé dans ce dépôt. Points d'attention :

- Définir toutes les variables d'environnement listées ci-dessus sur la plateforme choisie
- Exécuter `serveur/database/schema.sql` sur la base de production avant le premier démarrage
- Mettre à jour `APP_URL` (backend) pour qu'il pointe vers l'URL réelle du frontend déployé (CORS + liens email)
- Mettre à jour `frontend/src/api/axios.js` (`baseURL`) pour qu'il pointe vers l'URL réelle du backend déployé
