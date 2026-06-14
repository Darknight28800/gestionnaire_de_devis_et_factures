export const erreurMiddleware = (err, req, res, next) => {
    console.error("Erreur API :", err);
    res.status(err.status || 500).json({
        message: err.message || "Erreur serveur",
    });
};
