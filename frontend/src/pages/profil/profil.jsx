import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Profil() {
    const [profil, setProfil] = useState(null);
    const [loading, setLoading] = useState(true);

    const [nom, setNom] = useState("");
    const [enregistrementNom, setEnregistrementNom] = useState(false);
    const [messageNom, setMessageNom] = useState(null);

    const [motDePasseActuel, setMotDePasseActuel] = useState("");
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
    const [enregistrementMdp, setEnregistrementMdp] = useState(false);
    const [messageMdp, setMessageMdp] = useState(null);

    useEffect(() => {
        const chargerProfil = async () => {
            try {
                const res = await api.get("/auth/me");
                setProfil(res.data.utilisateur);
                setNom(res.data.utilisateur.nom || "");
            } catch (err) {
                console.error("Erreur chargement profil :", err);
            } finally {
                setLoading(false);
            }
        };

        chargerProfil();
    }, []);

    const enregistrerNom = async (e) => {
        e.preventDefault();
        setEnregistrementNom(true);
        setMessageNom(null);

        try {
            const res = await api.put("/auth/profil", { nom });
            setProfil((prev) => ({ ...prev, nom: res.data.nom }));
            setMessageNom({ type: "succes", texte: "Nom mis à jour." });
        } catch (err) {
            setMessageNom({ type: "erreur", texte: err.response?.data?.message || "Erreur lors de la mise à jour." });
        } finally {
            setEnregistrementNom(false);
        }
    };

    const changerMotDePasse = async (e) => {
        e.preventDefault();
        setEnregistrementMdp(true);
        setMessageMdp(null);

        try {
            await api.put("/auth/mot-de-passe", { motDePasseActuel, nouveauMotDePasse });
            setMessageMdp({ type: "succes", texte: "Mot de passe mis à jour." });
            setMotDePasseActuel("");
            setNouveauMotDePasse("");
        } catch (err) {
            setMessageMdp({ type: "erreur", texte: err.response?.data?.message || "Erreur lors du changement." });
        } finally {
            setEnregistrementMdp(false);
        }
    };

    if (loading) return <p>Chargement…</p>;
    if (!profil) return <p>Impossible de charger votre profil.</p>;

    return (
        <div className="page page-profil">
            <h1 className="page-title">Mon profil</h1>

            <div className="card">
                <p><strong>Email :</strong> {profil.email}</p>
                <p><strong>Rôle :</strong> {profil.role}</p>
            </div>

            <div className="card">
                <h2>Nom affiché</h2>
                <form onSubmit={enregistrerNom} className="form-ligne">
                    <input value={nom} onChange={(e) => setNom(e.target.value)} required />
                    {messageNom && (
                        <p className={`message message--${messageNom.type}`}>{messageNom.texte}</p>
                    )}
                    <button type="submit" className="btn btn-primaire" disabled={enregistrementNom}>
                        {enregistrementNom ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </form>
            </div>

            <div className="card">
                <h2>Changer le mot de passe</h2>
                <form onSubmit={changerMotDePasse} className="form-ligne">
                    <label>Mot de passe actuel</label>
                    <input
                        type="password"
                        value={motDePasseActuel}
                        onChange={(e) => setMotDePasseActuel(e.target.value)}
                        required
                    />
                    <label>Nouveau mot de passe</label>
                    <input
                        type="password"
                        value={nouveauMotDePasse}
                        onChange={(e) => setNouveauMotDePasse(e.target.value)}
                        minLength={6}
                        required
                    />
                    {messageMdp && (
                        <p className={`message message--${messageMdp.type}`}>{messageMdp.texte}</p>
                    )}
                    <button type="submit" className="btn btn-primaire" disabled={enregistrementMdp}>
                        {enregistrementMdp ? "Enregistrement..." : "Changer le mot de passe"}
                    </button>
                </form>
            </div>
        </div>
    );
}
