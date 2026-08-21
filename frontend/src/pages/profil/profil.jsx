import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";

export default function Profil() {
    const { t, i18n } = useTranslation();
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
            setMessageNom({ type: "succes", texte: t("profil.nomMisAJour") });
        } catch (err) {
            setMessageNom({ type: "erreur", texte: err.response?.data?.message || t("profil.erreurMiseAJour") });
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
            setMessageMdp({ type: "succes", texte: t("profil.mdpMisAJour") });
            setMotDePasseActuel("");
            setNouveauMotDePasse("");
        } catch (err) {
            setMessageMdp({ type: "erreur", texte: err.response?.data?.message || t("profil.erreurChangement") });
        } finally {
            setEnregistrementMdp(false);
        }
    };

    if (loading) return <p>{t("commun.chargement")}</p>;
    if (!profil) return <p>{t("profil.impossibleCharger")}</p>;

    const initiales = (profil.nom || profil.email || "?")
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((mot) => mot[0].toUpperCase())
        .join("");

    const membreDepuis = profil.date_creation
        ? new Date(profil.date_creation).toLocaleDateString(i18n.language, { month: "long", year: "numeric" })
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
    const forceLabels = [
        t("profil.forceTropCourt"),
        t("profil.forceFaible"),
        t("profil.forceCorrect"),
        t("profil.forceBon"),
        t("profil.forceExcellent")
    ];

    return (
        <div className="page page-profil">

            {/* EN-TÊTE PROFIL */}
            <div className="profil-hero">
                <span className="profil-hero__avatar">{initiales || "?"}</span>
                <div className="profil-hero__infos">
                    <h1 className="page-title">{profil.nom || t("nav.profil")}</h1>
                    <p className="page-lede">{profil.email}</p>
                    <div className="profil-hero__badges">
                        <span className={`profil-badge profil-badge--${profil.role}`}>
                            {profil.role === "admin" ? `🛡️ ${t("profil.administrateur")}` : `👤 ${t("profil.utilisateur")}`}
                        </span>
                        {membreDepuis && (
                            <span className="profil-badge profil-badge--neutre">
                                📅 {t("profil.membreDepuis", { date: membreDepuis })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="profil-layout">

                {/* NOM AFFICHÉ */}
                <div className="profil-card">
                    <h2><span className="profil-card__icone">🪪</span> {t("profil.informationsCompte")}</h2>
                    <p className="profil-card__sous-titre">{t("profil.nomVisible")}</p>

                    <form onSubmit={enregistrerNom} className="form-ligne">
                        <label>{t("profil.nomAffiche")}</label>
                        <input value={nom} onChange={(e) => setNom(e.target.value)} required />
                        {messageNom && (
                            <p className={`message message--${messageNom.type}`}>{messageNom.texte}</p>
                        )}
                        <button type="submit" className="btn btn-primaire" disabled={enregistrementNom}>
                            {enregistrementNom ? t("commun.enregistrementEnCours") : t("commun.enregistrer")}
                        </button>
                    </form>
                </div>

                {/* MOT DE PASSE */}
                <div className="profil-card">
                    <h2><span className="profil-card__icone">🔐</span> {t("profil.securite")}</h2>
                    <p className="profil-card__sous-titre">{t("profil.choisirMotDePasse")}</p>

                    <form onSubmit={changerMotDePasse} className="form-ligne">
                        <label>{t("profil.mdpActuel")}</label>
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
                                aria-label={afficherMdpActuel ? t("profil.masquerMdp") : t("profil.afficherMdp")}
                            >
                                {afficherMdpActuel ? "🙈" : "👁️"}
                            </button>
                        </div>

                        <label>{t("profil.nouveauMdp")}</label>
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
                                aria-label={afficherMdpNouveau ? t("profil.masquerMdp") : t("profil.afficherMdp")}
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
                            {enregistrementMdp ? t("commun.enregistrementEnCours") : t("profil.changerMotDePasse")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
