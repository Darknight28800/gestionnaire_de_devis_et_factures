import { useState } from "react";
import axios from "axios";

export default function Support() {
    const [sujet, setSujet] = useState("");
    const [message, setMessage] = useState("");

    const envoyer = () => {
        axios.post("http://localhost:4000/support/tickets", {
        sujet,
        message
        }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
    };

    return (
        <div className="page">
        <h1>Centre d'aide</h1>

        <input
            placeholder="Sujet"
            value={sujet}
            onChange={e => setSujet(e.target.value)}
        />

        <textarea
            placeholder="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
        />

        <button onClick={envoyer}>Envoyer</button>
        </div>
    );
}
