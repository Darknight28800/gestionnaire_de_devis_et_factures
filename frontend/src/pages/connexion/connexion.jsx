import { useState } from "react";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Connexion() {
    const [email, setEmail] = useState("");
    const [motdepasse, setMotdepasse] = useState("");
    console.log("useAuth() →", useAuth());
    const { connexion } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/auth/connexion", {
                email,
                password: motdepasse
            });

            // On suppose que le backend renvoie { token, utilisateur }
            connexion(res.data.token, res.data.utilisateur);
            navigate("/");
        } catch {
            alert("Identifiants incorrects");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h1>Connexion</h1>

            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Votre email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Mot de passe</label>
                <input
                    type="password"
                    placeholder="Votre mot de passe"
                    onChange={(e) => setMotdepasse(e.target.value)}
                />

                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}
