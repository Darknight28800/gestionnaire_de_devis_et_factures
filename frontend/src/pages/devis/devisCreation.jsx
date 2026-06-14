import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function DevisCreation() {
    const navigate = useNavigate();
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        await api.post("/devis", { titre, description });

        navigate("/devis");
    };

    return (
        <div>
        <h1>Créer un devis</h1>

        <form onSubmit={handleSubmit}>
            <input
            placeholder="Titre"
            onChange={(e) => setTitre(e.target.value)}
            />
            <textarea
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Créer</button>
        </form>
        </div>
    );
}
