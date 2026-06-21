export default function adminMiddleware(req, res, next) {
    if (!req.utilisateur || req.utilisateur.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
    }
    next();
}
