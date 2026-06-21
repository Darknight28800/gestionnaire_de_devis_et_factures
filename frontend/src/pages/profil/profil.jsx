import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Profil() {
    const [profil, setProfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const chargerProfil = async () => {
        try {
            const res = await api.get("/auth/me");
            setProfil(res.data.utilisateur);
        } catch (err) {
            console.error("Erreur chargement profil :", err);
        } finally {
            setLoading(false);
        }
        };

        chargerProfil();
    }, []);

    if (loading) return <p>Chargement…</p>;
    if (!profil) return <p>Impossible de charger votre profil.</p>;

    return (
        <div className="page page-profil">
        <h1 className="page-title">Mon profil</h1>

        <div className="card">
            <p><strong>ID :</strong> {profil.id}</p>
            <p><strong>Nom :</strong> {profil.nom}</p>
            <p><strong>Email :</strong> {profil.email}</p>
            <p><strong>Rôle :</strong> {profil.role}</p>
        </div>
        </div>
    );
}
