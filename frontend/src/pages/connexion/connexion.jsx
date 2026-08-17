import { useState } from "react";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/_connexion.scss";

export default function Connexion() {
    const [mode, setMode] = useState("connexion"); // "connexion" | "inscription"
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [motdepasse, setMotdepasse] = useState("");
    const [erreur, setErreur] = useState(null);
    const [envoi, setEnvoi] = useState(false);
    const { connexion } = useAuth();
    const navigate = useNavigate();

    const basculerMode = (nouveauMode) => {
        setMode(nouveauMode);
        setErreur(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur(null);
        setEnvoi(true);

        try {
            if (mode === "inscription") {
                await api.post("/auth/inscription", { nom, email, password: motdepasse });
            }

            const res = await api.post("/auth/connexion", { email, password: motdepasse });
            connexion(res.data.token, res.data.utilisateur);
            navigate("/");
        } catch (err) {
            setErreur(err.response?.data?.message || "Une erreur est survenue.");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <div className="page-connexion">
            <div className="page-connexion__fond" aria-hidden="true"></div>

            <div className="carte-connexion">
                <div className="carte-connexion__marque">
                    <img src="/assets/logo-facturepro.svg" alt="" className="carte-connexion__logo" />
                    <span>FacturePro</span>
                </div>

                <div className="carte-connexion__onglets">
                    <button
                        type="button"
                        className={mode === "connexion" ? "actif" : ""}
                        onClick={() => basculerMode("connexion")}
                    >
                        Connexion
                    </button>
                    <button
                        type="button"
                        className={mode === "inscription" ? "actif" : ""}
                        onClick={() => basculerMode("inscription")}
                    >
                        Créer un compte
                    </button>
                </div>

                <p className="carte-connexion__sous-titre">
                    {mode === "connexion"
                        ? "Connectez-vous pour accéder à vos devis et factures."
                        : "Le premier compte créé devient automatiquement administrateur."}
                </p>

                <form onSubmit={handleSubmit} className="form-connexion">
                    {mode === "inscription" && (
                        <div className="form-ligne">
                            <label>Nom</label>
                            <input
                                type="text"
                                placeholder="Votre nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-ligne">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="vous@entreprise.fr"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-ligne">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={motdepasse}
                            onChange={(e) => setMotdepasse(e.target.value)}
                            required
                        />
                    </div>

                    {erreur && <p className="message message--erreur">{erreur}</p>}

                    <button type="submit" className="btn btn-primaire carte-connexion__submit" disabled={envoi}>
                        {envoi
                            ? "Un instant..."
                            : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
                    </button>
                </form>
            </div>
        </div>
    );
}
