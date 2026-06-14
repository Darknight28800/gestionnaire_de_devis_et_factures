import { ClientModele } from '../modeles/clientModele.js';

export const ClientControleur = {
    async liste(req, res, next) {
        try {
            const clients = await ClientModele.tous();
            res.json(clients);
        } catch (e) { next(e); }
    },

    async detail(req, res, next) {
        try {
            const client = await ClientModele.trouverParId(req.params.id);
            if (!client) return res.status(404).json({ message: 'Client introuvable' });
            res.json(client);
        } catch (e) { next(e); }
    },

    async creer(req, res, next) {
        try {
            const client = await ClientModele.creer(req.body);
            res.status(201).json(client);
        } catch (e) { next(e); }
    },

    async mettreAJour(req, res, next) {
        try {
            const client = await ClientModele.mettreAJour(req.params.id, req.body);
            if (!client) return res.status(404).json({ message: 'Client introuvable' });
            res.json(client);
        } catch (e) { next(e); }
    },

    async supprimer(req, res, next) {
        try {
            await ClientModele.supprimer(req.params.id);
            res.status(204).end();
        } catch (e) { next(e); }
    }
};
