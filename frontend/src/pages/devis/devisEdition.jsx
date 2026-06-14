import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function DevisEdition() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const charger = async () => {
        const res = await api.get(`/devis/${id}`);
        setTitre(res.data.titre);
        setDescription(res.data.description);
        };
        charger();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        await api.put(`/devis/${id}`, { titre, description });

        navigate(`/devis/${id}`);
    };

    return (
        <div>
        <h1>Modifier le devis</h1>

        <form onSubmit={handleSubmit}>
            <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            />
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Enregistrer</button>
        </form>
        </div>
    );
}
