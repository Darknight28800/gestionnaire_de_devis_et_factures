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
    const [afficherMdpActuel, setAfficherMdpActuel] = useState(false);
    const [afficherMdpNouveau, setAfficherMdpNouveau] = useState(false);
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

    const initiales = (profil.nom || profil.email || "?")
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((mot) => mot[0].toUpperCase())
        .join("");

    const membreDepuis = profil.date_creation
        ? new Date(profil.date_creation).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        : null;

    const forceMdp = (() => {
        const l = nouveauMotDePasse.length;
        if (l === 0) return 0;
        let score = 0;
        if (l >= 6) score++;
        if (l >= 10) score++;
        if (/[A-Z]/.test(nouveauMotDePasse) && /[0-9]/.test(nouveauMotDePasse)) score++;
        if (/[^A-Za-z0-9]/.test(nouveauMotDePasse)) score++;
        return Math.min(score, 4);
    })();
    const forceLabels = ["Trop court", "Faible", "Correct", "Bon", "Excellent"];

    return (
        <div className="page page-profil">

            {/* EN-TÊTE PROFIL */}
            <div className="profil-hero">
                <span className="profil-hero__avatar">{initiales || "?"}</span>
                <div className="profil-hero__infos">
                    <h1 className="page-title">{profil.nom || "Mon profil"}</h1>
                    <p className="page-lede">{profil.email}</p>
                    <div className="profil-hero__badges">
                        <span className={`profil-badge profil-badge--${profil.role}`}>
                            {profil.role === "admin" ? "🛡️ Administrateur" : "👤 Utilisateur"}
                        </span>
                        {membreDepuis && (
                            <span className="profil-badge profil-badge--neutre">
                                📅 Membre depuis {membreDepuis}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="profil-layout">

                {/* NOM AFFICHÉ */}
                <div className="profil-card">
                    <h2><span className="profil-card__icone">🪪</span> Informations du compte</h2>
                    <p className="profil-card__sous-titre">Ce nom est visible par les autres utilisateurs de votre organisation.</p>

                    <form onSubmit={enregistrerNom} className="form-ligne">
                        <label>Nom affiché</label>
                        <input value={nom} onChange={(e) => setNom(e.target.value)} required />
                        {messageNom && (
                            <p className={`message message--${messageNom.type}`}>{messageNom.texte}</p>
                        )}
                        <button type="submit" className="btn btn-primaire" disabled={enregistrementNom}>
                            {enregistrementNom ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </form>
                </div>

                {/* MOT DE PASSE */}
                <div className="profil-card">
                    <h2><span className="profil-card__icone">🔐</span> Sécurité</h2>
                    <p className="profil-card__sous-titre">Choisissez un mot de passe d'au moins 6 caractères.</p>

                    <form onSubmit={changerMotDePasse} className="form-ligne">
                        <label>Mot de passe actuel</label>
                        <div className="profil-champ-mdp">
                            <input
                                type={afficherMdpActuel ? "text" : "password"}
                                value={motDePasseActuel}
                                onChange={(e) => setMotDePasseActuel(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="profil-toggle-mdp"
                                onClick={() => setAfficherMdpActuel(!afficherMdpActuel)}
                                aria-label={afficherMdpActuel ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {afficherMdpActuel ? "🙈" : "👁️"}
                            </button>
                        </div>

                        <label>Nouveau mot de passe</label>
                        <div className="profil-champ-mdp">
                            <input
                                type={afficherMdpNouveau ? "text" : "password"}
                                value={nouveauMotDePasse}
                                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                className="profil-toggle-mdp"
                                onClick={() => setAfficherMdpNouveau(!afficherMdpNouveau)}
                                aria-label={afficherMdpNouveau ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {afficherMdpNouveau ? "🙈" : "👁️"}
                            </button>
                        </div>

                        {nouveauMotDePasse.length > 0 && (
                            <div className="profil-force-mdp">
                                <div className="profil-force-mdp__barres">
                                    {[0, 1, 2, 3].map((i) => (
                                        <span
                                            key={i}
                                            className={`profil-force-mdp__barre ${i < forceMdp ? `profil-force-mdp__barre--${forceMdp}` : ""}`}
                                        />
                                    ))}
                                </div>
                                <span className="profil-force-mdp__label">{forceLabels[forceMdp]}</span>
                            </div>
                        )}

                        {messageMdp && (
                            <p className={`message message--${messageMdp.type}`}>{messageMdp.texte}</p>
                        )}
                        <button type="submit" className="btn btn-primaire" disabled={enregistrementMdp}>
                            {enregistrementMdp ? "Enregistrement..." : "Changer le mot de passe"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
