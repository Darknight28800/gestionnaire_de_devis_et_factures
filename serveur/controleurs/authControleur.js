import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UtilisateurModele } from "../modeles/utilisateurModele.js";
import { LogModele } from "../modeles/logModele.js";

export const AuthControleur = {

    async inscription(req, res, next) {
        try {
            const { nom, email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email et mot de passe requis" });
            }

            const existant = await UtilisateurModele.trouverParEmail(email);
            if (existant) {
                return res.status(409).json({ message: "Un compte existe déjà avec cet email" });
            }

            const hash = await bcrypt.hash(password, 10);

            // Le tout premier compte créé sur une installation devient automatiquement administrateur
            const estPremierUtilisateur = (await UtilisateurModele.compter()) === 0;

            const utilisateur = await UtilisateurModele.creer({
                nom,
                email,
                mot_de_passe: hash,
                role: estPremierUtilisateur ? "admin" : "user"
            });

            const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur;
            res.status(201).json(utilisateurSansMotDePasse);
        } catch (e) {
            next(e);
        }
    },

    async connexion(req, res, next) {
        try {
            const { email, password } = req.body;

            const utilisateur = await UtilisateurModele.trouverParEmail(email);

            if (!utilisateur) {
                return res.status(400).json({ message: "Identifiants invalides" });
            }

            if (!password) {
                return res.status(400).json({ message: "Identifiants invalides" });
            }

            const match = await bcrypt.compare(password, utilisateur.mot_de_passe);

            if (!match) {
                return res.status(400).json({ message: "Identifiants invalides" });
            }

            await LogModele.ajouter(utilisateur.email, "Connexion");

            const token = jwt.sign(
                { id: utilisateur.id, role: utilisateur.role, email: utilisateur.email },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                token,
                utilisateur: {
                    id: utilisateur.id,
                    nom: utilisateur.nom,
                    email: utilisateur.email,
                    role: utilisateur.role
                }
            });

        } catch (e) {
            next(e);
        }
    },


    async profil(req, res, next) {
        try {
            const utilisateur = await UtilisateurModele.trouverParId(req.utilisateur.id);
            if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable" });

            const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur;
            res.json(utilisateurSansMotDePasse);
        } catch (e) {
            next(e);
        }
    },

    async mettreAJourProfil(req, res, next) {
        try {
            const { nom } = req.body;
            if (!nom || !nom.trim()) {
                return res.status(400).json({ message: "Le nom ne peut pas être vide" });
            }

            const utilisateur = await UtilisateurModele.mettreAJourNom(req.utilisateur.id, nom.trim());
            const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur;
            res.json(utilisateurSansMotDePasse);
        } catch (e) {
            next(e);
        }
    },

    async changerMotDePasse(req, res, next) {
        try {
            const { motDePasseActuel, nouveauMotDePasse } = req.body;
            if (!motDePasseActuel || !nouveauMotDePasse) {
                return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
            }
            if (nouveauMotDePasse.length < 6) {
                return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
            }

            const utilisateur = await UtilisateurModele.trouverParId(req.utilisateur.id);
            const match = await bcrypt.compare(motDePasseActuel, utilisateur.mot_de_passe);
            if (!match) {
                return res.status(400).json({ message: "Mot de passe actuel incorrect" });
            }

            const hash = await bcrypt.hash(nouveauMotDePasse, 10);
            await UtilisateurModele.mettreAJourMotDePasse(req.utilisateur.id, hash);

            res.json({ message: "Mot de passe mis à jour" });
        } catch (e) {
            next(e);
        }
    }
};
