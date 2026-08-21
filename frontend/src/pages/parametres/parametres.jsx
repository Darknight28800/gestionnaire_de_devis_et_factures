import { useEffect, useState } from "react";
import api, { resoudreUrlFichier } from "../../api/axios";
import "../../styles/pages/_parametres.scss";

/* Couleurs de base de l'app (thème "Bleu corporate raffiné", cf. schema.sql / _variables.scss) */
const COULEURS_PAR_DEFAUT = {
    couleur_primaire: "#1d4ed8",
    couleur_secondaire: "#1e3a8a",
    couleur_fond: "#ffffff",
    couleur_texte: "#101828"
};

export default function Parametres() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [parametres, setParametres] = useState({
        nom_entreprise: "",
        email: "",
        telephone: "",
        adresse: "",
        logo_url: "",
        ...COULEURS_PAR_DEFAUT,
        siret: "",
        forme_juridique: "",
        hebergeur: "",
        mention_tva: "",
        iban: "",
        bic: "",
        delai_paiement_jours: 30
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");

    /* Charger les paramètres */
    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/parametres");
                const data = res.data;

                setParametres({
                    nom_entreprise: data.nom_entreprise || "",
                    email: data.email || "",
                    telephone: data.telephone || "",
                    adresse: data.adresse || "",
                    logo_url: data.logo_url || "",
                    couleur_primaire: data.couleur_primaire || COULEURS_PAR_DEFAUT.couleur_primaire,
                    couleur_secondaire: data.couleur_secondaire || COULEURS_PAR_DEFAUT.couleur_secondaire,
                    couleur_fond: data.couleur_fond || COULEURS_PAR_DEFAUT.couleur_fond,
                    couleur_texte: data.couleur_texte || COULEURS_PAR_DEFAUT.couleur_texte,
                    siret: data.siret || "",
                    forme_juridique: data.forme_juridique || "",
                    hebergeur: data.hebergeur || "",
                    mention_tva: data.mention_tva || "",
                    iban: data.iban || "",
                    bic: data.bic || "",
                    delai_paiement_jours: data.delai_paiement_jours || 30
                });

                setLogoPreview(resoudreUrlFichier(data.logo_url) || "");
            } catch (err) {
                console.error("Erreur chargement paramètres :", err);
            } finally {
                setLoading(false);
            }
        };

        charger();
    }, []);

    /* Gestion champs texte */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParametres((prev) => ({ ...prev, [name]: value }));
    };

    /* Gestion couleurs */
    const handleColorChange = (e) => {
        const { name, value } = e.target;
        setParametres((prev) => ({ ...prev, [name]: value }));
    };

    const reinitialiserCouleurs = () => {
        setParametres((prev) => ({ ...prev, ...COULEURS_PAR_DEFAUT }));
    };

    /* Gestion logo */
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    /* Soumission */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put("/parametres", parametres);

            if (logoFile) {
                const formData = new FormData();
                formData.append("logo", logoFile);

                const resLogo = await api.post("/parametres/logo", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                setParametres((prev) => ({
                    ...prev,
                    logo_url: resLogo.data.logo_url
                }));

                setLogoPreview(resoudreUrlFichier(resLogo.data.logo_url));
            }
        } catch (err) {
            console.error("Erreur enregistrement :", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="page-parametres__loading">Chargement…</p>;
    }

    return (
        <div className="page-parametres">

            {/* EN-TÊTE */}
            <div className="parametres-hero">
                <span className="parametres-hero__badge">⚙️</span>
                <div>
                    <h1>Paramètres de l'entreprise</h1>
                    <p className="page-lede">
                        Ces informations apparaissent sur vos devis, factures et sur les pages publiques de l'application.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-parametres__form">

                {/* INFORMATIONS */}
                <section className="parametres-section">
                    <h2><span className="parametres-section__icone">🏢</span> Informations</h2>

                    <div className="parametres-form">

                        <div className={`field ${parametres.nom_entreprise ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="nom_entreprise"
                                value={parametres.nom_entreprise}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Nom de l’entreprise</label>
                        </div>

                        <div className={`field ${parametres.email ? "filled" : ""}`}>
                            <input
                                type="email"
                                name="email"
                                value={parametres.email}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>E-mail</label>
                        </div>

                        <div className={`field ${parametres.telephone ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="telephone"
                                value={parametres.telephone}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Téléphone</label>
                        </div>

                        <div className={`field field--large ${parametres.adresse ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="adresse"
                                value={parametres.adresse}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Adresse</label>
                        </div>
                    </div>
                </section>

                {/* LOGO */}
                <section className="parametres-section">
                    <h2><span className="parametres-section__icone">🖼️</span> Logo</h2>

                    <div className="logo-wrapper">
                        <div className="logo-preview">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" />
                            ) : (
                                <span>Aucun logo</span>
                            )}
                        </div>

                        <div className="logo-actions">
                            <label className="btn-file">
                                Choisir un fichier
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                            <p className="logo-hint">PNG, JPG, SVG — max 2 Mo</p>
                        </div>
                    </div>
                </section>

                {/* FACTURATION & MENTIONS LÉGALES */}
                <section className="parametres-section">
                    <h2><span className="parametres-section__icone">🧾</span> Facturation &amp; mentions légales</h2>
                    <p className="parametres-section__aide">
                        Ces informations apparaissent sur vos devis/factures PDF, ainsi que sur les pages
                        Mentions légales et Contact de l'application.
                    </p>

                    <div className="parametres-form">
                        <div className={`field ${parametres.siret ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="siret"
                                value={parametres.siret}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Numéro SIRET</label>
                        </div>

                        <div className={`field field--medium ${parametres.forme_juridique ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="forme_juridique"
                                value={parametres.forme_juridique}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Forme juridique (ex : Auto-entrepreneur, SASU au capital de 1000 €)</label>
                        </div>

                        <div className={`field field--medium ${parametres.hebergeur ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="hebergeur"
                                value={parametres.hebergeur}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Hébergeur de l'application (si hébergée en ligne)</label>
                        </div>

                        <div className={`field ${parametres.delai_paiement_jours ? "filled" : ""}`}>
                            <input
                                type="number"
                                min="0"
                                name="delai_paiement_jours"
                                value={parametres.delai_paiement_jours}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Délai de paiement (jours)</label>
                        </div>

                        <div className={`field field--medium ${parametres.iban ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="iban"
                                value={parametres.iban}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>IBAN</label>
                        </div>

                        <div className={`field ${parametres.bic ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="bic"
                                value={parametres.bic}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>BIC</label>
                        </div>

                        <div className={`field field--large ${parametres.mention_tva ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="mention_tva"
                                value={parametres.mention_tva}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Mention TVA (ex : « TVA non applicable, art. 293 B du CGI »)</label>
                        </div>
                    </div>
                </section>

                {/* COULEURS */}
                <section className="parametres-section">
                    <div className="parametres-section__entete">
                        <h2><span className="parametres-section__icone">🎨</span> Couleurs du thème</h2>
                        <button type="button" className="btn-texte" onClick={reinitialiserCouleurs}>
                            ↺ Réinitialiser aux couleurs par défaut
                        </button>
                    </div>

                    {/* APERÇU EN DIRECT */}
                    <div className="couleurs-apercu" style={{ background: parametres.couleur_fond, color: parametres.couleur_texte }}>
                        <span className="couleurs-apercu__badge" style={{ background: parametres.couleur_primaire }}>
                            {(parametres.nom_entreprise || "GD").slice(0, 2).toUpperCase()}
                        </span>
                        <div className="couleurs-apercu__texte">
                            <strong>{parametres.nom_entreprise || "Votre entreprise"}</strong>
                            <span>Aperçu de votre thème</span>
                        </div>
                        <span className="couleurs-apercu__bouton" style={{ background: parametres.couleur_secondaire }}>
                            Bouton
                        </span>
                    </div>

                    <div className="color-grid">
                        {[
                            ["couleur_primaire", "Couleur primaire"],
                            ["couleur_secondaire", "Couleur secondaire"],
                            ["couleur_fond", "Couleur de fond"],
                            ["couleur_texte", "Couleur du texte"]
                        ].map(([key, label]) => (
                            <div className="color-item" key={key}>
                                <label>{label}</label>
                                <div className="color-item__champ">
                                    <input
                                        type="color"
                                        name={key}
                                        value={parametres[key]}
                                        onChange={handleColorChange}
                                    />
                                    <span className="color-item__hex">{parametres[key]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BOUTON */}
                <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
                </button>
            </form>
        </div>
    );
}
