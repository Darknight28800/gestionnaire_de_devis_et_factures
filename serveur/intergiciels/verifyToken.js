import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "Token manquant" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 C’EST ÇA QUI MANQUAIT
        req.utilisateur = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
}
