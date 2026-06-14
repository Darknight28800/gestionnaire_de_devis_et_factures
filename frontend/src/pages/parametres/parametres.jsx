import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/pages/_parametres.scss";

export default function Parametres() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Valeurs API stockées mais NON affichées dans les champs
    const [parametres, setParametres] = useState({
        nom_entreprise: "",
        email: "",
        telephone: "",
        adresse: "",
        logo_url: "",
        couleur_primaire: "#2563eb",
        couleur_secondaire: "#10b981",
        couleur_fond: "#0f172a",
        couleur_texte: "#f9fafb"
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");

    /* Charger les paramètres */
    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/parametres");
                const data = res.data;

                // On stocke les valeurs API mais on ne les affiche pas dans les inputs
                setParametres({
                    nom_entreprise: data.nom_entreprise || "",
                    email: data.email || "",
                    telephone: data.telephone || "",
                    adresse: data.adresse || "",
                    logo_url: data.logo_url || "",
                    couleur_primaire: data.couleur_primaire || "#2563eb",
                    couleur_secondaire: data.couleur_secondaire || "#10b981",
                    couleur_fond: data.couleur_fond || "#0f172a",
                    couleur_texte: data.couleur_texte || "#f9fafb"
                });

                setLogoPreview(data.logo_url || "");
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

                setLogoPreview(resLogo.data.logo_url);
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
            <h1>Paramètres de l'entreprise</h1>

            <form onSubmit={handleSubmit} className="page-parametres__form">

                {/* INFORMATIONS */}
                <section className="parametres-section">
                    <h2>Informations</h2>

                    <div className="parametres-form">

                        <div className={`field ${parametres.nom_entreprise ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="nom_entreprise"
                                defaultValue=""
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Nom de l’entreprise</label>
                        </div>

                        <div className={`field ${parametres.email ? "filled" : ""}`}>
                            <input
                                type="email"
                                name="email"
                                defaultValue=""
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>E-mail</label>
                        </div>

                        <div className={`field ${parametres.telephone ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="telephone"
                                defaultValue=""
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Téléphone</label>
                        </div>

                        <div className={`field ${parametres.adresse ? "filled" : ""}`}>
                            <input
                                type="text"
                                name="adresse"
                                defaultValue=""
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label>Adresse</label>
                        </div>
                    </div>
                </section>

                {/* LOGO */}
                <section className="parametres-section">
                    <h2>Logo</h2>

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

                {/* COULEURS */}
                <section className="parametres-section">
                    <h2>Couleurs du thème</h2>

                    <div className="color-grid">
                        {[
                            ["couleur_primaire", "Couleur primaire"],
                            ["couleur_secondaire", "Couleur secondaire"],
                            ["couleur_fond", "Couleur de fond"],
                            ["couleur_texte", "Couleur du texte"]
                        ].map(([key, label]) => (
                            <div className="color-item" key={key}>
                                <label>{label}</label>
                                <input
                                    type="color"
                                    name={key}
                                    value={parametres[key]}
                                    onChange={handleColorChange}
                                />
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
