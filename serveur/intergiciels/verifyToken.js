import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.utilisateur = decoded; // on stocke les infos du token
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token invalide" });
    }
}
