import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UtilisateurModele } from "../modeles/utilisateurModele.js";

export const AuthControleur = {

    async inscription(req, res, next) {
        try {
            const { email, password } = req.body;

            const hash = await bcrypt.hash(password, 10);

            const utilisateur = await UtilisateurModele.creer({
                email,
                mot_de_passe: hash,
                role: "user"
            });

            res.status(201).json(utilisateur);
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

            const match = await bcrypt.compare(password, utilisateur.mot_de_passe);

            if (!match) {
                return res.status(400).json({ message: "Identifiants invalides" });
            }

            const token = jwt.sign(
                { id: utilisateur.id, role: utilisateur.role },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                token,
                utilisateur: {
                    id: utilisateur.id,
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
            res.json(utilisateur);
        } catch (e) {
            next(e);
        }
    }
};
